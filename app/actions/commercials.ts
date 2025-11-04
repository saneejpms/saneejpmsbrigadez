"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCommercial(formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const enquiryId = formData.get("enquiry_id") as string

  const { error } = await supabase.from("commercials").insert({
    user_id: user.id,
    enquiry_id: enquiryId === "no-enquiry" ? null : enquiryId,
    item_name: formData.get("item_name") as string,
    description: formData.get("description") as string,
    quantity: Number(formData.get("quantity")),
    unit: formData.get("unit") as string,
    rate: Number(formData.get("rate")),
    notes: formData.get("notes") as string,
  })

  if (error) throw error

  revalidatePath("/dashboard/commercials")
}

export async function updateCommercial(id: string, formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const enquiryId = formData.get("enquiry_id") as string

  const { error } = await supabase
    .from("commercials")
    .update({
      enquiry_id: enquiryId === "no-enquiry" ? null : enquiryId,
      item_name: formData.get("item_name") as string,
      description: formData.get("description") as string,
      quantity: Number(formData.get("quantity")),
      unit: formData.get("unit") as string,
      rate: Number(formData.get("rate")),
      notes: formData.get("notes") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/commercials")
  revalidatePath(`/dashboard/commercials/${id}`)
}

export async function deleteCommercial(id: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("commercials").delete().eq("id", id).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/commercials")
}
