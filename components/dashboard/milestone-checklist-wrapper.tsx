"use client"

import { useState } from "react"
import { MilestoneChecklist, type MilestoneChecklistProps } from "./milestone-checklist"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface MilestoneChecklistWrapperProps extends Omit<MilestoneChecklistProps, "onUpdate"> {
  enquiryId: string
}

export function MilestoneChecklistWrapper({ enquiryId, ...props }: MilestoneChecklistWrapperProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleMilestoneUpdate = async (updates: any) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/milestones/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update milestone")
      }

      toast.success("Milestone updated successfully")
      router.refresh()
    } catch (error) {
      console.error("[v0] Failed to update milestone:", error)
      toast.error("Failed to update milestone")
    } finally {
      setIsUpdating(false)
    }
  }

  return <MilestoneChecklist {...props} onUpdate={handleMilestoneUpdate} />
}
