import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDriveConfig, isDriveConfigured } from "@/lib/drive/config"
import { google } from "googleapis"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { client_id, title, description, due_date, reference_files } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Generate enquiry code (BMC-MMYY-####)
    const now = new Date()
    const monthYear = now.toLocaleDateString("en-IN", { month: "2-digit", year: "2-digit" })

    // Get the count of enquiries this month to generate sequential number
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { count } = await supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth)

    const sequentialNumber = String((count || 0) + 1).padStart(4, "0")
    const enquiry_code = `BMC-${monthYear}-${sequentialNumber}`

    // Insert enquiry
    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .insert({
        user_id: user.id,
        client_id: client_id || null,
        title,
        description: description || null,
        enquiry_code,
        status: "pending",
        priority: "medium",
        start_date: due_date || null,
      })
      .select()
      .single()

    if (enquiryError) {
      console.error("[v0] Enquiry creation error:", enquiryError)
      return NextResponse.json({ error: enquiryError.message }, { status: 500 })
    }

    // Try to create Drive folders if configured
    let driveFolderId: string | null = null
    if (isDriveConfigured()) {
      try {
        const { auth, parentFolderId } = getDriveConfig()
        const drive = google.drive({ version: "v3", auth })

        // Create main enquiry folder
        const folderMetadata = {
          name: `${enquiry_code} - ${title}`,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentFolderId],
        }

        const folder = await drive.files.create({
          requestBody: folderMetadata,
          fields: "id",
        })

        driveFolderId = folder.data.id || null
      } catch (driveError) {
        console.error("[v0] Drive folder creation failed:", driveError)
        // Don't fail the enquiry creation if Drive setup fails
      }
    }

    return NextResponse.json({
      ok: true,
      enquiry_id: enquiry.id,
      enquiry_code: enquiry.enquiry_code,
      drive_folder_id: driveFolderId,
    })
  } catch (error) {
    console.error("[v0] Enquiry creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create enquiry" },
      { status: 500 },
    )
  }
}
