import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch priority enquiries with client info
    const { data, error } = await supabase
      .from("enquiries")
      .select(`
        id,
        code,
        job_name,
        stage,
        due_date,
        priority_rank,
        clients (
          name
        )
      `)
      .eq("is_priority", true)
      .order("priority_rank", { ascending: true, nullsFirst: false })

    if (error) {
      console.error("[v0] Priority list fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch priority list" }, { status: 500 })
    }

    // Transform data to include client_name
    const enquiries = data.map((e: any) => ({
      id: e.id,
      code: e.code,
      job_name: e.job_name,
      client_name: e.clients?.name || "Unknown",
      stage: e.stage,
      due_date: e.due_date,
      priority_rank: e.priority_rank,
    }))

    return NextResponse.json({
      success: true,
      enquiries,
    })
  } catch (error) {
    console.error("[v0] Priority list API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
