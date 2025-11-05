import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create users" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, full_name, role } = body

    // Validate required fields
    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create auth user using admin API
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    })

    if (createError) {
      console.error("[v0] Error creating auth user:", createError)
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Update profile with additional info
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name,
        role: role || "user",
      })
      .eq("id", authData.user.id)

    if (profileError) {
      console.error("[v0] Error updating profile:", profileError)
      // Try to clean up the auth user if profile update fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        role: role || "user",
      },
    })
  } catch (error) {
    console.error("[v0] Unexpected error in user creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
