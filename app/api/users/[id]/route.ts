import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get auth user email
    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(params.id)

    if (authUserError) {
      return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 })
    }

    return NextResponse.json({
      id: profile.id,
      email: authUser.user.email,
      full_name: profile.full_name,
      role: profile.role,
    })
  } catch (error) {
    console.error("[v0] Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ error: "Only admins can update users" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, full_name, role } = body

    // Update auth user email if changed
    if (email) {
      const { error: emailError } = await supabase.auth.admin.updateUserById(params.id, {
        email,
      })

      if (emailError) {
        console.error("[v0] Error updating email:", emailError)
        return NextResponse.json({ error: emailError.message }, { status: 400 })
      }
    }

    // Update password if provided
    if (password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(params.id, {
        password,
      })

      if (passwordError) {
        console.error("[v0] Error updating password:", passwordError)
        return NextResponse.json({ error: passwordError.message }, { status: 400 })
      }
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name,
        role,
      })
      .eq("id", params.id)

    if (profileError) {
      console.error("[v0] Error updating profile:", profileError)
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: params.id,
        email,
        full_name,
        role,
      },
    })
  } catch (error) {
    console.error("[v0] Unexpected error in user update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
