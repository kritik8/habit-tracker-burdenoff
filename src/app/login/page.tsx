'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Flame } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast('Please enter email and password', 'error')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast(data.error || 'Login failed', 'error')
      } else {
        toast('Logged in successfully!', 'success')
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast('Failed to connect to server', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-zinc-900 font-sans selection:bg-zinc-200">
      <div className="max-w-md w-full bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-sm flex flex-col space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center shadow-inner">
            <Flame className="w-5 h-5 text-zinc-800" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
            Log in to your account
          </h1>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Welcome back. Compounding positive habits compound-day by day.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800 disabled:opacity-50"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-10 text-xs font-medium cursor-pointer">
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-500">
           Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-zinc-950 font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
