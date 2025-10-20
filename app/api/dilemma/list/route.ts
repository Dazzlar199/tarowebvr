import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const visibility = searchParams.get('visibility') || 'PUBLIC'
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'recent'
    const limit = parseInt(searchParams.get('limit') || '50')

    const dilemmas = await prisma.dilemma.findMany({
      where: {
        visibility,
        isActive: true,
        ...(category && { category }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        }
      },
      orderBy: sort === 'popular'
        ? { choiceCount: 'desc' }
        : sort === 'views'
        ? { viewCount: 'desc' }
        : { createdAt: 'desc' },
      take: limit,
    })

    return successResponse({
      dilemmas,
      count: dilemmas.length,
    })

  } catch (error: any) {
    console.error('❌ Error fetching dilemmas:', error)
    return errorResponse(error.message || 'Failed to fetch dilemmas')
  }
}
