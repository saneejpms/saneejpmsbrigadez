import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Users, FileText, Package, DollarSign } from "lucide-react"
import { PriorityListButton } from "@/components/dashboard/priority-list-button"
import { AddEnquiryFAB } from "@/components/dashboard/add-enquiry-fab"
import { EnquiriesList } from "@/components/dashboard/enquiries-list"

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
      description: "Active relationships",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Active Enquiries",
      value: enquiriesCount.count || 0,
      icon: FileText,
      description: "In progress",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Materials Value",
      value: `₹${totalMaterials.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: Package,
      description: "Total invested",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Total Expenses",
      value: `₹${totalExpenses.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      description: "Recorded costs",
      color: "from-orange-500 to-orange-600",
    },
  ]

  return (
    <div className="space-y-6 pb-mobile-nav">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddEnquiryFAB />
          <PriorityListButton />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="stat-card animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="stat-value mb-2">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Enquiries */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <EnquiriesList />
      </div>
    </div>
  )
}
