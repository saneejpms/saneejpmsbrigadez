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

  const handleCancel = () => {
    onOpenChange(false)
    setTimeout(() => setSelectedTypes(new Set()), 150) // Clear after animation
  }

  const handleConfirm = () => {
    if (selectedTypes.size === 0) return
    onConfirm(Array.from(selectedTypes) as ("drawing" | "quote" | "work")[])
    setTimeout(() => setSelectedTypes(new Set()), 100)
  }

  const priorityOptions = [
    {
      id: "drawing",
      icon: Pencil,
      label: "Drawing Priority",
      description: "For design and drawing tasks",
      color: "from-blue-500/20 to-blue-400/10",
      borderColor: "border-blue-500/40",
      badgeColor: "bg-blue-500/30 text-blue-200",
      hoverGlow: "hover:shadow-blue-500/20",
    },
    {
      id: "quote",
      icon: FileText,
      label: "Quote Priority",
      description: "For quotation and estimation tasks",
      color: "from-purple-500/20 to-purple-400/10",
      borderColor: "border-purple-500/40",
      badgeColor: "bg-purple-500/30 text-purple-200",
      hoverGlow: "hover:shadow-purple-500/20",
    },
    {
      id: "work",
      icon: Wrench,
      label: "Work Priority",
      description: "For fabrication and installation tasks",
      color: "from-orange-500/20 to-orange-400/10",
      borderColor: "border-orange-500/40",
      badgeColor: "bg-orange-500/30 text-orange-200",
      hoverGlow: "hover:shadow-orange-500/20",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-modal sm:max-w-lg border-white/20 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
            Add to Priority List
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Select one or more priority types for this enquiry. An enquiry can be assigned multiple priorities
            simultaneously.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-6 max-h-[400px] overflow-y-auto">
          {priorityOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedTypes.has(option.id as any)

            return (
              <button
                key={option.id}
                onClick={() => !loading && toggleType(option.id as any)}
                disabled={loading}
                className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform ${
                  isSelected
                    ? `bg-gradient-to-br ${option.color} border-2 ${option.borderColor} shadow-lg ${option.hoverGlow} scale-[1.02]`
                    : `glass-button border-white/10 hover:border-white/20`
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className={`p-3 rounded-lg backdrop-blur-md transition-all duration-300 ${
                        isSelected ? option.badgeColor : "bg-white/5 text-muted-foreground border border-white/10"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 text-left">
                    <p
                      className={`font-semibold transition-colors text-base ${isSelected ? "text-white" : "text-foreground/90"}`}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                  </div>

                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? `border-current ${option.badgeColor} bg-gradient-to-br from-white/20 to-white/10`
                          : "border-white/20 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4 font-bold" />}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {selectedTypes.size > 0 && (
          <div className="flex flex-wrap gap-3 p-4 rounded-xl glass-card border-white/10 bg-gradient-to-br from-white/5 to-white/2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-full">
              ✓ Selected Priorities
            </span>
            {Array.from(selectedTypes).map((type) => {
              const option = priorityOptions.find((opt) => opt.id === type)
              return (
                <Badge key={type} className={`capitalize font-medium ${option?.badgeColor}`}>
                  {option?.label}
                </Badge>
              )
            })}
          </div>
        )}

        <DialogFooter className="gap-3 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading} className="glass-button bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading || selectedTypes.size === 0} className="btn-glass-primary">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-current mr-2" />
                Adding...
              </>
            ) : (
              `Add Priority (${selectedTypes.size})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
