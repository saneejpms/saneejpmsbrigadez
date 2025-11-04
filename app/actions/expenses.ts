"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createExpense(formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const enquiryId = formData.get("enquiry_id") as string

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    enquiry_id: enquiryId === "no-enquiry" ? null : enquiryId,
    category: formData.get("category") as string,
    description: formData.get("description") as string,
    amount: Number(formData.get("amount")),
    date: formData.get("date") as string,
    receipt_url: formData.get("receipt_url") as string,
    notes: formData.get("notes") as string,
  })

  if (error) throw error

  revalidatePath("/dashboard/expenses")
  revalidatePath("/dashboard")
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const enquiryId = formData.get("enquiry_id") as string

  const { error } = await supabase
    .from("expenses")
    .update({
      enquiry_id: enquiryId === "no-enquiry" ? null : enquiryId,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount: Number(formData.get("amount")),
      date: formData.get("date") as string,
      receipt_url: formData.get("receipt_url") as string,
      notes: formData.get("notes") as string,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/expenses")
  revalidatePath("/dashboard")
}

export async function deleteExpense(id: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard/expenses")
  revalidatePath("/dashboard")
}
