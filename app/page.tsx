import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Brigadez PMS</h1>
          <p className="text-xl text-muted-foreground">Complete project management for your business</p>
        </div>

        <div className="space-y-3 text-muted-foreground">
          <p className="text-balance">
            Manage clients, track enquiries, monitor materials and expenses, integrate with Google Drive, and calculate
            profits—all in one place.
          </p>
          <p className="text-sm text-muted-foreground/80">
            Access is provided by your administrator. Please sign in with your credentials.
          </p>
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
