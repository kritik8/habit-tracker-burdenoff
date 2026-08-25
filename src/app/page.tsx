import { Button } from '@/components/ui/button'
import { CheckCircle2, Flame, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-zinc-900 font-sans selection:bg-zinc-200">
      <main className="max-w-md w-full bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center space-y-8">
        {/* Header Icon */}
        <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center shadow-inner">
          <Flame className="w-6 h-6 text-zinc-800 animate-pulse" />
        </div>

        {/* Hero Section */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Habit Tracker with Streaks
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
            A full-stack, timezone-aware habit tracker focused on calendar-day streaks.
          </p>
        </div>

        {/* Feature Cards (Proving CSS Grid & Border styling) */}
        <div className="w-full grid grid-cols-2 gap-3 text-left">
          <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-1.5">
            <CheckCircle2 className="w-4 h-4 text-zinc-600" />
            <h3 className="text-xs font-semibold text-zinc-800">Check-ins</h3>
            <p className="text-[11px] text-zinc-400">Strict local day validation</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-1.5">
            <Sparkles className="w-4 h-4 text-zinc-600" />
            <h3 className="text-xs font-semibold text-zinc-800">Streaks</h3>
            <p className="text-[11px] text-zinc-400">Calculated server-side</p>
          </div>
        </div>

        {/* CTA (Proving shadcn/ui Button) */}
        <div className="w-full pt-2 flex flex-col gap-2">
          <Button variant="default" className="w-full h-10 text-xs font-medium">
            Get Started
          </Button>
          <Button variant="outline" className="w-full h-10 text-xs font-medium">
            Learn More
          </Button>
        </div>
      </main>

      <footer className="mt-8 text-center text-xs text-zinc-400">
        Phase 1 Project Foundation
      </footer>
    </div>
  )
}
