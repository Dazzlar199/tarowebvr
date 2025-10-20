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

    // Get all choices for this dilemma
    const choices = await prisma.choice.findMany({
      where: { dilemmaId: id }
    })

    const totalChoices = choices.length
    const choicesA = choices.filter(c => c.choice === 'A').length
    const choicesB = choices.filter(c => c.choice === 'B').length

    const percentageA = totalChoices > 0 ? Math.round((choicesA / totalChoices) * 100) : 50
    const percentageB = totalChoices > 0 ? Math.round((choicesB / totalChoices) * 100) : 50

    return successResponse({
      total: totalChoices,
      choicesA,
      choicesB,
      percentageA,
      percentageB,
    })

  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return errorResponse(error.message || 'Failed to fetch stats')
  }
}
