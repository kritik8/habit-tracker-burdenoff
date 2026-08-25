import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/db/client'
import { getSessionUser } from '@/lib/auth/session'

// 1. Mock the Prisma Client
vi.mock('@/lib/db/client', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    habit: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    checkIn: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  }
  return { prisma: mockPrisma }
})

// 2. Mock the session helper
vi.mock('@/lib/auth/session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/session')>('@/lib/auth/session')
  return {
    ...actual,
    createSession: vi.fn().mockResolvedValue(undefined),
    destroySession: vi.fn().mockResolvedValue(undefined),
    getSessionUser: vi.fn(),
  }
})

// Import Route Handlers
import { POST as signupPOST } from '@/app/api/auth/signup/route'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { GET as habitsGET, POST as habitsPOST } from '@/app/api/habits/route'
import { POST as checkInPOST } from '@/app/api/habits/[id]/check-in/route'

describe('API Endpoints & Validations', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST /api/auth/signup', () => {
    it('should reject invalid timezone format', async () => {
      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          timezone: 'Invalid/Zone',
        }),
      })

      const response = await signupPOST(request)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid input')
    })

    it('should reject duplicate email registrations', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        timezone: 'Asia/Kolkata',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          timezone: 'Asia/Kolkata',
        }),
      })

      const response = await signupPOST(request)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Email already registered')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should reject incorrect credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null) // User does not exist

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        }),
      })

      const response = await loginPOST(request)
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Invalid email or password')
    })
  })

  describe('Habit CRUD & Permissions', () => {
    it('should reject unauthenticated requests to list habits', async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null)

      const response = await habitsGET()
      expect(response.status).toBe(401)
    })

    it('should allow creating habit with valid session', async () => {
      vi.mocked(getSessionUser).mockResolvedValue({ userId: 'user-123' })
      vi.mocked(prisma.habit.create).mockResolvedValue({
        id: 'habit-456',
        userId: 'user-123',
        name: 'Morning Meds',
        description: 'Take with water',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new Request('http://localhost/api/habits', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Morning Meds',
          description: 'Take with water',
        }),
      })

      const response = await habitsPOST(request)
      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.habit.name).toBe('Morning Meds')
    })
  })

  describe('POST /api/habits/[id]/check-in', () => {
    it('should reject check-ins for future dates', async () => {
      vi.mocked(getSessionUser).mockResolvedValue({ userId: 'user-123' })
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed',
        timezone: 'Asia/Kolkata',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.mocked(prisma.habit.findUnique).mockResolvedValue({
        id: 'habit-1',
        userId: 'user-123',
        name: 'Water Plants',
        description: null,
        createdAt: new Date('2026-03-10T12:00:00Z'),
        updatedAt: new Date(),
      })

      // Try to check in for tomorrow (current date mock handles today)
      // Since local date in Kolkata is tested, let's pass a future year/date
      const request = new Request('http://localhost/api/habits/habit-1/check-in', {
        method: 'POST',
        body: JSON.stringify({
          localDate: '2099-12-31', // definitely in the future
        }),
      })

      const response = await checkInPOST(request, { params: Promise.resolve({ id: 'habit-1' }) })
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Cannot check in for future dates')
    })

    it('should reject check-ins prior to habit creation date', async () => {
      vi.mocked(getSessionUser).mockResolvedValue({ userId: 'user-123' })
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed',
        timezone: 'Asia/Kolkata',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.mocked(prisma.habit.findUnique).mockResolvedValue({
        id: 'habit-1',
        userId: 'user-123',
        name: 'Water Plants',
        description: null,
        createdAt: new Date('2026-03-10T12:00:00Z'), // Created local date: 2026-03-10
        updatedAt: new Date(),
      })

      // Attempt to check in for 2026-03-09
      const request = new Request('http://localhost/api/habits/habit-1/check-in', {
        method: 'POST',
        body: JSON.stringify({
          localDate: '2026-03-09',
        }),
      })

      const response = await checkInPOST(request, { params: Promise.resolve({ id: 'habit-1' }) })
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Cannot check in for a date before the habit was created')
    })

    it('should reject duplicate check-ins for the same local calendar day', async () => {
      vi.mocked(getSessionUser).mockResolvedValue({ userId: 'user-123' })
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed',
        timezone: 'Asia/Kolkata',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      vi.mocked(prisma.habit.findUnique).mockResolvedValue({
        id: 'habit-1',
        userId: 'user-123',
        name: 'Water Plants',
        description: null,
        createdAt: new Date('2026-03-10T12:00:00Z'),
        updatedAt: new Date(),
      })
      // Mock existing check-in search to return a matched record
      vi.mocked(prisma.checkIn.findUnique).mockResolvedValue({
        id: 'checkin-1',
        habitId: 'habit-1',
        localDate: '2026-03-11',
        checkedInAtUtc: new Date(),
        createdAt: new Date(),
      })

      const request = new Request('http://localhost/api/habits/habit-1/check-in', {
        method: 'POST',
        body: JSON.stringify({
          localDate: '2026-03-11',
        }),
      })

      const response = await checkInPOST(request, { params: Promise.resolve({ id: 'habit-1' }) })
      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data.error).toBe('Already checked in for this date')
    })
  })
})
