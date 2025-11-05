import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { is_priority } = body

    if (typeof is_priority !== "boolean") {
      return NextResponse.json({ error: "is_priority must be a boolean" }, { status: 400 })
    }

    // If adding to priority list, get the max rank and add 1
    let priority_rank: number | null = null
    if (is_priority) {
      const { data: maxRankData } = await supabase
        .from("enquiries")
        .select("priority_rank")
        .eq("is_priority", true)
        .order("priority_rank", { ascending: false, nullsFirst: false })
        .limit(1)
        .single()

      priority_rank = (maxRankData?.priority_rank || 0) + 1
    }

    // Update the enquiry
    const { data, error } = await supabase
      .from("enquiries")
      .update({
        is_priority,
        priority_rank: is_priority ? priority_rank : null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Priority update error:", error)
      return NextResponse.json({ error: "Failed to update priority status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      enquiry: data,
      message: is_priority ? "Added to priority list" : "Removed from priority list",
    })
  } catch (error) {
    console.error("[v0] Priority API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
