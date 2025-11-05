import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Database, Key, Cloud, Server, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    return status ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight">System Diagnostics</h1>
        <p className="text-muted-foreground">Check the status of all integrations and configurations</p>
      </div>

      {/* Overall Status */}
      <Card className="animate-scale-in border-2 shadow-card hover:shadow-card-hover transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {supabaseCheck.status && tablesCheck.status && envCheck.supabase ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-success" />
                <div>
                  <p className="font-semibold text-success">All Systems Operational</p>
                  <p className="text-sm text-muted-foreground">Core integrations are working correctly</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-8 w-8 text-warning" />
                <div>
                  <p className="font-semibold text-warning">Some Issues Detected</p>
                  <p className="text-sm text-muted-foreground">Check details below for more information</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Supabase Connection */}
      <Card
        className="animate-scale-in shadow-card hover:shadow-card-hover transition-all duration-300"
        style={{ animationDelay: "0.1s" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Supabase Connection
          </CardTitle>
          <CardDescription>Database and authentication service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-sm font-medium">Connection Status</span>
            <div className="flex items-center gap-2">
              <StatusIcon status={supabaseCheck.status} />
              <Badge variant={supabaseCheck.status ? "default" : "destructive"} className="font-semibold">
                {supabaseCheck.status ? "Connected" : "Failed"}
              </Badge>
            </div>
          </div>
          {!supabaseCheck.status && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{supabaseCheck.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Database Tables */}
      <Card
        className="animate-scale-in shadow-card hover:shadow-card-hover transition-all duration-300"
        style={{ animationDelay: "0.2s" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Database Tables
          </CardTitle>
          <CardDescription>Required tables for the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {tablesCheck.tables.map((table) => (
              <div key={table.table} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="font-mono text-sm">{table.table}</span>
                <StatusIcon status={table.exists} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card
        className="animate-scale-in shadow-card hover:shadow-card-hover transition-all duration-300"
        style={{ animationDelay: "0.3s" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Environment Variables
          </CardTitle>
          <CardDescription>Required configuration for integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-3 font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Supabase Configuration
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm font-mono">NEXT_PUBLIC_SUPABASE_URL</span>
                <StatusIcon status={envCheck.details.supabase.url} />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                <StatusIcon status={envCheck.details.supabase.anonKey} />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm font-mono">SUPABASE_SERVICE_ROLE_KEY</span>
                <StatusIcon status={envCheck.details.supabase.serviceRole} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-semibold flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Google Drive Configuration
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm font-mono">GOOGLE_SERVICE_ACCOUNT_KEY</span>
                <StatusIcon status={envCheck.details.google.serviceAccount} />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm font-mono">GOOGLE_DRIVE_PARENT_FOLDER_ID</span>
                <StatusIcon status={envCheck.details.google.driveFolderId} />
              </div>
            </div>
            {!envCheck.google && (
              <Alert className="mt-3 border-blue-500/20 bg-blue-500/5">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-600 dark:text-blue-400">
                  Google Drive is optional. File uploads will be disabled until configured. Add the required environment
                  variables to enable this feature.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Google Drive Status */}
      <Card
        className="animate-scale-in shadow-card hover:shadow-card-hover transition-all duration-300"
        style={{ animationDelay: "0.4s" }}
      >
        <CardHeader>
          <CardTitle>Current User</CardTitle>
          <CardDescription>Authenticated user information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm font-medium">Email</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm font-medium">User ID</span>
              <span className="font-mono text-sm text-muted-foreground truncate max-w-[200px]">{user.id}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm font-medium">Authentication</span>
              <Badge variant="default" className="font-semibold">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
