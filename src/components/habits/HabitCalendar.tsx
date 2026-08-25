'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HabitCalendarProps {
  checkInDates: string[]
  habitCreatedAt: string
}

export default function HabitCalendar({ checkInDates, habitCreatedAt }: HabitCalendarProps) {
  const checkInSet = new Set(checkInDates)

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthName = viewDate.toLocaleString('en-US', { month: 'long' })
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1
    const yyyy = year
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(dayNum).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`

    return {
      dayNum,
      dateStr,
      isCompleted: checkInSet.has(dateStr),
      isBeforeCreation: dateStr < habitCreatedAt.split('T')[0],
      isFuture: dateStr > new Date().toISOString().split('T')[0],
    }
  })

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">
          History Calendar
        </h3>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-800">
            {monthName} {year}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-zinc-400">
        {weekDays.map((wd) => (
          <div key={wd} className="py-1">
            {wd}
          </div>
        ))}

        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          let bgClass = 'bg-zinc-50/50 border-zinc-100 text-zinc-600'
          let title = `Not completed (${day.dateStr})`

          if (day.isCompleted) {
            bgClass = 'bg-zinc-900 border-transparent text-white font-bold'
            title = `Completed (${day.dateStr})`
          } else if (day.isBeforeCreation) {
            bgClass = 'bg-zinc-100/30 border-zinc-100/10 text-zinc-300 cursor-not-allowed'
            title = `Before creation (${day.dateStr})`
          } else if (day.isFuture) {
            bgClass = 'bg-zinc-50/20 border-zinc-100/10 text-zinc-300 cursor-not-allowed'
            title = `Future date (${day.dateStr})`
          }

          return (
            <div
              key={day.dateStr}
              title={title}
              className={`aspect-square flex items-center justify-center rounded-lg border text-xs transition-all duration-200 ${bgClass}`}
            >
              {day.dayNum}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 pt-2 text-[10px] text-zinc-400 font-semibold select-none border-t border-zinc-100/80">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-zinc-900 rounded border border-transparent" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-zinc-50/50 rounded border border-zinc-100" />
          <span>Uncompleted</span>
        </div>
      </div>
    </div>
  )
}
