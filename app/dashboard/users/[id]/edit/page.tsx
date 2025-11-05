import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/dashboard/user-form"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect("/auth/login")
    }

    // Fetch user data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/users/${params.id}`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      redirect("/dashboard/users")
    }

    const userData = await response.json()

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">Update user account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Update the information for this user account</CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm userId={params.id} initialData={userData} />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("[v0] Unexpected error in edit user page:", error)
    redirect("/dashboard/users")
  }
}
