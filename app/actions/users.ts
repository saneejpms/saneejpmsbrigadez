"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createUser(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const full_name = formData.get("full_name") as string
  const role = formData.get("role") as string

  // Create auth user using admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    throw new Error(authError.message)
  }

  // Update profile with additional info
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name,
      role,
    })
    .eq("id", authData.user.id)

  if (profileError) {
    throw new Error(profileError.message)
  }

  revalidatePath("/dashboard/users")
}

export async function deleteUser(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.admin.deleteUser(id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/users")
}
