import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Package, DollarSign } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    clients: number
    enquiries: number
    materialsValue: number
    expenses: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Clients",
      value: stats.clients,
      icon: Users,
      description: "Active client relationships",
    },
    {
      title: "Active Enquiries",
      value: stats.enquiries,
      icon: FileText,
      description: "Projects in progress",
    },
    {
      title: "Materials Value",
      value: `$${stats.materialsValue.toLocaleString()}`,
      icon: Package,
      description: "Total materials cost",
    },
    {
      title: "Total Expenses",
      value: `$${stats.expenses.toLocaleString()}`,
      icon: DollarSign,
      description: "Recorded expenses",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
