import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const world = await prisma.world.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        },
        assets: true,
      }
    })

    if (!world) {
      return notFoundResponse('World not found')
    }

    // Increment view count
    await prisma.world.update({
      where: { id: params.id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    // Parse tags from comma-separated string
    const tags = world.tags ? world.tags.split(',') : []

    return successResponse({
      ...world,
      tags,
    })

  } catch (error) {
    console.error('Error fetching world:', error)
    return errorResponse(error)
  }
}
