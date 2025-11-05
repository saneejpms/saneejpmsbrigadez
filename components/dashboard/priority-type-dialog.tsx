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
import { Badge } from "@/components/ui/badge"
import { Pencil, FileText, Wrench, Check } from "lucide-react"

interface PriorityTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (types: ("drawing" | "quote" | "work")[]) => void
  loading?: boolean
}

export function PriorityTypeDialog({ open, onOpenChange, onConfirm, loading }: PriorityTypeDialogProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<"drawing" | "quote" | "work">>(new Set())

  const toggleType = (type: "drawing" | "quote" | "work") => {
    const newTypes = new Set(selectedTypes)
    if (newTypes.has(type)) {
      newTypes.delete(type)
    } else {
      newTypes.add(type)
    }
    setSelectedTypes(newTypes)
  }

  const handleConfirm = () => {
    onConfirm(Array.from(selectedTypes) as ("drawing" | "quote" | "work")[])
  }

  const priorityOptions = [
    {
      id: "drawing",
      icon: Pencil,
      label: "Drawing Priority",
      description: "For design and drawing tasks",
      color: "from-blue-500/20 to-blue-400/10",
      borderColor: "border-blue-500/30",
      badgeColor: "bg-blue-500/20 text-blue-400",
    },
    {
      id: "quote",
      icon: FileText,
      label: "Quote Priority",
      description: "For quotation and estimation tasks",
      color: "from-purple-500/20 to-purple-400/10",
      borderColor: "border-purple-500/30",
      badgeColor: "bg-purple-500/20 text-purple-400",
    },
    {
      id: "work",
      icon: Wrench,
      label: "Work Priority",
      description: "For fabrication and installation tasks",
      color: "from-orange-500/20 to-orange-400/10",
      borderColor: "border-orange-500/30",
      badgeColor: "bg-orange-500/20 text-orange-400",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg animate-scale-in backdrop-blur-xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold">Add to Priority List</DialogTitle>
          <DialogDescription>
            Select one or more priority types for this enquiry. An enquiry can be assigned multiple priorities.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {priorityOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedTypes.has(option.id as any)

            return (
              <button
                key={option.id}
                onClick={() => toggleType(option.id as any)}
                disabled={loading}
                className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform ${
                  isSelected
                    ? `bg-gradient-to-br ${option.color} border-2 ${option.borderColor} shadow-lg shadow-blue-500/20 scale-[1.02]`
                    : `bg-gradient-to-br from-muted/40 to-muted/20 border border-border/50 hover:border-foreground/20 hover:scale-[1.01]`
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Glassmorphism background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-start gap-3">
                  {/* Icon and Text */}
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className={`p-2.5 rounded-lg transition-all duration-300 ${
                        isSelected ? option.badgeColor : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 text-left">
                    <p
                      className={`font-semibold transition-colors ${isSelected ? "text-foreground" : "text-foreground/80"}`}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  </div>

                  {/* Checkbox Indicator */}
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected ? `border-current ${option.badgeColor}` : "border-muted-foreground/30 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {selectedTypes.size > 0 && (
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
            <span className="text-xs font-medium text-muted-foreground">Selected:</span>
            {Array.from(selectedTypes).map((type) => {
              const option = priorityOptions.find((opt) => opt.id === type)
              return (
                <Badge key={type} variant="secondary" className="capitalize">
                  {option?.label}
                </Badge>
              )
            })}
          </div>
        )}

        <DialogFooter className="gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setSelectedTypes(new Set())
            }}
            disabled={loading}
            className="transition-all hover:scale-105"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || selectedTypes.size === 0}
            className="transition-all hover:scale-105 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Adding...
              </>
            ) : (
              `Add to Priority (${selectedTypes.size})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
