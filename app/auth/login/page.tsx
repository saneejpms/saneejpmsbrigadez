"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BrigadezLogo } from "@/components/brigadez-logo"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      console.log("[v0] Attempting login with email:", email)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      console.log("[v0] Login response:", { data, error: authError })

      if (authError) {
        console.error("[v0] Authentication error:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        })
        throw authError
      }

      console.log("[v0] Login successful, redirecting to dashboard")
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Login catch block error:", error)

      let errorMessage = "An error occurred during login"

      if (error instanceof Error) {
        console.log("[v0] Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        })

        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials."
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please confirm your email address before logging in."
        } else if (error.message.includes("Database error")) {
          errorMessage = "Database connection error. Please contact your administrator."
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <BrigadezLogo className="h-12" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials provided by your administrator
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
