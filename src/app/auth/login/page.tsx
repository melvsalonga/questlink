import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import { Sword } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign In - QuestLink',
  description: 'Sign in to your QuestLink account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 p-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="flex items-center space-x-2 text-2xl font-bold">
          <Sword className="h-8 w-8 text-primary animate-float" />
          <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            QuestLink
          </span>
        </Link>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
