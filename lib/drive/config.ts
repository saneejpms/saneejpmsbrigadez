import { google } from "googleapis"

export interface DriveConfig {
  auth: any
  parentFolderId: string
}

export interface DriveHealthStatus {
  ok: boolean
  reason?: "MISSING_SERVICE_ACCOUNT_KEY" | "MISSING_PARENT_FOLDER_ID" | "INVALID_SERVICE_ACCOUNT_KEY"
  message?: string
}

/**
 * Check if Google Drive is properly configured
 * @returns boolean indicating if Drive is configured
 */
export function isDriveConfigured(): boolean {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID)
}

/**
 * Get Drive configuration with proper validation
 * @throws Error if configuration is missing or invalid
 * @returns DriveConfig object with auth and parentFolderId
 */
export function getDriveConfig(): DriveConfig {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID

  if (!serviceAccountKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set")
  }

  if (!parentFolderId) {
    throw new Error("GOOGLE_DRIVE_PARENT_FOLDER_ID environment variable is not set")
  }

  try {
    // Parse the service account key JSON
    // Handle both escaped newlines (\n) and real newlines
    const keyString = serviceAccountKey.replace(/\\n/g, "\n")
    const serviceAccount = JSON.parse(keyString)

    // Validate required fields
    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error("Invalid service account key: missing required fields")
    }

    // Create JWT auth client
    const auth = new google.auth.JWT(serviceAccount.client_email, undefined, serviceAccount.private_key, [
      "https://www.googleapis.com/auth/drive.file",
    ])

    return {
      auth,
      parentFolderId,
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY: JSON parsing failed")
    }
    throw error
  }
}

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
    // Try to parse the service account key
    const keyString = serviceAccountKey.replace(/\\n/g, "\n")
    const serviceAccount = JSON.parse(keyString)

    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      return {
        ok: false,
        reason: "INVALID_SERVICE_ACCOUNT_KEY",
        message: "Service account key is missing required fields",
      }
    }

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      reason: "INVALID_SERVICE_ACCOUNT_KEY",
      message: "Failed to parse service account key JSON",
    }
  }
}
