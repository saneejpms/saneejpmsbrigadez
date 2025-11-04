import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>We&apos;ve sent you a confirmation link to verify your account</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-sm text-muted-foreground">
            Click the link in the email to complete your registration. If you don&apos;t see it, check your spam folder.
          </p>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/auth/login">Return to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
