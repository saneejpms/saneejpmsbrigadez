"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Pencil, FileText, Wrench } from "lucide-react"

interface PriorityTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (type: "drawing" | "quote" | "work" | null) => void
  loading?: boolean
}

export function PriorityTypeDialog({ open, onOpenChange, onConfirm, loading }: PriorityTypeDialogProps) {
  const [selectedType, setSelectedType] = useState<"drawing" | "quote" | "work" | "none">("none")

  const handleConfirm = () => {
    onConfirm(selectedType === "none" ? null : selectedType)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Priority Type</DialogTitle>
          <DialogDescription>Choose the type of priority for this enquiry</DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedType} onValueChange={(v) => setSelectedType(v as any)} className="space-y-3">
          <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="drawing" id="drawing" />
            <Label htmlFor="drawing" className="flex items-center gap-2 cursor-pointer flex-1">
              <Pencil className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium">Drawing Priority</p>
                <p className="text-xs text-muted-foreground">For design and drawing tasks</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="quote" id="quote" />
            <Label htmlFor="quote" className="flex items-center gap-2 cursor-pointer flex-1">
              <FileText className="h-4 w-4 text-purple-500" />
              <div>
                <p className="font-medium">Quote Priority</p>
                <p className="text-xs text-muted-foreground">For quotation and estimation tasks</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="work" id="work" />
            <Label htmlFor="work" className="flex items-center gap-2 cursor-pointer flex-1">
              <Wrench className="h-4 w-4 text-orange-500" />
              <div>
                <p className="font-medium">Work Priority</p>
                <p className="text-xs text-muted-foreground">For fabrication and installation tasks</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none" className="flex items-center gap-2 cursor-pointer flex-1">
              <div>
                <p className="font-medium">General Priority</p>
                <p className="text-xs text-muted-foreground">No specific type</p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Adding..." : "Add to Priority"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
