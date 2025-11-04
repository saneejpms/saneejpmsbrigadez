import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileText, ExternalLink } from "lucide-react"

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
      )
    `)
    .order("created_at", { ascending: false })

  const totalFiles = driveFiles?.length || 0
  const totalSize = driveFiles?.reduce((sum, file) => sum + (Number(file.size) || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Google Drive Files</h1>
        <p className="text-muted-foreground">View all files uploaded to Google Drive</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
      </div>

      {driveFiles && driveFiles.length > 0 ? (
        <div className="grid gap-4">
          {driveFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <h3 className="font-semibold">{file.file_name}</h3>
                      {file.enquiries && (
                        <Link
                          href={`/dashboard/enquiries/${file.enquiries.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {file.enquiries.title}
                        </Link>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{file.mime_type}</span>
                        {file.size && <span>• {(Number(file.size) / 1024).toFixed(2)} KB</span>}
                        <span>• {new Date(file.created_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Open in Drive
                    <ExternalLink className="h-4 w-4" />
                  </a>
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
              Google Drive integration is ready. Files will be tracked here once uploaded.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
