"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnquiryFile {
  id: string
  file_name: string
  file_type: string
  file_url: string
  mime_type: string
  size: string
  created_at: string
  original_size_bytes?: number | null
  stored_size_bytes?: number | null
  was_compressed?: boolean
  compression_method?: string | null
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

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
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
      {files.map((file) => {
        const compressionRatio =
          file.was_compressed && file.original_size_bytes && file.stored_size_bytes
            ? ((file.original_size_bytes - file.stored_size_bytes) / file.original_size_bytes) * 100
            : 0

        return (
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
                      {file.was_compressed && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950">
                                <Zap className="h-3 w-3 mr-1" />
                                Compressed • {compressionRatio.toFixed(0)}% smaller
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1 text-sm">
                                <p>Original: {formatBytes(file.original_size_bytes || 0)}</p>
                                <p>Compressed: {formatBytes(file.stored_size_bytes || 0)}</p>
                                <p>Method: {file.compression_method || "Unknown"}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span>{file.mime_type}</span>
                      {file.stored_size_bytes ? (
                        <span>• {formatBytes(file.stored_size_bytes)}</span>
                      ) : file.size ? (
                        <span>• {(Number(file.size) / 1024).toFixed(2)} KB</span>
                      ) : null}
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
        )
      })}
    </div>
  )
}
