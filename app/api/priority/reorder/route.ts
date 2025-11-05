import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface ReorderItem {
  enquiry_id: string
  priority_rank: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body as { items: ReorderItem[] }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 })
    }

    // Validate items structure
    for (const item of items) {
      if (!item.enquiry_id || typeof item.priority_rank !== "number") {
        return NextResponse.json({ error: "Each item must have enquiry_id and priority_rank" }, { status: 400 })
      }
    }

    // Update all items in a transaction-like manner
    const updates = items.map(
      (item) =>
        supabase
          .from("enquiries")
          .update({ priority_rank: item.priority_rank })
          .eq("id", item.enquiry_id)
          .eq("is_priority", true), // Only update if it's in priority list
    )

    const results = await Promise.all(updates)

    // Check for errors
    const errors = results.filter((r) => r.error)
    if (errors.length > 0) {
      console.error("[v0] Reorder errors:", errors)
      return NextResponse.json({ error: "Failed to reorder some items" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Priority list reordered successfully",
      updated: items.length,
    })
  } catch (error) {
    console.error("[v0] Reorder API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
