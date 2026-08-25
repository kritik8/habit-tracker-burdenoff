import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-fallback-secret-key-change-in-production-123456789'
const secret = new TextEncoder().encode(JWT_SECRET)

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function encrypt(payload: Record<string, unknown>): Promise<string> {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function decrypt(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Creates an HTTP-only secure cookie session containing the user ID.
 */
export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const sessionToken = await encrypt({ userId, expiresAt: expiresAt.toISOString() })

  const cookieStore = await cookies()
  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

/**
 * Destroys the current user session by clearing the session cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

/**
 * Retrieves the current session's user payload if valid.
 */
export async function getSessionUser(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value
  if (!sessionToken) return null

  const payload = await decrypt(sessionToken)
  if (!payload || typeof payload.userId !== 'string') return null

  return { userId: payload.userId }
}
