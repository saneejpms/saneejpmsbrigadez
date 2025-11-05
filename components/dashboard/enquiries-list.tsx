"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, StarOff, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type Enquiry = {
  id: string
  enquiry_code: string
  title: string
  status: string
  created_at: string
  is_priority: boolean
  client?: {
    name: string
  }
}

export function EnquiriesList() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchEnquiries = async () => {
    try {
      const response = await fetch("/api/enquiries/list")
      if (response.ok) {
        const data = await response.json()
        setEnquiries(data.enquiries || [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch enquiries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const togglePriority = async (enquiryId: string, currentPriority: boolean) => {
    try {
      const response = await fetch(`/api/enquiries/${enquiryId}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_priority: !currentPriority }),
      })

      if (!response.ok) throw new Error("Failed to update priority")

      toast({
        title: currentPriority ? "Removed from priority" : "Added to priority",
        description: "Priority status updated successfully.",
      })

      // Refresh the list
      fetchEnquiries()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update priority status",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    }
    return colors[status] || colors.pending
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Enquiries</CardTitle>
          <CardDescription>Latest project enquiries sorted by date</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Enquiries</CardTitle>
        <CardDescription>Latest project enquiries sorted by date</CardDescription>
      </CardHeader>
      <CardContent>
        {enquiries.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No enquiries yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/enquiries/${enquiry.id}`} className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">
                            {enquiry.enquiry_code}
                          </p>
                          <p className="text-sm text-muted-foreground">{enquiry.title}</p>
                          {enquiry.client && (
                            <p className="text-xs text-muted-foreground mt-1">{enquiry.client.name}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                    <Badge variant="outline" className={getStatusColor(enquiry.status)}>
                      {enquiry.status.replace("_", " ")}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(enquiry.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePriority(enquiry.id, enquiry.is_priority)}
                    className="h-8 w-8"
                  >
                    {enquiry.is_priority ? (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Link href={`/dashboard/enquiries/${enquiry.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
