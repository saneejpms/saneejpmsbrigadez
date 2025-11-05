"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FileUploadProps {
  enquiryId?: string
  clientId?: string // Added client_id support
}

export function FileUpload({ enquiryId, clientId }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<string>("other")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [driveHealth, setDriveHealth] = useState<{
    ok: boolean
    reason?: string
    message?: string
  } | null>(null)
  const [checkingHealth, setCheckingHealth] = useState(true)

  useEffect(() => {
    checkDriveHealth()
  }, [])

  const checkDriveHealth = async () => {
    setCheckingHealth(true)
    try {
      const response = await fetch("/api/drive/health")
      const data = await response.json()
      setDriveHealth(data)
    } catch (error) {
      console.error("[v0] Failed to check Drive health:", error)
      setDriveHealth({ ok: false, message: "Failed to check Drive status" })
    } finally {
      setCheckingHealth(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (enquiryId) formData.append("enquiryId", enquiryId)
      if (clientId) formData.append("clientId", clientId) // Include client_id in upload
      formData.append("fileType", fileType)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setFile(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const isDriveConfigured = driveHealth?.ok ?? false

  return (
    <div className="space-y-4">
      {checkingHealth ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking Google Drive status...
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Google Drive Status:</span>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      {driveHealth?.ok ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-success font-medium">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-destructive" />
                          <span className="text-destructive font-medium">Not Configured</span>
                        </>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{driveHealth?.message || "Drive configuration status"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {!isDriveConfigured && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Google Drive is not configured. Contact your administrator to add the required environment variables.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="file">Select File</Label>
        <Input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={uploading || !isDriveConfigured}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fileType">File Type</Label>
        <Select value={fileType} onValueChange={setFileType} disabled={uploading || !isDriveConfigured}>
          <SelectTrigger id="fileType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reference">Reference</SelectItem>
            <SelectItem value="quote">Quote</SelectItem>
            <SelectItem value="tax_invoice">Tax Invoice</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="purchase_doc">Purchase Document</SelectItem>
            <SelectItem value="drawing">Drawing</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="agreement">Agreement</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button onClick={handleUpload} disabled={!file || uploading || !isDriveConfigured} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload to Google Drive
                  </>
                )}
              </Button>
            </div>
          </TooltipTrigger>
          {!isDriveConfigured && <TooltipContent>Google Drive must be configured to enable uploads</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
