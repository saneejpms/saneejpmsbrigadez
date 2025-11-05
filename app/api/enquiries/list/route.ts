import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: enquiries, error } = await supabase
      .from("enquiries")
      .select(
        `
        id,
        enquiry_code,
        title,
        status,
        created_at,
        is_priority,
        client:clients(name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("[v0] Enquiries fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ enquiries })
  } catch (error) {
    console.error("[v0] Enquiries list error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch enquiries" },
      { status: 500 },
    )
  }
}
