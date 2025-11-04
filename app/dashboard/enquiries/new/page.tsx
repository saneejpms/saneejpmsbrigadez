import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EnquiryForm } from "@/components/dashboard/enquiry-form"

export default async function NewEnquiryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: clients } = await supabase.from("clients").select("id, name, company").order("name")

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Enquiry</h1>
        <p className="text-muted-foreground">Create a new project enquiry</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enquiry Information</CardTitle>
          <CardDescription>Enter the details for the new enquiry</CardDescription>
        </CardHeader>
        <CardContent>
          <EnquiryForm clients={clients || []} />
        </CardContent>
      </Card>
    </div>
  )
}
