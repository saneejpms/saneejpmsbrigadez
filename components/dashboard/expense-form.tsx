"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createExpense, updateExpense } from "@/app/actions/expenses"

type Enquiry = {
  id: string
  title: string
}

type ExpenseFormProps = {
  enquiries: Enquiry[]
  expense?: {
    id: string
    enquiry_id: string | null
    category: string
    description: string
    amount: number
    date: string
    receipt_url: string | null
    notes: string | null
  }
}

const expenseCategories = [
  "Labor",
  "Materials",
  "Equipment",
  "Transportation",
  "Utilities",
  "Office Supplies",
  "Marketing",
  "Professional Services",
  "Insurance",
  "Taxes",
  "Maintenance",
  "Other",
]

export function ExpenseForm({ enquiries, expense }: ExpenseFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      if (expense) {
        await updateExpense(expense.id, formData)
      } else {
        await createExpense(formData)
      }
      router.push("/dashboard/expenses")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select name="category" defaultValue={expense?.category} required disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="enquiry_id">Linked Enquiry</Label>
          <Select name="enquiry_id" defaultValue={expense?.enquiry_id || "no-enquiry"} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select an enquiry (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-enquiry">No enquiry</SelectItem>
              {enquiries.map((enquiry) => (
                <SelectItem key={enquiry.id} value={enquiry.id}>
                  {enquiry.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          name="description"
          defaultValue={expense?.description}
          required
          disabled={isLoading}
          placeholder="Brief description of the expense"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            defaultValue={expense?.amount}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={expense?.date || new Date().toISOString().split("T")[0]}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt_url">Receipt URL</Label>
        <Input
          id="receipt_url"
          name="receipt_url"
          type="url"
          defaultValue={expense?.receipt_url || ""}
          disabled={isLoading}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={expense?.notes || ""} disabled={isLoading} rows={3} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : expense ? "Update Expense" : "Create Expense"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
