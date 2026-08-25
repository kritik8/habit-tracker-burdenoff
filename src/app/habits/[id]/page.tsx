/* eslint-disable react-hooks/set-state-in-effect */
'use client'


import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import HabitCalendar from '@/components/habits/HabitCalendar'
import { EditHabitDialog, DeleteHabitDialog, BackfillCheckInDialog } from '@/components/habits/HabitDialogs'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit2, Trash2, CalendarPlus, Flame, CheckCircle2, Trash, Loader2 } from 'lucide-react'
import { HabitData } from '@/components/habits/HabitCard'

interface HabitDetail extends HabitData {
  checkIns: { id: string; localDate: string; checkedInAtUtc: string }[]
  isCompletedToday: boolean
  createdAt: string
}

export default function HabitDetailPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const { toast } = useToast()
  const [habit, setHabit] = useState<HabitDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isBackfillOpen, setIsBackfillOpen] = useState(false)

  const fetchHabit = useCallback(async () => {
    try {
      const res = await fetch(`/api/habits/${id}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Habit not found')
        if (res.status === 403) throw new Error('Access forbidden')
        throw new Error('Failed to load habit details')
      }
      const data = await res.json()
      setHabit(data.habit)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error loading habit'
      toast(message, 'error')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [id, router, toast])

  useEffect(() => {
    fetchHabit()
  }, [fetchHabit])

  const handleRemoveCheckIn = async (localDate: string) => {
    if (!confirm(`Are you sure you want to remove the check-in for ${localDate}?`)) return

    try {
      const res = await fetch(`/api/habits/${id}/check-in?localDate=${localDate}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        toast(`Check-in for ${localDate} removed`, 'success')
        fetchHabit()
      } else {
        toast(data.error || 'Failed to remove check-in', 'error')
      }
    } catch {
      toast('Failed to connect to server', 'error')
    }
  }

  const handleCheckInToday = async () => {
    try {
      const res = await fetch(`/api/habits/${id}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        toast('Checked in successfully!', 'success')
        fetchHabit()
      } else {
        toast(data.error || 'Failed to check in', 'error')
      }
    } catch {
      toast('Failed to connect to server', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
          <p className="text-xs text-zinc-400">Loading details...</p>
        </div>
      </div>
    )
  }

  if (!habit) return null

  const checkInDatesList = habit.checkIns.map((c) => c.localDate)
  const isCompletedToday = habit.isCompletedToday

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 selection:bg-zinc-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col space-y-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-800 transition-colors w-fit select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to dashboard</span>
        </Link>

        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-zinc-950 truncate">
              {habit.name}
            </h1>
            {habit.description && (
              <p className="text-xs text-zinc-500 leading-normal font-normal">
                {habit.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs select-none pt-2">
              <div className="flex items-center gap-1.5 font-medium text-zinc-800">
                <Flame className={`w-4 h-4 ${habit.currentStreak > 0 ? 'text-amber-500 fill-amber-100' : 'text-zinc-300'}`} />
                <span>{habit.currentStreak} day streak</span>
              </div>
              <div className="text-zinc-400">
                Longest streak: <span className="font-semibold text-zinc-600">{habit.longestStreak}</span> days
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="h-9 px-3.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-800 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm/5"
              aria-label="Edit habit"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="h-9 px-3.5 rounded-xl border border-zinc-200 hover:bg-red-50 text-zinc-600 hover:text-red-700 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm/5"
              aria-label="Delete habit"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setIsBackfillOpen(true)}
              className="h-9 px-3.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-800 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm/5"
              aria-label="Backfill check-in"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Backfill</span>
            </button>

            {isCompletedToday ? (
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100/50 rounded-xl px-4 py-2 text-xs font-semibold select-none h-9">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed Today</span>
              </div>
            ) : (
              <Button
                onClick={handleCheckInToday}
                className="h-9 text-xs px-4 rounded-xl font-semibold shadow-sm cursor-pointer"
              >
                Check In Today
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <HabitCalendar checkInDates={checkInDatesList} habitCreatedAt={habit.createdAt} />
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col space-y-4 max-h-[400px] overflow-y-auto">
            <h3 className="font-semibold text-xs text-zinc-500 uppercase tracking-wider select-none">
              Completion Log
            </h3>

            {habit.checkIns.length === 0 ? (
              <p className="text-zinc-400 text-xs py-8 text-center select-none">
                No check-ins logged yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {habit.checkIns.map((ci) => (
                  <div
                    key={ci.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-200/60 transition-all duration-200"
                  >
                    <span className="text-xs font-semibold text-zinc-800">{ci.localDate}</span>
                    <button
                      onClick={() => handleRemoveCheckIn(ci.localDate)}
                      className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 cursor-pointer"
                      aria-label={`Remove check-in for ${ci.localDate}`}
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <EditHabitDialog
        habit={habit}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchHabit}
      />
      <DeleteHabitDialog
        habit={habit}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => router.push('/dashboard')}
      />
      <BackfillCheckInDialog
        habit={habit}
        isOpen={isBackfillOpen}
        onClose={() => setIsBackfillOpen(false)}
        onSuccess={fetchHabit}
      />
    </div>
  )
}
