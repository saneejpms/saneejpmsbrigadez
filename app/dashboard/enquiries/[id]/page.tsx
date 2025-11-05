import React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Pencil, Calendar, DollarSign, User, Upload, CheckCircle2, FileText } from "lucide-react"
import { FileUpload } from "@/components/dashboard/file-upload"
import { EnquiryFiles } from "@/components/dashboard/enquiry-files"
import { MilestoneChecklist } from "@/components/dashboard/milestone-checklist"
import { getMilestone, updateMilestone } from "@/app/actions/milestones"

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [
    enquiryResult,
    materialsResult,
    commercialsResult,
    expensesResult,
    filesResult,
    milestoneResult,
    profileResult,
  ] = await Promise.all([
    supabase
      .from("enquiries")
      .select(`
        *,
        clients (
          id,
          name,
          company,
          email,
          phone
        )
      `)
      .eq("id", id)
      .single(),
    supabase.from("materials").select("total_price").eq("enquiry_id", id),
    supabase.from("commercials").select("total_amount").eq("enquiry_id", id),
    supabase.from("expenses").select("amount").eq("enquiry_id", id),
    supabase.from("drive_files").select("*").eq("enquiry_id", id).order("created_at", { ascending: false }),
    getMilestone(id),
    supabase.from("profiles").select("id, full_name, email").eq("id", user.id).single(),
  ])

  const enquiry = enquiryResult.data
  const files = filesResult.data || []
  const milestone = milestoneResult
  const profile = profileResult.data

  if (!enquiry) {
    notFound()
  }

  const totalMaterials = materialsResult.data?.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) || 0
  const totalCommercials = commercialsResult.data?.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0) || 0
  const totalExpenses = expensesResult.data?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0
  const totalCosts = totalMaterials + totalCommercials + totalExpenses
  const revenue = Number(enquiry.actual_value) || 0
  const profit = revenue - totalCosts

  const statusColors = {
    pending: "secondary",
    in_progress: "default",
    completed: "default",
    cancelled: "destructive",
  } as const

  const priorityColors = {
    low: "secondary",
    medium: "default",
    high: "default",
    urgent: "destructive",
  } as const

  const MilestoneChecklistWrapper = () => {
    "use client"
    const [isUpdating, setIsUpdating] = React.useState(false)

    const handleMilestoneUpdate = async (updates: any) => {
      setIsUpdating(true)
      try {
        await updateMilestone(id, updates)
      } finally {
        setIsUpdating(false)
      }
    }

    return (
      <MilestoneChecklist
        milestone={milestone}
        currentUser={profile ? { id: profile.id, full_name: profile.full_name || "" } : null}
        onUpdate={handleMilestoneUpdate}
        userRole="Admin" // TODO: Get actual user role from profile
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/enquiries">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{enquiry.title}</h1>
            <p className="text-muted-foreground">Enquiry details and information</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/enquiries/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status & Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={statusColors[enquiry.status as keyof typeof statusColors]} className="mt-1">
                    {enquiry.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <Badge variant={priorityColors[enquiry.priority as keyof typeof priorityColors]} className="mt-1">
                    {enquiry.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Estimated Value</p>
                    <p className="text-lg font-semibold">
                      {enquiry.estimated_value
                        ? `₹${Number(enquiry.estimated_value).toLocaleString("en-IN")}`
                        : "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Actual Value</p>
                    <p className="text-lg font-semibold">
                      {enquiry.actual_value ? `₹${Number(enquiry.actual_value).toLocaleString("en-IN")}` : "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Materials Cost</span>
                  <span className="font-medium">
                    ₹{totalMaterials.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Commercials Cost</span>
                  <span className="font-medium">
                    ₹{totalCommercials.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expenses</span>
                  <span className="font-medium">
                    ₹{totalExpenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium">Total Costs</span>
                  <span className="font-semibold">
                    ₹{totalCosts.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Revenue</span>
                  <span className="font-semibold">
                    ₹{revenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-base font-semibold">Profit/Loss</span>
                  <span className={`text-xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {profit >= 0 ? "+" : ""}₹{profit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                {revenue > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Profit Margin</span>
                    <span className={`font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {((profit / revenue) * 100).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {enquiry.clients && (
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <Link
                      href={`/dashboard/clients/${enquiry.clients.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {enquiry.clients.name}
                    </Link>
                  </div>
                </div>
                {enquiry.clients.company && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Company</p>
                    <p className="text-sm">{enquiry.clients.company}</p>
                  </div>
                )}
                {enquiry.clients.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <a href={`mailto:${enquiry.clients.email}`} className="text-sm text-primary hover:underline">
                      {enquiry.clients.email}
                    </a>
                  </div>
                )}
                {enquiry.clients.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <a href={`tel:${enquiry.clients.phone}`} className="text-sm text-primary hover:underline">
                      {enquiry.clients.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {enquiry.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{enquiry.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {enquiry.start_date ? new Date(enquiry.start_date).toLocaleDateString("en-IN") : "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">
                    {enquiry.end_date ? new Date(enquiry.end_date).toLocaleDateString("en-IN") : "Not set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <MilestoneChecklistWrapper />
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload enquiryId={id} />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Uploaded Files</h2>
            <EnquiryFiles files={files} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
