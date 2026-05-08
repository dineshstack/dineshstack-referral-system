'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Link2, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Already logged in — go straight to dashboard
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('api_token')) {
      router.replace('/')
    }
  }, [router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { token, user } = await login(email, password)
      localStorage.setItem('api_token', token)
      localStorage.setItem('user', JSON.stringify(user))
      router.replace('/')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Link2 className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">DineshStack</h1>
            <p className="text-sm text-muted-foreground">Referral Manager</p>
          </div>
        </div>

        {/* Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>Enter your admin credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin me-2" /> Signing in…</>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
