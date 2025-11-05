import { google } from "googleapis"

export interface DriveConfig {
  auth: any
  parentFolderId: string
}

export interface DriveHealthStatus {
  ok: boolean
  reason?: "MISSING_SERVICE_ACCOUNT_KEY" | "MISSING_PARENT_FOLDER_ID" | "INVALID_SERVICE_ACCOUNT_KEY"
  message?: string
  details?: string
}

// ... existing code ...

/**
 * Get Drive health status without throwing errors
 * @returns DriveHealthStatus object
 */
export function getDriveHealthStatus(): DriveHealthStatus {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID

  if (!serviceAccountKey) {
    return {
      ok: false,
      reason: "MISSING_SERVICE_ACCOUNT_KEY",
      message: "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set",
    }
  }

  if (!parentFolderId) {
    return {
      ok: false,
      reason: "MISSING_PARENT_FOLDER_ID",
      message: "GOOGLE_DRIVE_PARENT_FOLDER_ID environment variable is not set",
    }
  }

  try {
    // <CHANGE> Enhanced parsing with better error diagnostics
    console.log("[v0] Attempting to parse service account key...")
    console.log("[v0] Key length:", serviceAccountKey.length)
    console.log("[v0] First 50 chars:", serviceAccountKey.substring(0, 50))
    
    // Try to parse the service account key
    // Handle both escaped newlines (\n) and real newlines
    const keyString = serviceAccountKey.replace(/\\n/g, "\n")
    
    console.log("[v0] After newline replacement, first 50 chars:", keyString.substring(0, 50))
    
    const serviceAccount = JSON.parse(keyString)

    console.log("[v0] Successfully parsed JSON")
    console.log("[v0] Has client_email:", !!serviceAccount.client_email)
    console.log("[v0] Has private_key:", !!serviceAccount.private_key)

    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      return {
        ok: false,
        reason: "INVALID_SERVICE_ACCOUNT_KEY",
        message: "Service account key is missing required fields",
        details: `Missing: ${!serviceAccount.client_email ? "client_email " : ""}${!serviceAccount.private_key ? "private_key" : ""}`,
      }
    }

    return { ok: true }
  } catch (error) {
    console.error("[v0] Failed to parse service account key:", error)
    
    // <CHANGE> Provide detailed error information
    let details = ""
    if (error instanceof SyntaxError) {
      details = `JSON parsing error: ${error.message}. Check if the JSON is properly formatted.`
    } else {
      details = error instanceof Error ? error.message : "Unknown error"
    }
    
    return {
      ok: false,
      reason: "INVALID_SERVICE_ACCOUNT_KEY",
      message: "Failed to parse service account key JSON",
      details,
    }
  }
}
</parameter>
</invoke>
