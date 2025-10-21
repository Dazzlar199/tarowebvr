import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 전체 딜레마 통계
    const dilemmaStats = await prisma.dilemma.findMany({
      where: {
        isActive: true,
        choiceCount: { gt: 0 }
      },
      select: {
        id: true,
        title: true,
        category: true,
        choiceCount: true,
        viewCount: true,
        complexity: true,
        emotionalIntensity: true,
        choices: {
          select: {
            choice: true,
          }
        }
      },
      orderBy: {
        choiceCount: 'desc'
      },
      take: 20
    })

    // 각 딜레마별 A/B 선택 비율 계산
    const dilemmasWithRatio = dilemmaStats.map(dilemma => {
      const choiceA = dilemma.choices.filter(c => c.choice === 'A').length
      const choiceB = dilemma.choices.filter(c => c.choice === 'B').length
      const total = choiceA + choiceB

      return {
        id: dilemma.id,
        title: dilemma.title,
        category: dilemma.category,
        choiceCount: dilemma.choiceCount,
        viewCount: dilemma.viewCount,
        complexity: dilemma.complexity,
        emotionalIntensity: dilemma.emotionalIntensity,
        choiceA,
        choiceB,
        ratioA: total > 0 ? (choiceA / total) * 100 : 50,
        ratioB: total > 0 ? (choiceB / total) * 100 : 50,
      }
    })

    // 카테고리별 통계
    const categoryStats = await prisma.$queryRaw<Array<{category: string, count: bigint}>>`
      SELECT category, COUNT(*)::int as count
      FROM "Dilemma"
      WHERE "isActive" = true
      GROUP BY category
      ORDER BY count DESC
    `

    // 전체 통계
    const totalDilemmas = await prisma.dilemma.count({
      where: { isActive: true }
    })

    const totalChoices = await prisma.choice.count()

    const totalViews = await prisma.dilemma.aggregate({
      where: { isActive: true },
      _sum: { viewCount: true }
    })

    return successResponse({
      dilemmas: dilemmasWithRatio,
      categories: categoryStats.map(c => ({
        category: c.category,
        count: Number(c.count)
      })),
      summary: {
        totalDilemmas,
        totalChoices,
        totalViews: totalViews._sum.viewCount || 0,
        avgChoicesPerDilemma: totalDilemmas > 0 ? totalChoices / totalDilemmas : 0
      }
    })

  } catch (error: any) {
    console.error('❌ Error fetching global analytics:', error)
    return errorResponse(error.message || 'Failed to fetch analytics')
  }
}
