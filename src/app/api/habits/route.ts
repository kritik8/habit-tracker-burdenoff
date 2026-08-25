import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { getLocalCalendarDate } from '@/lib/dates/engine'
import { calculateStreaks } from '@/lib/dates/streaks'

const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Retrieve habits and associated check-ins
    const habits = await prisma.habit.findMany({
      where: { userId: session.userId },
      include: {
        checkIns: {
          select: {
            localDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const todayLocalDate = getLocalCalendarDate(new Date(), user.timezone)

    const habitsWithStreaks = habits.map((habit) => {
      const dates = habit.checkIns.map((ci) => ci.localDate)
      const streaks = calculateStreaks(dates, todayLocalDate)
      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
        checkInsCount: dates.length,
        checkIns: dates,
        isCompletedToday: dates.includes(todayLocalDate),
        ...streaks,
      }
    })

    return NextResponse.json({ habits: habitsWithStreaks })
  } catch (error) {
    console.error('GET habits error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createHabitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { name, description } = parsed.data

    const habit = await prisma.habit.create({
      data: {
        userId: session.userId,
        name,
        description,
      },
    })

    return NextResponse.json({ habit }, { status: 201 })
  } catch (error) {
    console.error('POST habit error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
