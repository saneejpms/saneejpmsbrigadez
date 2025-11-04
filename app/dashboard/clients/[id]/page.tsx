import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Pencil, Mail, Phone, Building, MapPin } from "lucide-react"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single()

  if (!client) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">Client details and information</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/clients/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contact Information</CardTitle>
            <Badge variant={client.status === "active" ? "default" : "secondary"}>{client.status}</Badge>
          </div>
          <CardDescription>Primary contact details for this client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {client.company && (
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">{client.company}</p>
              </div>
            </div>
          )}

          {client.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a href={`mailto:${client.email}`} className="text-sm text-primary hover:underline">
                  {client.email}
                </a>
              </div>
            </div>
          )}

          {client.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <a href={`tel:${client.phone}`} className="text-sm text-primary hover:underline">
                  {client.phone}
                </a>
              </div>
            </div>
          )}

          {client.address && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{client.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{client.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
