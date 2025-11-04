import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CommercialForm } from "@/components/dashboard/commercial-form"

export default async function NewCommercialPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Add New Commercial</h1>
        <p className="text-muted-foreground">Record a new commercial item</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commercial Information</CardTitle>
          <CardDescription>Enter the details for the new commercial item</CardDescription>
        </CardHeader>
        <CardContent>
          <CommercialForm enquiries={enquiries || []} />
        </CardContent>
      </Card>
    </div>
  )
}
