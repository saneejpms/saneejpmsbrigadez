"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EnquiryFile {
  id: string
  file_name: string
  file_type: string
  file_url: string
  mime_type: string
  size: string
  created_at: string
}

interface EnquiryFilesProps {
  files: EnquiryFile[]
}

const fileTypeLabels: Record<string, string> = {
  reference: "Reference",
  quote: "Quote",
  tax_invoice: "Tax Invoice",
  invoice: "Invoice",
  purchase_doc: "Purchase Document",
  drawing: "Drawing",
  other: "Other",
}

const fileTypeColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  reference: "secondary",
  quote: "default",
  tax_invoice: "default",
  invoice: "default",
  purchase_doc: "outline",
  drawing: "secondary",
  other: "outline",
}

export function EnquiryFiles({ files }: EnquiryFilesProps) {
  if (files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No files uploaded</CardTitle>
          <CardDescription>Upload files using the form above</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{file.file_name}</h3>
                    <Badge variant={fileTypeColors[file.file_type] || "outline"}>
                      {fileTypeLabels[file.file_type] || file.file_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span>{file.mime_type}</span>
                    {file.size && <span>• {(Number(file.size) / 1024).toFixed(2)} KB</span>}
                    <span>• {new Date(file.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
