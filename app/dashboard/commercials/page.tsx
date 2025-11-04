import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { CommercialsTable } from "@/components/dashboard/commercials-table"

export default async function CommercialsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: commercials } = await supabase
    .from("commercials")
    .select(`
      *,
      enquiries (
        id,
        title
      )
    `)
    .order("created_at", { ascending: false })

  const totalAmount = commercials?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commercials</h1>
          <p className="text-muted-foreground">Track commercial items and billing</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/commercials/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Commercial
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Commercial Amount</CardTitle>
          <CardDescription>Sum of all commercial items</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">₹{totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
        </CardContent>
      </Card>

      {commercials && commercials.length > 0 ? (
        <CommercialsTable commercials={commercials} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No commercials yet</CardTitle>
            <CardDescription>Get started by adding your first commercial item</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/commercials/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Commercial
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
