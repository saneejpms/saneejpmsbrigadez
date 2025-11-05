"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type Enquiry = {
  id: string
  title: string
}

type MaterialFormProps = {
  enquiries: Enquiry[]
  material?: {
    id: string
    enquiry_id: string | null
    name: string
    description: string | null
    quantity: number
    unit: string
    unit_price: number
    supplier: string | null
    purchase_date: string | null
    notes: string | null
  }
}

export function MaterialForm({ enquiries, material }: MaterialFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(material?.quantity.toString() || "")
  const [unitPrice, setUnitPrice] = useState(material?.unit_price.toString() || "")

  const totalPrice = (Number(quantity) || 0) * (Number(unitPrice) || 0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const data = {
      enquiry_id: formData.get("enquiry_id"),
      name: formData.get("name"),
      description: formData.get("description"),
      quantity: formData.get("quantity"),
      unit: formData.get("unit"),
      unit_price: formData.get("unit_price"),
      supplier: formData.get("supplier"),
      purchase_date: formData.get("purchase_date"),
      notes: formData.get("notes"),
    }

    try {
      const url = material ? `/api/materials/${material.id}` : "/api/materials/create"
      const method = material ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save material")
      }

      toast({
        title: "Success",
        description: material ? "Material updated successfully" : "Material created successfully",
      })

      router.push("/dashboard/materials")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Material Name *</Label>
        <Input id="name" name="name" defaultValue={material?.name} required disabled={isLoading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="enquiry_id">Linked Enquiry</Label>
        <Select name="enquiry_id" defaultValue={material?.enquiry_id || "no-enquiry"} disabled={isLoading}>
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
          defaultValue={material?.description || ""}
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
            placeholder="kg, pcs, m, etc."
            defaultValue={material?.unit}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_price">Unit Price (₹) *</Label>
          <Input
            id="unit_price"
            name="unit_price"
            type="number"
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/50 p-4">
        <p className="text-sm font-medium">Total Price</p>
        <p className="text-2xl font-bold">₹{totalPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input id="supplier" name="supplier" defaultValue={material?.supplier || ""} disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input
            id="purchase_date"
            name="purchase_date"
            type="date"
            defaultValue={material?.purchase_date || ""}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={material?.notes || ""} disabled={isLoading} rows={3} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : material ? "Update Material" : "Create Material"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
