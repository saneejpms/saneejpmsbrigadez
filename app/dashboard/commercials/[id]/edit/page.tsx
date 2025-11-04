import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CommercialForm } from "@/components/dashboard/commercial-form"

export default async function EditCommercialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: commercial }, { data: enquiries }] = await Promise.all([
    supabase.from("commercials").select("*").eq("id", id).single(),
    supabase.from("enquiries").select("id, title").order("title"),
  ])

  if (!commercial) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/commercials/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Commercial</h1>
          <p className="text-muted-foreground">Update commercial information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commercial Information</CardTitle>
          <CardDescription>Make changes to the commercial details</CardDescription>
        </CardHeader>
        <CardContent>
          <CommercialForm enquiries={enquiries || []} commercial={commercial} />
        </CardContent>
      </Card>
    </div>
  )
}
