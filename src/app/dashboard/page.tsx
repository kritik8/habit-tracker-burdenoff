/* eslint-disable react-hooks/set-state-in-effect */
'use client'


import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import HabitCard, { HabitData } from '@/components/habits/HabitCard'
import {
  CreateHabitDialog,
  EditHabitDialog,
  DeleteHabitDialog,
} from '@/components/habits/HabitDialogs'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Flame, Plus, Sparkles, Loader2, CalendarRange } from 'lucide-react'

interface UserProfile {
  email: string
  timezone: string
}

export default function Dashboard() {
  const { toast } = useToast()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [habits, setHabits] = useState<HabitData[]>([])
  const [loading, setLoading] = useState(true)
  const [todayDateStr, setTodayDateStr] = useState('')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<HabitData | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const userRes = await fetch('/api/auth/me')
      if (!userRes.ok) throw new Error('Unauthenticated')
      const userData = await userRes.json()
      setUser(userData.user)

      const habitsRes = await fetch('/api/habits')
      if (!habitsRes.ok) throw new Error('Failed to load habits')
      const habitsData = await habitsRes.json()
      setHabits(habitsData.habits)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data'
      console.error(err)
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!user?.timezone) return

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: user.timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      setTodayDateStr(formatter.format(new Date()))
    } catch {
      setTodayDateStr(new Date().toDateString())
    }
  }, [user])

  const handleEditClick = (habit: HabitData) => {
    setSelectedHabit(habit)
    setIsEditOpen(true)
  }

  const handleDeleteClick = (habit: HabitData) => {
    setSelectedHabit(habit)
    setIsDeleteOpen(true)
  }

  const completedCount = habits.filter((h) => h.isCompletedToday).length
  const totalCount = habits.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const userGreetingName = user ? user.email.split('@')[0] : 'there'
  const capitalizedGreetingName =
    userGreetingName.charAt(0).toUpperCase() + userGreetingName.slice(1)

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 selection:bg-zinc-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-zinc-950">
              Good morning, {capitalizedGreetingName}
            </h1>
            <p className="text-xs text-zinc-500 font-normal">
              Small actions compound. Sticking to details creates routines.
            </p>
          </div>

          {user && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200/80 rounded-xl text-[10px] font-semibold text-zinc-500 shadow-sm/5 w-fit select-none">
              <CalendarRange className="w-3.5 h-3.5 text-zinc-400" />
              <span>{todayDateStr} ({user.timezone})</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
            <p className="text-xs text-zinc-400">Loading your habits...</p>
          </div>
        ) : (
          <>
            {totalCount > 0 && (
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Today&apos;s progress
                  </span>
                  <span className="text-zinc-500">
                    {completedCount} / {totalCount} habits completed ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200/20">
                  <div
                    className="bg-zinc-900 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">
                Your habits
              </h2>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="h-8 text-xs gap-1.5 px-3.5 rounded-xl font-semibold cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Habit</span>
              </Button>
            </div>

            {totalCount === 0 ? (
              <div className="bg-white border border-zinc-200/80 rounded-2xl py-12 px-6 shadow-sm flex flex-col items-center text-center space-y-5">
                <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center shadow-inner text-zinc-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-sm text-zinc-950">Build your first habit</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto">
                    Small consistent actions become meaningful over time. Take the first step.
                  </p>
                </div>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Create your first habit</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={!!habit.isCompletedToday}
                    onUpdate={fetchData}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <CreateHabitDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchData}
      />
      <EditHabitDialog
        habit={selectedHabit}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedHabit(null)
        }}
        onSuccess={fetchData}
      />
      <DeleteHabitDialog
        habit={selectedHabit}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setSelectedHabit(null)
        }}
        onSuccess={fetchData}
      />
    </div>
  )
}
