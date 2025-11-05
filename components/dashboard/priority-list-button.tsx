"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { PriorityListModal } from "./priority-list-modal"

export function PriorityListButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <Star className="h-4 w-4" />
        Priority List
      </Button>
      <PriorityListModal open={open} onOpenChange={setOpen} />
    </>
  )
}
