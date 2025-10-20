import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api-response'
import { z } from 'zod'

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'

const choiceSchema = z.object({
  dilemmaId: z.string().cuid('Invalid dilemma ID format'),
  choice: z.enum(['A', 'B']),
  timeSpent: z.number().optional(),
  vrSession: z.boolean().optional(),
  userId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = choiceSchema.safeParse(body)
    if (!validation.success) {
      return badRequestResponse('Invalid input: ' + validation.error.errors[0].message)
    }

    const { dilemmaId, choice, timeSpent, vrSession, userId } = validation.data

    // Get or create user
    let finalUserId = userId
    if (!finalUserId) {
      const anonymousUser = await prisma.user.findFirst({
        where: { username: 'anonymous' }
      })

      if (!anonymousUser) {
        const newUser = await prisma.user.create({
          data: {
            username: 'anonymous',
            role: 'USER',
          }
        })
        finalUserId = newUser.id
      } else {
        finalUserId = anonymousUser.id
      }
    }

    // Verify dilemma exists
    const dilemma = await prisma.dilemma.findUnique({
      where: { id: dilemmaId }
    })

    if (!dilemma) {
      return errorResponse('Dilemma not found', 404)
    }

    if (!dilemma.isActive || !dilemma.isApproved) {
      return errorResponse('Dilemma is not available', 403)
    }

    // Save or update choice (upsert pattern - one choice per user per dilemma)
    const savedChoice = await prisma.choice.upsert({
      where: {
        dilemmaId_userId: {
          dilemmaId,
          userId: finalUserId,
        }
      },
      update: {
        choice,
        timeSpent,
        vrSession: vrSession || false,
      },
      create: {
        dilemmaId,
        userId: finalUserId,
        choice,
        timeSpent,
        vrSession: vrSession || false,
      }
    })

    // Update dilemma choice count
    await prisma.dilemma.update({
      where: { id: dilemmaId },
      data: { choiceCount: { increment: 1 } }
    })

    console.log(`✅ Choice saved: User ${finalUserId} chose ${choice} for dilemma ${dilemmaId}`)

    return successResponse({
      choiceId: savedChoice.id,
      choice: savedChoice.choice,
      message: 'Choice saved successfully'
    }, 201)

  } catch (error: any) {
    console.error('❌ Error saving choice:', error)
    return errorResponse(error.message || 'Failed to save choice')
  }
}

// Get user's choice history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return badRequestResponse('userId is required')
    }

    const choices = await prisma.choice.findMany({
      where: { userId },
      include: {
        dilemma: {
          select: {
            id: true,
            title: true,
            description: true,
            optionA: true,
            optionB: true,
            category: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse({
      choices,
      count: choices.length
    })

  } catch (error: any) {
    console.error('❌ Error fetching choices:', error)
    return errorResponse(error.message || 'Failed to fetch choices')
  }
}
