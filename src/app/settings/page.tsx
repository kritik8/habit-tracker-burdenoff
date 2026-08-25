/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [timezonesList, setTimezonesList] = useState<string[]>([])

  useEffect(() => {
    try {
      const list = Intl.supportedValuesOf('timeZone')
      setTimezonesList(list)
    } catch {
      setTimezonesList(['UTC', 'Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Tokyo'])
    }

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setEmail(data.user.email)
          setTimezone(data.user.timezone)
        } else {
          toast('Failed to load settings', 'error')
        }
      } catch {
        toast('Error loading settings', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [toast])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      })

      const data = await res.json()

      if (res.ok) {
        toast('Timezone updated successfully!', 'success')
        setTimezone(data.user.timezone)
      } else {
        toast(data.error || 'Failed to update timezone', 'error')
      }
    } catch {
      toast('Failed to connect to server', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
          <p className="text-xs text-zinc-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 selection:bg-zinc-200">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-8 flex flex-col space-y-6">
        <div className="space-y-1 select-none">
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">Settings</h1>
          <p className="text-xs text-zinc-500 font-normal">
            Manage your personal profile and timezone preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="settings-email">
              Email Address
            </label>
            <input
              id="settings-email"
              type="text"
              readOnly
              value={email}
              className="w-full px-3 py-2 bg-zinc-50/50 border border-zinc-200/60 rounded-lg text-sm text-zinc-500 cursor-not-allowed select-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider" htmlFor="settings-timezone">
              Timezone
            </label>
            <div className="relative">
              <select
                id="settings-timezone"
                value={timezone}
                disabled={saving}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-800 disabled:opacity-50 cursor-pointer"
              >
                {timezonesList.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200/50 rounded-xl flex items-start gap-3 select-none">
            <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-zinc-800">Historical Data Preservation</h4>
              <p className="text-[11px] text-zinc-400 leading-normal font-normal">
                Updating your timezone does not rewrite previously recorded check-ins. Stored calendar days (e.g., &quot;2026-03-10&quot;) represent the local day they were originally recorded for and remain unmodified. Future check-ins will use your new timezone setting.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
            >
              {saving ? 'Saving changes...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
