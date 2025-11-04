"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createSchedule(formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const enquiryId = formData.get("enquiry_id") as string

  const { error } = await supabase.from("schedules").insert({
    user_id: user.id,
    enquiry_id: enquiryId === "no-enquiry" ? null : enquiryId,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    status: formData.get("status") as string,
    priority: formData.get("priority") as string,
    notes: formData.get("notes") as string,
  })

  if (error) throw error

  revalidatePath("/dashboard/schedules")
  revalidatePath("/dashboard")
}

export async function updateSchedule(id: string, formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const enquiryId = formData.get("enquiry_id") as string

  const { error } = await supabase
    .from("schedules")
    .update({
      enquiry_id: enquiryId === "no-enquiry" ? null : enquiryId,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      notes: formData.get("notes") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/schedules")
  revalidatePath("/dashboard")
}

export async function deleteSchedule(id: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("schedules").delete().eq("id", id).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/schedules")
  revalidatePath("/dashboard")
}
