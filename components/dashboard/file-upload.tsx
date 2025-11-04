"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Select File</Label>
        <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={uploading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fileType">File Type</Label>
        <Select value={fileType} onValueChange={setFileType} disabled={uploading}>
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

      <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
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
  )
}
