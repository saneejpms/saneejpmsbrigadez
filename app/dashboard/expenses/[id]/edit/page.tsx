import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseForm } from "@/components/dashboard/expense-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [expenseResult, enquiriesResult] = await Promise.all([
    supabase.from("expenses").select("*").eq("id", id).single(),
    supabase.from("enquiries").select("id, title").order("created_at", { ascending: false }),
  ])

  if (!expenseResult.data) {
    redirect("/dashboard/expenses")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/expenses">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Expense</h1>
          <p className="text-muted-foreground">Update expense details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>Update the expense information</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm enquiries={enquiriesResult.data || []} expense={expenseResult.data} />
        </CardContent>
      </Card>
    </div>
  )
}
