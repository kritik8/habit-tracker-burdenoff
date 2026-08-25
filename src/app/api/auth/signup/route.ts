import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'
import { hashPassword, createSession } from '@/lib/auth/session'
import { isValidTimeZone } from '@/lib/dates/engine'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  timezone: z.string().refine(isValidTimeZone, {
    message: 'Invalid IANA timezone string',
  }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { email, password, timezone } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password and store user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        timezone,
      },
    })

    // Create session cookie
    await createSession(user.id)

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          timezone: user.timezone,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
