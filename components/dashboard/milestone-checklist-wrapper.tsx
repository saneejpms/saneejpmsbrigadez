"use client"

import { useState } from "react"
import { MilestoneChecklist, type MilestoneChecklistProps } from "./milestone-checklist"

interface MilestoneChecklistWrapperProps extends Omit<MilestoneChecklistProps, "onUpdate"> {
  enquiryId: string
}

export function MilestoneChecklistWrapper({ enquiryId, ...props }: MilestoneChecklistWrapperProps) {
  const [isUpdating, setIsUpdating] = useState(false)

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

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("[v0] Failed to update milestone:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return <MilestoneChecklist {...props} onUpdate={handleMilestoneUpdate} />
}
