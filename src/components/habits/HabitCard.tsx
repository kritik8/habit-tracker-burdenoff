'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Flame, CheckCircle2, MoreVertical, Edit2, Trash2 } from 'lucide-react'

export interface HabitData {
  id: string
  name: string
  description?: string | null
  currentStreak: number
  longestStreak: number
  checkInsCount: number
  isCompletedToday?: boolean
}

interface HabitCardProps {
  habit: HabitData
  isCompleted: boolean
  onUpdate: () => void
  onEdit: (habit: HabitData) => void
  onDelete: (habit: HabitData) => void
}

export default function HabitCard({ habit, isCompleted, onUpdate, onEdit, onDelete }: HabitCardProps) {
  const { toast } = useToast()
  const [checkingIn, setCheckingIn] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleCheckIn = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isCompleted || checkingIn) return

    setCheckingIn(true)

    try {
      const res = await fetch(`/api/habits/${habit.id}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        toast(`Checked in for ${habit.name}!`, 'success')
        onUpdate()
      } else {
        toast(data.error || 'Failed to check in', 'error')
      }
    } catch {
      toast('Failed to connect to server', 'error')
    } finally {
      setCheckingIn(false)
    }
  }

  return (
    <div className="relative group bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md/5 hover:border-zinc-300/80 transition-all duration-300 flex flex-col space-y-4">
      <div className="flex items-start justify-between">
        <Link href={`/habits/${habit.id}`} className="flex-1 min-w-0 pr-4">
          <h3 className="font-semibold text-sm tracking-tight text-zinc-950 truncate group-hover:text-zinc-800 transition-colors">
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-normal font-normal">
              {habit.description}
            </p>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all duration-200 cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-1 w-28 bg-white border border-zinc-200/60 rounded-xl shadow-lg z-20 py-1.5 text-xs text-zinc-700 animate-slide-in">
                <button
                  onClick={() => {
                    onEdit(habit)
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(habit)
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs select-none">
        <div className="flex items-center gap-1.5 font-medium text-zinc-800">
          <Flame className={`w-4 h-4 ${habit.currentStreak > 0 ? 'text-amber-500 fill-amber-100' : 'text-zinc-300'}`} />
          <span>{habit.currentStreak} day streak</span>
        </div>
        <div className="text-zinc-400">
          Best <span className="font-semibold text-zinc-600">{habit.longestStreak}</span> days
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-100/80 flex items-center justify-between gap-4">
        <Link href={`/habits/${habit.id}`} className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-wider">
          View History
        </Link>

        {isCompleted ? (
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100/50 rounded-xl px-4 py-2 text-xs font-semibold select-none">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
        ) : (
          <Button
            onClick={handleCheckIn}
            disabled={checkingIn}
            variant="outline"
            className="h-8 text-xs px-4 rounded-xl border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm/5 font-semibold text-zinc-700 cursor-pointer"
          >
            {checkingIn ? 'Checking in...' : 'Check In'}
          </Button>
        )}
      </div>
    </div>
  )
}
