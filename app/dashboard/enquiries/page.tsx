import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { EnquiriesTable } from "@/components/dashboard/enquiries-table"

export default async function EnquiriesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: enquiries } = await supabase
    .from("enquiries")
    .select(`
      *,
      clients (
        id,
        name,
        company
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enquiries</h1>
          <p className="text-muted-foreground">Manage project enquiries and track progress</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/enquiries/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Enquiry
          </Link>
        </Button>
      </div>

      {enquiries && enquiries.length > 0 ? (
        <EnquiriesTable enquiries={enquiries} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No enquiries yet</CardTitle>
            <CardDescription>Get started by adding your first enquiry</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/enquiries/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Enquiry
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
