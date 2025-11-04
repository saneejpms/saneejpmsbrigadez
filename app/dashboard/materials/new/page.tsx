import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MaterialForm } from "@/components/dashboard/material-form"

export default async function NewMaterialPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: enquiries } = await supabase.from("enquiries").select("id, title").order("title")

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Material</h1>
        <p className="text-muted-foreground">Record a new material purchase</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Information</CardTitle>
          <CardDescription>Enter the details for the new material</CardDescription>
        </CardHeader>
        <CardContent>
          <MaterialForm enquiries={enquiries || []} />
        </CardContent>
      </Card>
    </div>
  )
}
