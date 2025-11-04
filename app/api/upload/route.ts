import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if Google Drive is configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID) {
      return NextResponse.json(
        { error: "Google Drive is not configured. Please add required environment variables." },
        { status: 500 },
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const enquiryId = formData.get("enquiryId") as string | null
    const clientId = formData.get("clientId") as string | null // Added client_id support
    const fileType = formData.get("fileType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Initialize Google Drive API
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    })

    const drive = google.drive({ version: "v3", auth })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: buffer,
      },
      fields: "id, name, mimeType, size, webViewLink",
    })

    const driveFile = driveResponse.data

    const { data: dbFile, error: dbError } = await supabase
      .from("drive_files")
      .insert({
        enquiry_id: enquiryId || null,
        client_id: clientId || null,
        file_type: fileType || "other",
        file_name: driveFile.name,
        drive_file_id: driveFile.id,
        drive_url: driveFile.webViewLink,
        file_size: driveFile.size ? Number.parseInt(driveFile.size) : null,
        user_id: user.id,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      file: dbFile,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 },
    )
  }
}
