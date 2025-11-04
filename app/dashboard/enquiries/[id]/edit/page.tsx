import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EnquiryForm } from "@/components/dashboard/enquiry-form"

export default async function EditEnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: enquiry }, { data: clients }] = await Promise.all([
    supabase.from("enquiries").select("*").eq("id", id).single(),
    supabase.from("clients").select("id, name, company").order("name"),
  ])

  if (!enquiry) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/enquiries/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Enquiry</h1>
          <p className="text-muted-foreground">Update enquiry information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enquiry Information</CardTitle>
          <CardDescription>Make changes to the enquiry details</CardDescription>
        </CardHeader>
        <CardContent>
          <EnquiryForm clients={clients || []} enquiry={enquiry} />
        </CardContent>
      </Card>
    </div>
  )
}
