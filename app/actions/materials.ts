"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createMaterial(formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const enquiryId = formData.get("enquiry_id") as string

  const { error } = await supabase.from("materials").insert({
    user_id: user.id,
    enquiry_id: enquiryId === "no-enquiry" ? null : enquiryId,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    quantity: Number(formData.get("quantity")),
    unit: formData.get("unit") as string,
    unit_price: Number(formData.get("unit_price")),
    supplier: formData.get("supplier") as string,
    purchase_date: formData.get("purchase_date") as string,
    notes: formData.get("notes") as string,
  })

  if (error) throw error

  revalidatePath("/dashboard/materials")
  revalidatePath("/dashboard")
}

export async function updateMaterial(id: string, formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const enquiryId = formData.get("enquiry_id") as string

  const { error } = await supabase
    .from("materials")
    .update({
      enquiry_id: enquiryId === "no-enquiry" ? null : enquiryId,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      quantity: Number(formData.get("quantity")),
      unit: formData.get("unit") as string,
      unit_price: Number(formData.get("unit_price")),
      supplier: formData.get("supplier") as string,
      purchase_date: formData.get("purchase_date") as string,
      notes: formData.get("notes") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/materials")
  revalidatePath(`/dashboard/materials/${id}`)
  revalidatePath("/dashboard")
}

export async function deleteMaterial(id: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("materials").delete().eq("id", id).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/materials")
  revalidatePath("/dashboard")
}
