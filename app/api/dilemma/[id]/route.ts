import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const dilemma = await prisma.dilemma.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    })

    if (!dilemma) {
      return errorResponse('Dilemma not found', 404)
    }

    // Increment view count
    await prisma.dilemma.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })

    return successResponse(dilemma)

  } catch (error: any) {
    console.error('Error fetching dilemma:', error)
    return errorResponse(error.message || 'Failed to fetch dilemma')
  }
}
