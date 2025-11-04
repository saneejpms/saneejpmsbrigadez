import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Package, DollarSign } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [clientsCount, enquiriesCount, materialsData, expensesData] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("enquiries").select("id", { count: "exact", head: true }),
    supabase.from("materials").select("total_price"),
    supabase.from("expenses").select("amount"),
  ])

  const totalMaterials = materialsData.data?.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) || 0
  const totalExpenses = expensesData.data?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0

  const stats = [
    {
      title: "Total Clients",
      value: clientsCount.count || 0,
      icon: Users,
      description: "Active clients in your system",
    },
    {
      title: "Active Enquiries",
      value: enquiriesCount.count || 0,
      icon: FileText,
      description: "Ongoing project enquiries",
    },
    {
      title: "Materials Cost",
      value: `₹${totalMaterials.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: Package,
      description: "Total materials purchased",
    },
    {
      title: "Total Expenses",
      value: `₹${totalExpenses.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      description: "All recorded expenses",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
