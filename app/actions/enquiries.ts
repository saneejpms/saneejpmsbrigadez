"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createEnquiry(formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const clientId = formData.get("client_id") as string

  const { error } = await supabase.from("enquiries").insert({
    user_id: user.id,
    client_id: clientId || null,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    status: formData.get("status") as string,
    priority: formData.get("priority") as string,
    estimated_value: formData.get("estimated_value") ? Number(formData.get("estimated_value")) : null,
    actual_value: formData.get("actual_value") ? Number(formData.get("actual_value")) : null,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
  })

  if (error) throw error

  revalidatePath("/dashboard/enquiries")
}

export async function updateEnquiry(id: string, formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const clientId = formData.get("client_id") as string

  const { error } = await supabase
    .from("enquiries")
    .update({
      client_id: clientId || null,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      estimated_value: formData.get("estimated_value") ? Number(formData.get("estimated_value")) : null,
      actual_value: formData.get("actual_value") ? Number(formData.get("actual_value")) : null,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/enquiries")
  revalidatePath(`/dashboard/enquiries/${id}`)
}

export async function deleteEnquiry(id: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("enquiries").delete().eq("id", id).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/enquiries")
}
