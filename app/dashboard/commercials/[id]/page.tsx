import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Pencil, Package, DollarSign } from "lucide-react"

export default async function CommercialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: commercial } = await supabase
    .from("commercials")
    .select(`
      *,
      enquiries (
        id,
        title
      )
    `)
    .eq("id", id)
    .single()

  if (!commercial) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/commercials">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{commercial.item_name}</h1>
            <p className="text-muted-foreground">Commercial item details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/commercials/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quantity & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Quantity</p>
              <p className="text-lg font-semibold">
                {commercial.quantity} {commercial.unit}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Rate</p>
              <p className="text-lg font-semibold">₹{Number(commercial.rate).toLocaleString("en-IN")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-bold">₹{Number(commercial.amount).toLocaleString("en-IN")}</p>
            </div>
          </div>
          {commercial.enquiries && (
            <div>
              <p className="text-sm font-medium">Linked Enquiry</p>
              <Link
                href={`/dashboard/enquiries/${commercial.enquiries.id}`}
                className="text-sm text-primary hover:underline"
              >
                {commercial.enquiries.title}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {commercial.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{commercial.description}</p>
          </CardContent>
        </Card>
      )}

      {commercial.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{commercial.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
