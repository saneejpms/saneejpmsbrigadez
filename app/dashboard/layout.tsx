import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardFooter } from "@/components/dashboard/footer"
import { MobileNavigation } from "@/components/dashboard/mobile-navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col w-full">
          <main className="flex-1 overflow-y-auto bg-background pb-mobile-nav md:pb-0">
            <div className="max-w-7xl mx-auto p-4 md:p-6">{children}</div>
          </main>
          <DashboardFooter />
        </div>
      </div>
      <MobileNavigation />
    </SidebarProvider>
  )
}
