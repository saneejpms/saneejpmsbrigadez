import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Pencil, Package, DollarSign, Calendar, Building } from "lucide-react"

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: material } = await supabase
    .from("materials")
    .select(`
      *,
      enquiries (
        id,
        title
      )
    `)
    .eq("id", id)
    .single()

  if (!material) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/materials">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{material.name}</h1>
            <p className="text-muted-foreground">Material details and information</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/materials/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quantity & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Quantity</p>
                <p className="text-lg font-semibold">
                  {material.quantity} {material.unit}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Unit Price</p>
                <p className="text-lg font-semibold">₹{Number(material.unit_price).toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Price</p>
                <p className="text-2xl font-bold">₹{Number(material.total_price).toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {material.supplier && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Supplier</p>
                  <p className="text-sm text-muted-foreground">{material.supplier}</p>
                </div>
              </div>
            )}
            {material.purchase_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Purchase Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(material.purchase_date).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
            )}
            {material.enquiries && (
              <div>
                <p className="text-sm font-medium">Linked Enquiry</p>
                <Link
                  href={`/dashboard/enquiries/${material.enquiries.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {material.enquiries.title}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {material.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{material.description}</p>
          </CardContent>
        </Card>
      )}

      {material.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{material.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
