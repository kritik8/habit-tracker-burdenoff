/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle } from 'lucide-react'
import { HabitData } from './HabitCard'

interface CreateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateHabitDialog({ isOpen, onClose, onSuccess }: CreateDialogProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast('Habit name is required', 'error')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      })

      const data = await res.json()

      if (res.ok) {
        toast('Habit created successfully!', 'success')
        setName('')
        setDescription('')
        onSuccess()
        onClose()
      } else {
        toast(data.error || 'Failed to create habit', 'error')
      }
    } catch {
      toast('Failed to connect to server', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
      <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-md w-full shadow-lg p-6 relative flex flex-col space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-semibold text-base text-zinc-950">New Habit</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider" htmlFor="habit-name">
              Name
            </label>
            <input
              id="habit-name"
              type="text"
              required
              disabled={submitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800 disabled:opacity-50"
              placeholder="e.g. Read for 20 mins"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider" htmlFor="habit-description">
              Description
            </label>
            <textarea
              id="habit-description"
              disabled={submitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800 disabled:opacity-50 resize-none"
              placeholder="Why is this habit important? (Optional)"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditDialogProps {
  habit: HabitData | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditHabitDialog({ habit, isOpen, onClose, onSuccess }: EditDialogProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description || '')
    }
  }, [habit])

  if (!isOpen || !habit) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast('Habit name is required', 'error')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/habits/${habit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || '' }),
      })

      const data = await res.json()

      if (res.ok) {
        toast('Habit updated successfully!', 'success')
        onSuccess()
        onClose()
      } else {
        toast(data.error || 'Failed to update habit', 'error')
      }
    } catch {
      toast('Failed to connect to server', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
      <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-md w-full shadow-lg p-6 relative flex flex-col space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-semibold text-base text-zinc-950">Edit Habit</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider" htmlFor="edit-name">
              Name
            </label>
            <input
              id="edit-name"
              type="text"
              required
              disabled={submitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800 disabled:opacity-50"
              placeholder="e.g. Read for 20 mins"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider" htmlFor="edit-description">
              Description
            </label>
            <textarea
              id="edit-description"
              disabled={submitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800 disabled:opacity-50 resize-none"
              placeholder="Why is this habit important? (Optional)"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface DeleteDialogProps {
  habit: HabitData | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteHabitDialog({ habit, isOpen, onClose, onSuccess }: DeleteDialogProps) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen || !habit) return null

  const handleDelete = async () => {
    setSubmitting(true)

    try {
      const res = await fetch(`/api/habits/${habit.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        toast(`Deleted ${habit.name}`, 'success')
        onSuccess()
        onClose()
      } else {
        toast(data.error || 'Failed to delete habit', 'error')
      }
    } catch {
      toast('Failed to connect to server', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
      <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-sm w-full shadow-lg p-6 relative flex flex-col space-y-5 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-zinc-950">Delete habit?</h3>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto">
            Are you sure you want to delete <span className="font-semibold text-zinc-800">&quot;{habit.name}&quot;</span>? This will permanently erase its entire check-in history.
          </p>
        </div>

        <div className="flex gap-2 justify-end pt-2 w-full">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onClose}
            className="flex-1 h-9 rounded-xl text-xs font-semibold cursor-pointer border-zinc-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={handleDelete}
            className="flex-1 h-9 rounded-xl text-xs font-semibold cursor-pointer bg-red-600 hover:bg-red-500 text-white border border-transparent shadow-sm dark:bg-red-600 dark:hover:bg-red-500 dark:text-white"
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface BackfillDialogProps {
  habit: HabitData | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BackfillCheckInDialog({ habit, isOpen, onClose, onSuccess }: BackfillDialogProps) {
  const { toast } = useToast()
  const [date, setDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    setDate(todayStr)
  }, [isOpen])

  if (!isOpen || !habit) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) {
      toast('Please choose a date', 'error')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/habits/${habit.id}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localDate: date }),
      })

      const data = await res.json()

      if (res.ok) {
        toast(`Backfilled check-in for ${date}!`, 'success')
        onSuccess()
        onClose()
      } else {
        toast(data.error || 'Failed to record check-in', 'error')
      }
    } catch {
      toast('Failed to connect to server', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
      <div className="bg-white border border-zinc-200/80 rounded-2xl max-w-sm w-full shadow-lg p-6 relative flex flex-col space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-semibold text-base text-zinc-950">Backfill Check-In</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider" htmlFor="backfill-date">
              Select Date
            </label>
            <div className="relative">
              <input
                id="backfill-date"
                type="date"
                required
                disabled={submitting}
                max={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-800 disabled:opacity-50 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal pt-1">
              Provide a calendar date in your timezone. Backfilling will update streaks automatically.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Record Check-in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
