'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Render Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full p-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border text-xs shadow-sm bg-white/95 dark:bg-zinc-950 backdrop-blur-md transition-all duration-300 ${
              t.type === 'success'
                ? 'border-emerald-100 text-emerald-800 dark:border-emerald-950 dark:text-emerald-300'
                : t.type === 'error'
                ? 'border-red-100 text-red-800 dark:border-red-950 dark:text-red-300'
                : 'border-zinc-200/80 text-zinc-800 dark:border-zinc-800 dark:text-zinc-300'
            }`}
          >
            <span className="font-medium">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-3 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
