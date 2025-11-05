import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { compressPdf } from "@/lib/pdf-compression"
import { getDriveConfig, isDriveConfigured } from "@/lib/drive/config"

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

    if (!isDriveConfigured()) {
      return NextResponse.json(
        { error: "Google Drive is not configured. Please add required environment variables." },
        { status: 500 },
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const enquiryId = formData.get("enquiryId") as string | null
    const clientId = formData.get("clientId") as string | null
    const fileType = formData.get("fileType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const { auth, parentFolderId } = getDriveConfig()
    const drive = google.drive({ version: "v3", auth })

    // Convert file to buffer
    let buffer = Buffer.from(await file.arrayBuffer())
    const originalSize = buffer.length
    let wasCompressed = false
    let compressionMethod: string | null = null
    let compressedSize = buffer.length

    const minCompressionBytes = Number(process.env.PDF_COMPRESSION_MIN_BYTES) || 2_000_000
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")

    if (isPdf && originalSize > minCompressionBytes) {
      console.log("[v0] Starting PDF compression for:", file.name)
      const compressionResult = await compressPdf(buffer, minCompressionBytes)

      if (compressionResult.success && compressionResult.compressedSize < originalSize) {
        buffer = compressionResult.compressedBuffer!
        wasCompressed = true
        compressionMethod = compressionResult.method
        compressedSize = compressionResult.compressedSize
        console.log(`[v0] PDF compressed: ${(compressionResult.compressionRatio || 0).toFixed(2)}% reduction`)
      } else {
        console.log("[v0] Compression not effective or failed, using original file")
      }
    }

    // Upload to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [parentFolderId],
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
        file_type: fileType || "other",
        file_name: driveFile.name,
        drive_file_id: driveFile.id,
        drive_url: driveFile.webViewLink,
        file_url: driveFile.webViewLink,
        file_size: driveFile.size ? Number.parseInt(driveFile.size) : null,
        user_id: user.id,
        original_size_bytes: originalSize,
        stored_size_bytes: compressedSize,
        was_compressed: wasCompressed,
        compression_method: compressionMethod,
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
      message: wasCompressed
        ? `File uploaded successfully and compressed by ${(((originalSize - compressedSize) / originalSize) * 100).toFixed(1)}%`
        : "File uploaded successfully",
      compressed: wasCompressed,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 },
    )
  }
}
