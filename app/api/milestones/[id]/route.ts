import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await request.json()

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update the milestone
    const { error } = await supabase.from("enquiry_milestones").update(updates).eq("enquiry_id", id)

    if (error) {
      console.error("[v0] Milestone update error:", error)
      return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Milestone updated successfully",
    })
  } catch (error) {
    console.error("[v0] Milestone API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
