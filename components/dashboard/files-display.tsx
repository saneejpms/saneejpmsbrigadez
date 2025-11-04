import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FilesDisplayProps {
  enquiryId?: string
  clientId?: string
}

export async function FilesDisplay({ enquiryId, clientId }: FilesDisplayProps) {
  const supabase = await createClient()

  let query = supabase.from("drive_files").select("*").order("created_at", { ascending: false })

  if (enquiryId) {
    query = query.eq("enquiry_id", enquiryId)
  }

  if (clientId) {
    query = query.eq("client_id", clientId)
  }

  const { data: files } = await query

  if (!files || files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>No files uploaded yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getFileTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      reference: "secondary",
      quote: "default",
      tax_invoice: "destructive",
      invoice: "destructive",
      purchase_doc: "outline",
      drawing: "secondary",
      contract: "default",
      agreement: "default",
      other: "outline",
    }
    return variants[type] || "outline"
  }

  const formatFileType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size"
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files ({files.length})</CardTitle>
        <CardDescription>Documents uploaded to Google Drive</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{file.file_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant={getFileTypeBadge(file.file_type)}>{formatFileType(file.file_type)}</Badge>
                    <span>•</span>
                    <span>{formatFileSize(file.file_size)}</span>
                    {file.created_at && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {file.drive_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={file.drive_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
