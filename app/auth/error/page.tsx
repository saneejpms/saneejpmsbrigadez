import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams
  const error = params.error || "unknown_error"
  const errorDescription = params.error_description || "An unexpected error occurred"

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">Authentication Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">{errorDescription}</p>
          <p className="text-sm text-muted-foreground">An unexpected error occurred during authentication.</p>
          <Button asChild className="mt-4 w-full">
            <Link href="/auth/login">Return to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
