import { NextResponse } from "next/server"
import { getDriveHealthStatus } from "@/lib/drive/config"

export async function GET() {
  const healthStatus = getDriveHealthStatus()

  // Always return 200 so UI can handle the status gracefully
  return NextResponse.json(healthStatus, { status: 200 })
}
