"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface MilestoneUpdates {
  quote_given?: boolean
  quote_given_at?: string | null
  quote_given_by?: string | null
  advance_invoice_given?: boolean
  advance_invoice_given_at?: string | null
  advance_invoice_given_by?: string | null
  advance_invoice_credited?: boolean
  advance_invoice_credited_at?: string | null
  advance_invoice_credited_by?: string | null
  work_started?: boolean
  work_started_at?: string | null
  work_started_by?: string | null
  work_completed?: boolean
  work_completed_at?: string | null
  work_completed_by?: string | null
  rectification_required?: boolean
  rectification_required_at?: string | null
  rectification_required_by?: string | null
  rectification_note?: string | null
}

export async function getMilestone(enquiryId: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase.from("enquiry_milestones").select("*").eq("enquiry_id", enquiryId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" which is fine
    throw error
  }

  return data
}

export async function updateMilestone(enquiryId: string, updates: MilestoneUpdates) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // First, get the enquiry to verify ownership
  const { data: enquiry, error: enquiryError } = await supabase
    .from("enquiries")
    .select("id")
    .eq("id", enquiryId)
    .eq("user_id", user.id)
    .single()

  if (enquiryError || !enquiry) {
    throw new Error("Enquiry not found or unauthorized")
  }

  // Check if milestone exists
  const { data: existingMilestone } = await supabase
    .from("enquiry_milestones")
    .select("id")
    .eq("enquiry_id", enquiryId)
    .single()

  const milestoneUpdates = {
    ...updates,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  }

  if (existingMilestone) {
    // Update existing milestone
    const { error } = await supabase.from("enquiry_milestones").update(milestoneUpdates).eq("enquiry_id", enquiryId)

    if (error) throw error
  } else {
    // Create new milestone
    const { error } = await supabase.from("enquiry_milestones").insert({
      enquiry_id: enquiryId,
      ...milestoneUpdates,
    })

    if (error) throw error
  }

  revalidatePath(`/dashboard/enquiries/${enquiryId}`)
}

export async function createRectificationTask(enquiryId: string, note: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Create a task for rectification
  const { error } = await supabase.from("schedules").insert({
    user_id: user.id,
    enquiry_id: enquiryId,
    title: "Rectification Work",
    description: note,
    status: "scheduled",
    priority: "high",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  })

  if (error) throw error

  revalidatePath(`/dashboard/enquiries/${enquiryId}`)
}
