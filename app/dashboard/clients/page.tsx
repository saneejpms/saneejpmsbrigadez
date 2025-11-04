import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ClientsTable } from "@/components/dashboard/clients-table"

export default async function ClientsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: clients } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      {clients && clients.length > 0 ? (
        <ClientsTable clients={clients} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No clients yet</CardTitle>
            <CardDescription>Get started by adding your first client</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Client
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
