import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MaterialForm } from "@/components/dashboard/material-form"

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [{ data: material }, { data: enquiries }] = await Promise.all([
    supabase.from("materials").select("*").eq("id", id).single(),
    supabase.from("enquiries").select("id, title").order("title"),
  ])

  if (!material) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/materials/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Material</h1>
          <p className="text-muted-foreground">Update material information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Information</CardTitle>
          <CardDescription>Make changes to the material details</CardDescription>
        </CardHeader>
        <CardContent>
          <MaterialForm enquiries={enquiries || []} material={material} />
        </CardContent>
      </Card>
    </div>
  )
}
