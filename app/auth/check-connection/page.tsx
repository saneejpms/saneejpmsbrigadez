"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { BrigadezLogo } from "@/components/brigadez-logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckConnectionPage() {
  const [checking, setChecking] = useState(true)
  const [results, setResults] = useState({
    supabaseConnection: false,
    envVarsPresent: false,
    tablesExist: false,
    userExists: false,
    errorDetails: "",
  })

  useEffect(() => {
    async function runChecks() {
      const supabase = createClient()
      const newResults = {
        supabaseConnection: false,
        envVarsPresent: false,
        tablesExist: false,
        userExists: false,
        errorDetails: "",
      }

      // Check environment variables
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      newResults.envVarsPresent = hasUrl && hasKey
      console.log("[v0] Environment variables check:", { hasUrl, hasKey })

      if (!newResults.envVarsPresent) {
        newResults.errorDetails = "Missing Supabase environment variables"
        setResults(newResults)
        setChecking(false)
        return
      }

      // Check Supabase connection
      try {
        const { data, error } = await supabase.from("profiles").select("count").limit(1)
        newResults.supabaseConnection = !error
        newResults.tablesExist = !error
        console.log("[v0] Supabase connection check:", { data, error })

        if (error) {
          newResults.errorDetails = `Database error: ${error.message}`
        }
      } catch (error) {
        console.error("[v0] Connection check error:", error)
        newResults.errorDetails = error instanceof Error ? error.message : "Unknown error"
      }

      // Check if admin user exists
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("email", "info@brigadezmetal.com")
          .single()

        newResults.userExists = !error && !!data
        console.log("[v0] User check:", { data, error })

        if (error && !newResults.errorDetails) {
          newResults.errorDetails = `User check error: ${error.message}`
        }
      } catch (error) {
        console.error("[v0] User check error:", error)
      }

      setResults(newResults)
      setChecking(false)
    }

    runChecks()
  }, [])

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <BrigadezLogo className="h-12" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl text-center">Connection Diagnostics</CardTitle>
            <CardDescription className="text-center">Checking Supabase connection and database setup</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {checking ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Environment Variables</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={results.envVarsPresent} />
                    <Badge variant={results.envVarsPresent ? "default" : "destructive"}>
                      {results.envVarsPresent ? "Present" : "Missing"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Supabase Connection</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={results.supabaseConnection} />
                    <Badge variant={results.supabaseConnection ? "default" : "destructive"}>
                      {results.supabaseConnection ? "Connected" : "Failed"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Tables</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={results.tablesExist} />
                    <Badge variant={results.tablesExist ? "default" : "destructive"}>
                      {results.tablesExist ? "Exist" : "Missing"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Admin User (info@brigadezmetal.com)</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={results.userExists} />
                    <Badge variant={results.userExists ? "default" : "destructive"}>
                      {results.userExists ? "Exists" : "Not Found"}
                    </Badge>
                  </div>
                </div>
              </div>

              {results.errorDetails && (
                <div className="rounded-lg bg-destructive/10 p-4">
                  <p className="text-sm font-semibold text-destructive">Error Details:</p>
                  <p className="text-sm text-destructive/80">{results.errorDetails}</p>
                </div>
              )}

              {!results.userExists && results.supabaseConnection && (
                <div className="rounded-lg bg-yellow-500/10 p-4">
                  <p className="text-sm font-semibold text-yellow-600">Action Required:</p>
                  <p className="text-sm text-yellow-600/80">
                    The admin user doesn't exist. Please run the SQL scripts in your Supabase SQL Editor:
                  </p>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-yellow-600/80">
                    <li>Run scripts/015_check_admin_status.sql to check current state</li>
                    <li>Run scripts/016_create_admin_fresh.sql to create the admin user</li>
                  </ol>
                </div>
              )}

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Recheck
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
