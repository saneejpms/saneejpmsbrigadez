import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/dashboard/user-form"

export default async function NewUserPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect("/auth/login")
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
          <p className="text-muted-foreground">Add a new user account to the system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Enter the information for the new user account</CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("[v0] Unexpected error in create user page:", error)
    redirect("/auth/login")
  }
}
