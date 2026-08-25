import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { getLocalCalendarDate } from '@/lib/dates/engine'
import { calculateStreaks } from '@/lib/dates/streaks'

const checkInSchema = z.object({
  localDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD')
    .optional(),
})

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch user and habit
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const habit = await prisma.habit.findUnique({
      where: { id },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    if (habit.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body safely
    const body = await request.json().catch(() => ({}))
    const parsed = checkInSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const now = new Date()
    const todayLocalDate = getLocalCalendarDate(now, user.timezone)

    // Resolve target localDate
    const localDate = parsed.data.localDate || todayLocalDate

    // 1. Reject future dates
    if (localDate > todayLocalDate) {
      return NextResponse.json(
        { error: 'Cannot check in for future dates' },
        { status: 400 }
      )
    }

    // 2. Reject dates before habit creation
    const habitCreatedLocalDate = getLocalCalendarDate(habit.createdAt, user.timezone)
    if (localDate < habitCreatedLocalDate) {
      return NextResponse.json(
        { error: 'Cannot check in for a date before the habit was created' },
        { status: 400 }
      )
    }

    // 3. Reject duplicates (check if check-in already exists)
    const existingCheckIn = await prisma.checkIn.findUnique({
      where: {
        habitId_localDate: {
          habitId: id,
          localDate,
        },
      },
    })

    if (existingCheckIn) {
      return NextResponse.json(
        { error: 'Already checked in for this date' },
        { status: 409 }
      )
    }

    // Store check-in
    await prisma.checkIn.create({
      data: {
        habitId: id,
        localDate,
        checkedInAtUtc: now,
      },
    })

    // Fetch updated check-ins to recompute streaks
    const updatedHabit = await prisma.habit.findUnique({
      where: { id },
      include: {
        checkIns: {
          orderBy: { localDate: 'desc' },
        },
      },
    })

    if (!updatedHabit) {
      return NextResponse.json({ error: 'Habit not found after check-in' }, { status: 500 })
    }

    const checkInDates = updatedHabit.checkIns.map((ci) => ci.localDate)
    const streaks = calculateStreaks(checkInDates, todayLocalDate)

    return NextResponse.json({
      habit: {
        id: updatedHabit.id,
        name: updatedHabit.name,
        description: updatedHabit.description,
        createdAt: updatedHabit.createdAt,
        updatedAt: updatedHabit.updatedAt,
        checkInsCount: checkInDates.length,
        ...streaks,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const localDate = searchParams.get('localDate')

    if (!localDate || !/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
      return NextResponse.json(
        { error: 'Valid localDate parameter (YYYY-MM-DD) is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const habit = await prisma.habit.findUnique({
      where: { id },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    if (habit.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if check-in exists
    const checkIn = await prisma.checkIn.findUnique({
      where: {
        habitId_localDate: {
          habitId: id,
          localDate,
        },
      },
    })

    if (!checkIn) {
      return NextResponse.json(
        { error: 'Check-in not found for the specified date' },
        { status: 404 }
      )
    }

    // Delete check-in
    await prisma.checkIn.delete({
      where: {
        habitId_localDate: {
          habitId: id,
          localDate,
        },
      },
    })

    // Return updated details
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    })

    const updatedHabit = await prisma.habit.findUnique({
      where: { id },
      include: {
        checkIns: true,
      },
    })

    const dates = updatedHabit?.checkIns.map((ci) => ci.localDate) || []
    const todayLocalDate = getLocalCalendarDate(new Date(), user!.timezone)
    const streaks = calculateStreaks(dates, todayLocalDate)

    return NextResponse.json({
      success: true,
      habit: {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
        checkInsCount: dates.length,
        ...streaks,
      },
    })
  } catch (error) {
    console.error('Delete check-in error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
