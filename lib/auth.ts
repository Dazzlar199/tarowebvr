import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { serialize, parse } from 'cookie'
import { prisma } from './prisma'
import { env } from './env'
import { CONSTANTS, COOKIE_OPTIONS } from './constants'
import { CommonErrors } from './api-response'

export interface JWTPayload {
  userId: string
  username: string
  role: 'USER' | 'ADMIN'
}

export interface AuthUser extends JWTPayload {
  email?: string | null
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: CONSTANTS.JWT_EXPIRATION,
  })
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw CommonErrors.Unauthorized
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw CommonErrors.Unauthorized
    }
    throw error
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookies = parse(request.headers.get('cookie') || '')
  return cookies[CONSTANTS.SESSION_COOKIE_NAME] || null
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const token = getTokenFromRequest(request)

  if (!token) {
    throw CommonErrors.Unauthorized
  }

  const payload = verifyToken(token)

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      email: true,
    },
  })

  if (!user || !user.username) {
    throw CommonErrors.Unauthorized
  }

  return {
    userId: user.id,
    username: user.username,
    role: payload.role,
    email: user.email,
  }
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)

  if (user.role !== 'ADMIN') {
    throw CommonErrors.Forbidden
  }

  return user
}

export function setAuthCookie(token: string): string {
  return serialize(CONSTANTS.SESSION_COOKIE_NAME, token, COOKIE_OPTIONS)
}

export function clearAuthCookie(): string {
  return serialize(CONSTANTS.SESSION_COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  })
}

export function getUserIdFromCookie(request: NextRequest): string | null {
  const cookies = parse(request.headers.get('cookie') || '')
  return cookies[CONSTANTS.USER_ID_COOKIE_NAME] || null
}

export function setUserIdCookie(userId: string): string {
  return serialize(CONSTANTS.USER_ID_COOKIE_NAME, userId, COOKIE_OPTIONS)
}

export async function getUserFromCookie(request: NextRequest) {
  const userId = getUserIdFromCookie(request)

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
    },
  })

  return user
}
