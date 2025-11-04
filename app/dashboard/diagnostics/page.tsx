import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Database, Key, Cloud, Server } from "lucide-react"

async function checkSupabaseConnection() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("profiles").select("count").limit(1).single()
    return { status: !error, message: error ? error.message : "Connected successfully" }
  } catch (error) {
    return { status: false, message: "Connection failed" }
  }
}

async function checkDatabaseTables() {
  try {
    const supabase = await createClient()
    const tables = [
      "profiles",
      "clients",
      "enquiries",
      "materials",
      "commercials",
      "expenses",
      "schedules",
      "drive_files",
    ]
    const results = await Promise.all(
      tables.map(async (table) => {
        const { error } = await supabase.from(table).select("count").limit(1)
        return { table, exists: !error }
      }),
    )
    return { status: results.every((r) => r.exists), tables: results }
  } catch (error) {
    return { status: false, tables: [] }
  }
}

function checkEnvironmentVariables() {
  const required = {
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    google: {
      serviceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      driveFolderId: !!process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
    },
  }

  return {
    supabase: Object.values(required.supabase).every(Boolean),
    google: Object.values(required.google).every(Boolean),
    details: required,
  }
}

export default async function DiagnosticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const supabaseCheck = await checkSupabaseConnection()
  const tablesCheck = await checkDatabaseTables()
  const envCheck = checkEnvironmentVariables()

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Diagnostics</h1>
        <p className="text-muted-foreground">Check the status of all integrations and configurations</p>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {supabaseCheck.status && tablesCheck.status && envCheck.supabase ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold text-green-600">All Systems Operational</p>
                  <p className="text-sm text-muted-foreground">Core integrations are working correctly</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="font-semibold text-yellow-600">Some Issues Detected</p>
                  <p className="text-sm text-muted-foreground">Check details below for more information</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supabase Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Connection
          </CardTitle>
          <CardDescription>Database and authentication service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status</span>
            <div className="flex items-center gap-2">
              <StatusIcon status={supabaseCheck.status} />
              <Badge variant={supabaseCheck.status ? "default" : "destructive"}>
                {supabaseCheck.status ? "Connected" : "Failed"}
              </Badge>
            </div>
          </div>
          {!supabaseCheck.status && <p className="text-sm text-red-500">{supabaseCheck.message}</p>}
        </CardContent>
      </Card>

      {/* Database Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Tables
          </CardTitle>
          <CardDescription>Required tables for the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tablesCheck.tables.map((table) => (
              <div key={table.table} className="flex items-center justify-between">
                <span className="text-sm font-mono">{table.table}</span>
                <StatusIcon status={table.exists} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Environment Variables
          </CardTitle>
          <CardDescription>Required configuration for integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 font-semibold">Supabase Configuration</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">NEXT_PUBLIC_SUPABASE_URL</span>
                <StatusIcon status={envCheck.details.supabase.url} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                <StatusIcon status={envCheck.details.supabase.anonKey} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SUPABASE_SERVICE_ROLE_KEY</span>
                <StatusIcon status={envCheck.details.supabase.serviceRole} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Google Drive Configuration</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">GOOGLE_SERVICE_ACCOUNT_KEY</span>
                <StatusIcon status={envCheck.details.google.serviceAccount} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GOOGLE_DRIVE_PARENT_FOLDER_ID</span>
                <StatusIcon status={envCheck.details.google.driveFolderId} />
              </div>
            </div>
            {!envCheck.google && (
              <p className="mt-2 text-sm text-yellow-600">
                Google Drive integration is not configured. Add the required environment variables to enable file
                uploads.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Google Drive Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Google Drive Integration
          </CardTitle>
          <CardDescription>File upload and storage service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Integration Status</span>
            <div className="flex items-center gap-2">
              <StatusIcon status={envCheck.google} />
              <Badge variant={envCheck.google ? "default" : "secondary"}>
                {envCheck.google ? "Configured" : "Not Configured"}
              </Badge>
            </div>
          </div>
          {!envCheck.google && (
            <div className="mt-4 rounded-lg bg-muted p-4">
              <h4 className="mb-2 font-semibold">Setup Instructions:</h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Create a Google Cloud project</li>
                <li>Enable Google Drive API</li>
                <li>Create a Service Account and download JSON key</li>
                <li>Add GOOGLE_SERVICE_ACCOUNT_KEY to environment variables</li>
                <li>Create a folder in Google Drive and add GOOGLE_DRIVE_PARENT_FOLDER_ID</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
          <CardDescription>Authenticated user information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User ID</span>
              <span className="font-mono text-sm text-muted-foreground">{user.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication</span>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
