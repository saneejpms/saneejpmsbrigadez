import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, ExternalLink, Calendar, FolderOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function DriveFilesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: driveFiles } = await supabase
    .from("drive_files")
    .select(`
      *,
      enquiries (
        id,
        title
      ),
      clients (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false })

  const totalFiles = driveFiles?.length || 0
  const totalSize = driveFiles?.reduce((sum, file) => sum + (Number(file.file_size) || 0), 0) || 0

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
    if (!bytes) return "Unknown"
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Google Drive Files</h1>
        <p className="text-muted-foreground">All files uploaded to Google Drive from the system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Files</CardTitle>
            <CardDescription>Number of files stored</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalFiles}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Storage</CardTitle>
            <CardDescription>Combined file size</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{(totalSize / (1024 * 1024)).toFixed(2)} MB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Types</CardTitle>
            <CardDescription>Unique file categories</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{driveFiles ? new Set(driveFiles.map((f) => f.file_type)).size : 0}</p>
          </CardContent>
        </Card>
      </div>

      {driveFiles && driveFiles.length > 0 ? (
        <div className="space-y-3">
          {driveFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{file.file_name}</h3>
                        <Badge variant={getFileTypeBadge(file.file_type)}>{formatFileType(file.file_type)}</Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        {file.enquiries ? (
                          <Link
                            href={`/dashboard/enquiries/${file.enquiries.id}`}
                            className="text-primary hover:underline"
                          >
                            Enquiry: {file.enquiries.title}
                          </Link>
                        ) : file.clients ? (
                          <Link href={`/dashboard/clients/${file.clients.id}`} className="text-primary hover:underline">
                            Client: {file.clients.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">General file</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
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
                    <Button variant="outline" size="sm" asChild className="flex-shrink-0 bg-transparent">
                      <a href={file.drive_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No files yet</CardTitle>
            <CardDescription>Files uploaded through the system will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload files from enquiry or client pages to see them listed here. All files are stored securely in Google
              Drive.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
