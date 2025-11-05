import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BrigadezLogo } from "@/components/brigadez-logo"
import { Sparkles, ArrowRight } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-6">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <div className="w-full max-w-3xl space-y-8 md:space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 animate-fade-in-up text-center">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Project Management Evolved</span>
          </div>

          <BrigadezLogo className="h-20 mx-auto animate-float" />

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Complete Project Management System
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Manage clients, enquiries, materials, expenses, and schedules—all in one powerful, beautiful platform. Built
            for modern teams.
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row justify-center gap-4 animate-scale-in"
          style={{ animationDelay: "0.2s" }}
        >
          <Button asChild size="lg" className="btn-primary group">
            <Link href="/auth/login" className="flex items-center gap-2">
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="glass-button bg-transparent">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>

        {/* Feature Preview */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          {[
            { icon: "👥", label: "Client Management" },
            { icon: "📋", label: "Enquiries" },
            { icon: "📦", label: "Materials" },
            { icon: "💰", label: "Expenses" },
            { icon: "📅", label: "Schedules" },
            { icon: "🔗", label: "Drive Integration" },
          ].map((feature) => (
            <div key={feature.label} className="glass p-4 rounded-xl text-center hover:bg-white/[0.06] transition-all">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
