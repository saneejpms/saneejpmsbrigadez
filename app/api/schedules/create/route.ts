import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { enquiry_id, title, description, start_date, end_date, status, priority, notes } = body

    const { data, error } = await supabase
      .from("schedules")
      .insert({
        user_id: user.id,
        enquiry_id: enquiry_id === "no-enquiry" ? null : enquiry_id,
        title,
        description,
        start_date,
        end_date,
        status,
        priority,
        notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
