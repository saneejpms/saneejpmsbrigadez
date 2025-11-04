import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScheduleForm } from "@/components/dashboard/schedule-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function EditSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [scheduleResult, enquiriesResult] = await Promise.all([
    supabase.from("schedules").select("*").eq("id", id).single(),
    supabase.from("enquiries").select("id, title").order("created_at", { ascending: false }),
  ])

  if (!scheduleResult.data) {
    redirect("/dashboard/schedules")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/schedules">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Schedule</h1>
          <p className="text-muted-foreground">Update schedule details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
          <CardDescription>Update the schedule information</CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleForm enquiries={enquiriesResult.data || []} schedule={scheduleResult.data} />
        </CardContent>
      </Card>
    </div>
  )
}
