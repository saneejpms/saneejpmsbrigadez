"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCommercial, updateCommercial } from "@/app/actions/commercials"

type Enquiry = {
  id: string
  title: string
}

type CommercialFormProps = {
  enquiries: Enquiry[]
  commercial?: {
    id: string
    enquiry_id: string | null
    item_name: string
    description: string | null
    quantity: number
    unit: string
    rate: number
    notes: string | null
  }
}

export function CommercialForm({ enquiries, commercial }: CommercialFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(commercial?.quantity.toString() || "")
  const [rate, setRate] = useState(commercial?.rate.toString() || "")

  const amount = (Number(quantity) || 0) * (Number(rate) || 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      if (commercial) {
        await updateCommercial(commercial.id, formData)
      } else {
        await createCommercial(formData)
      }
      router.push("/dashboard/commercials")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="item_name">Item Name *</Label>
        <Input id="item_name" name="item_name" defaultValue={commercial?.item_name} required disabled={isLoading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="enquiry_id">Linked Enquiry</Label>
        <Select name="enquiry_id" defaultValue={commercial?.enquiry_id || "no-enquiry"} disabled={isLoading}>
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={commercial?.description || ""}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            name="unit"
            placeholder="pcs, hrs, sqft, etc."
            defaultValue={commercial?.unit}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rate">Rate (₹) *</Label>
          <Input
            id="rate"
            name="rate"
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/50 p-4">
        <p className="text-sm font-medium">Total Amount</p>
        <p className="text-2xl font-bold">₹{amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={commercial?.notes || ""} disabled={isLoading} rows={3} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : commercial ? "Update Commercial" : "Create Commercial"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
