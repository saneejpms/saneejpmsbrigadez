import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ExpensesTable } from "@/components/dashboard/expenses-table"

export default async function ExpensesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select(`
      *,
      enquiries (
        id,
        title
      )
    `)
    .order("date", { ascending: false })

  const totalExpenses = expenses?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track all project and business expenses</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/expenses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
          <CardDescription>Sum of all recorded expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
        </CardContent>
      </Card>

      {expenses && expenses.length > 0 ? (
        <ExpensesTable expenses={expenses} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No expenses yet</CardTitle>
            <CardDescription>Get started by adding your first expense</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/expenses/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
