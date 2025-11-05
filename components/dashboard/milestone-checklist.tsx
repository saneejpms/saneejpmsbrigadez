"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, FileText, Package, Wrench } from "lucide-react"

interface MilestoneData {
  id: string
  enquiry_id: string
  quote_given: boolean
  quote_given_at: string | null
  quote_given_by: string | null
  advance_invoice_given: boolean
  advance_invoice_given_at: string | null
  advance_invoice_given_by: string | null
  advance_invoice_credited: boolean
  advance_invoice_credited_at: string | null
  advance_invoice_credited_by: string | null
  work_started: boolean
  work_started_at: string | null
  work_started_by: string | null
  work_completed: boolean
  work_completed_at: string | null
  work_completed_by: string | null
  rectification_required: boolean
  rectification_required_at: string | null
  rectification_required_by: string | null
  rectification_note: string | null
  updated_by: string | null
}

interface UserProfile {
  id: string
  full_name: string
}

export interface MilestoneChecklistProps {
  milestone: MilestoneData | null
  currentUser: UserProfile | null
  onUpdate: (updates: Partial<MilestoneData>) => Promise<void>
  userRole?: string
}

const MILESTONE_ITEMS = [
  {
    key: "quote_given",
    label: "Quote Given",
    icon: FileText,
    description: "Quote has been provided to client",
    color: "bg-blue-100 dark:bg-blue-900",
    allowedRoles: ["Estimator", "Sales", "Admin"],
  },
  {
    key: "advance_invoice_given",
    label: "Advance Invoice Given",
    icon: Package,
    description: "Advance invoice has been issued",
    color: "bg-amber-100 dark:bg-amber-900",
    allowedRoles: ["Estimator", "Sales", "Admin"],
  },
  {
    key: "advance_invoice_credited",
    label: "Advance Invoice Credited",
    icon: CheckCircle2,
    description: "Advance payment has been received",
    color: "bg-green-100 dark:bg-green-900",
    allowedRoles: ["Admin", "Accounts"],
  },
  {
    key: "work_started",
    label: "Work Started",
    icon: Wrench,
    description: "Fabrication has commenced",
    color: "bg-purple-100 dark:bg-purple-900",
    allowedRoles: ["Fabrication", "Installation", "Admin"],
  },
  {
    key: "work_completed",
    label: "Work Completed",
    icon: CheckCircle2,
    description: "Work has been completed and installed",
    color: "bg-cyan-100 dark:bg-cyan-900",
    allowedRoles: ["Fabrication", "Installation", "Admin"],
  },
  {
    key: "rectification_required",
    label: "Rectification Required",
    icon: AlertCircle,
    description: "Rectification work needed",
    color: "bg-red-100 dark:bg-red-900",
    allowedRoles: ["Fabrication", "Installation", "Admin"],
  },
]

export function MilestoneChecklist({ milestone, currentUser, onUpdate, userRole = "Viewer" }: MilestoneChecklistProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [rectificationNote, setRectificationNote] = useState(milestone?.rectification_note || "")
  const [showNoteDialog, setShowNoteDialog] = useState(false)

  const canEdit = userRole !== "Viewer"

  const calculateProgress = () => {
    if (!milestone) return 0
    const completed = MILESTONE_ITEMS.filter((item) => {
      const key = item.key as keyof MilestoneData
      return milestone[key] === true
    }).length
    return Math.round((completed / MILESTONE_ITEMS.length) * 100)
  }

  const handleMilestoneToggle = async (key: string) => {
    if (!canEdit || isUpdating) return

    setIsUpdating(true)
    try {
      const currentValue = (milestone?.[key as keyof MilestoneData] as boolean) || false
      const updates: Partial<MilestoneData> = {
        [key]: !currentValue,
        [`${key}_at`]: !currentValue ? new Date().toISOString() : null,
        [`${key}_by`]: !currentValue ? currentUser?.id : null,
      }
      await onUpdate(updates)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveNote = async () => {
    if (!canEdit || isUpdating) return

    setIsUpdating(true)
    try {
      await onUpdate({
        rectification_note: rectificationNote,
        rectification_required_at: new Date().toISOString(),
        rectification_required_by: currentUser?.id,
      })
      setShowNoteDialog(false)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "short",
      month: "short",
    })
  }

  const progress = calculateProgress()

  return (
    <>
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <CardTitle>Project Milestones</CardTitle>
            <div className="w-full bg-secondary rounded-full h-2">
              <motion.div
                className="bg-primary h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{progress}% Complete</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {MILESTONE_ITEMS.map((item) => {
              const key = item.key as keyof MilestoneData
              const isCompleted = milestone?.[key] === true
              const timestamp = milestone?.[`${key}_at` as keyof MilestoneData] as string | null
              const completedBy = milestone?.[`${key}_by` as keyof MilestoneData] as string | null
              const Icon = item.icon
              const isRectification = key === "rectification_required"
              const canToggle =
                canEdit &&
                MILESTONE_ITEMS[MILESTONE_ITEMS.findIndex((i) => i.key === key)]?.allowedRoles.includes(
                  userRole || "Viewer",
                )

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`p-4 rounded-lg border transition-all ${isCompleted ? "bg-muted border-primary/30" : "border-border"}`}
                >
                  <div className="flex items-start gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => handleMilestoneToggle(key)}
                            disabled={!canToggle || isUpdating}
                            className="mt-1"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {canToggle
                            ? `Mark ${item.label} as ${isCompleted ? "incomplete" : "complete"}`
                            : "You don't have permission to edit this"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className={`font-medium ${isCompleted ? "line-through opacity-60" : ""}`}>
                          {item.label}
                        </span>
                        {isCompleted && (
                          <Badge variant="outline" className="text-xs">
                            Done
                          </Badge>
                        )}
                      </div>

                      {timestamp && (
                        <p className="text-xs text-muted-foreground">
                          Marked by {completedBy || "Unknown"} on {formatDate(timestamp)}
                        </p>
                      )}

                      {isRectification && isCompleted && milestone?.rectification_note && (
                        <div className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded mt-2 border border-red-200 dark:border-red-800">
                          <p className="font-medium text-red-900 dark:text-red-100 mb-1">Note:</p>
                          <p className="text-red-800 dark:text-red-200">{milestone.rectification_note}</p>
                        </div>
                      )}

                      {isRectification && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNoteDialog(true)}
                          disabled={!canToggle}
                          className="mt-2"
                        >
                          {isCompleted ? "Edit" : "Add"} Note
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {milestone?.rectification_required && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-900 dark:text-red-100 font-semibold">
                <AlertCircle className="h-5 w-5" />
                Rectification Required
              </div>
              <p className="text-sm text-red-800 dark:text-red-200 mt-2">
                A rectification task has been created for this enquiry.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rectification Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rectification notes and details..."
              value={rectificationNote}
              onChange={(e) => setRectificationNote(e.target.value)}
              className="min-h-32"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNote} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
