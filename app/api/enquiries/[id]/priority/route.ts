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
    const { is_priority, priority_types } = body

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

    const updateData: any = {
      is_priority,
      priority_rank: is_priority ? priority_rank : null,
    }

    if (is_priority && priority_types && Array.isArray(priority_types)) {
      // Validate all types
      const validTypes = ["drawing", "quote", "work"]
      const filteredTypes = priority_types.filter((t: string) => validTypes.includes(t))
      if (filteredTypes.length > 0) {
        updateData.priority_types = filteredTypes
      } else {
        updateData.priority_types = null
      }
    } else if (!is_priority) {
      updateData.priority_types = null
    }

    console.log("[v0] Updating priority for enquiry:", id, updateData)

    const { data, error } = await supabase.from("enquiries").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Priority update error:", error)
      return NextResponse.json({ error: `Failed to update priority status: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Priority updated successfully:", data)

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
