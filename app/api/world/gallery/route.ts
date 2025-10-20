import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sort = searchParams.get('sort') || 'recent' // recent, popular, views
    const tag = searchParams.get('tag')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      visibility: 'PUBLIC',
      imageUrl: {
        not: null, // Only show worlds with generated images
      }
    }

    if (tag) {
      where.tags = {
        contains: tag
      }
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (sort) {
      case 'popular':
        orderBy = { likeCount: 'desc' }
        break
      case 'views':
        orderBy = { viewCount: 'desc' }
        break
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // Fetch worlds
    const [worlds, total] = await Promise.all([
      prisma.world.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
            }
          }
        }
      }),
      prisma.world.count({ where })
    ])

    // Parse tags for each world
    const worldsWithParsedTags = worlds.map(world => ({
      ...world,
      tags: world.tags ? world.tags.split(',') : []
    }))

    return successResponse({
      worlds: worldsWithParsedTags,
      total,
      page,
      limit,
      hasMore: skip + worlds.length < total,
    })

  } catch (error) {
    console.error('Error fetching gallery:', error)
    return errorResponse(error)
  }
}
