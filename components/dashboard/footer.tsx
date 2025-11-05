"use client"

import { Instagram } from "lucide-react"
import Link from "next/link"

export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          From the desk of{" "}
          <Link
            href="https://instagram.com/heysaneej"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline inline-flex items-center gap-1 transition-colors hover:text-primary/80"
          >
            <Instagram className="h-4 w-4" />
            saneejified
          </Link>
        </p>
      </div>
    </footer>
  )
}
