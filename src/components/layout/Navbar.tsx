'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { Flame, Settings, LogOut, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (res.ok) {
        toast('Logged out successfully', 'success')
        router.push('/login')
        router.refresh()
      } else {
        toast('Failed to log out', 'error')
      }
    } catch {
      toast('Failed to connect to server', 'error')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <nav className="w-full bg-white border-b border-zinc-200/85 sticky top-0 z-40 selection:bg-zinc-200">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-zinc-950 text-sm hover:opacity-90 transition-opacity">
          <Flame className="w-4.5 h-4.5 text-zinc-800" />
          <span className="tracking-tight">Habit Tracker</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/dashboard'
                ? 'bg-zinc-50 text-zinc-950 border border-zinc-200/40 shadow-sm'
                : 'hover:text-zinc-950 hover:bg-zinc-50/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <Link
            href="/settings"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/settings'
                ? 'bg-zinc-50 text-zinc-950 border border-zinc-200/40 shadow-sm'
                : 'hover:text-zinc-950 hover:bg-zinc-50/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50/50 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
