"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateEnquiryModal } from "./create-enquiry-modal"

export function AddEnquiryFAB() {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<Array<{ id: string; name: string; company: string | null }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients")
        if (response.ok) {
          const data = await response.json()
          setClients(data.clients || [])
        }
      } catch (error) {
        console.error("[v0] Failed to fetch clients:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [])

  return (
    <>
      <div className="hidden md:block">
        <Button onClick={() => setOpen(true)} size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Enquiry
        </Button>
      </div>

      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 md:hidden"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <CreateEnquiryModal open={open} onOpenChange={setOpen} clients={clients} />
    </>
  )
}
