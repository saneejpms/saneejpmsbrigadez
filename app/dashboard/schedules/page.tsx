import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, CalendarIcon } from "lucide-react"
import { SchedulesTable } from "@/components/dashboard/schedules-table"

export default async function SchedulesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: schedules } = await supabase
    .from("schedules")
    .select(`
      *,
      enquiries (
        id,
        title
      )
    `)
    .order("start_date", { ascending: true })

  const now = new Date()
  const upcomingSchedules = schedules?.filter((s) => new Date(s.start_date) >= now) || []
  const pastSchedules = schedules?.filter((s) => new Date(s.start_date) < now) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
          <p className="text-muted-foreground">Manage project timelines and schedules</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/schedules/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedules</CardTitle>
            <CardDescription>Schedules starting from today onwards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{upcomingSchedules.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Schedules</CardTitle>
            <CardDescription>Completed or past schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{pastSchedules.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {schedules && schedules.length > 0 ? (
        <SchedulesTable schedules={schedules} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No schedules yet</CardTitle>
            <CardDescription>Get started by adding your first schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/schedules/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Schedule
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
