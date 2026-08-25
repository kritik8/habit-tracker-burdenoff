import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { getLocalCalendarDate } from '@/lib/dates/engine'
import { calculateStreaks } from '@/lib/dates/streaks'

const updateHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  description: z.string().optional(),
})

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const habit = await prisma.habit.findUnique({
      where: { id },
      include: {
        checkIns: {
          orderBy: { localDate: 'desc' },
        },
      },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    if (habit.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const dates = habit.checkIns.map((ci) => ci.localDate)
    const todayLocalDate = getLocalCalendarDate(new Date(), user.timezone)
    const streaks = calculateStreaks(dates, todayLocalDate)

    return NextResponse.json({
      habit: {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        createdAt: habit.createdAt,
        updatedAt: habit.updatedAt,
        checkIns: habit.checkIns,
        checkInsCount: dates.length,
        ...streaks,
      },
    })
  } catch (error) {
    console.error('GET habit detail error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

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

    const body = await request.json()
    const parsed = updateHabitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json({ habit: updatedHabit })
  } catch (error) {
    console.error('PUT habit error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

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

    await prisma.habit.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Habit deleted successfully' })
  } catch (error) {
    console.error('DELETE habit error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
