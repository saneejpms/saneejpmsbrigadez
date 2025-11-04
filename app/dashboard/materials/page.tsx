import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { MaterialsTable } from "@/components/dashboard/materials-table"

export default async function MaterialsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: materials } = await supabase
    .from("materials")
    .select(`
      *,
      enquiries (
        id,
        title
      )
    `)
    .order("created_at", { ascending: false })

  const totalCost = materials?.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Materials</h1>
          <p className="text-muted-foreground">Track materials and inventory costs</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/materials/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Material
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Materials Cost</CardTitle>
          <CardDescription>Sum of all material purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">₹{totalCost.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
        </CardContent>
      </Card>

      {materials && materials.length > 0 ? (
        <MaterialsTable materials={materials} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No materials yet</CardTitle>
            <CardDescription>Get started by adding your first material</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/materials/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Material
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
