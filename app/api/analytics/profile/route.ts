import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 윤리 성향 계산 로직
function analyzeEthics(choices: any[]) {
  let utilitarian = 0 // 최대 다수의 최대 행복
  let deontological = 0 // 의무론적, 원칙 중심
  let virtueEthics = 0 // 덕 윤리, 성품 중심
  let pragmatic = 0 // 실용주의
  let emotional = 0 // 감정 중심

  choices.forEach(choice => {
    const dilemma = choice.dilemma

    // 복잡도와 감정 강도 기반 분석
    if (dilemma.complexity > 7) {
      deontological += 2
    }

    if (dilemma.emotionalIntensity > 7) {
      emotional += 2
      virtueEthics += 1
    }

    // 카테고리 기반 분석
    if (dilemma.category === 'social' || dilemma.category === 'politics') {
      utilitarian += 1
    }

    if (dilemma.category === 'personal' || dilemma.category === 'family') {
      virtueEthics += 1
    }

    if (dilemma.category === 'business' || dilemma.category === 'economy') {
      pragmatic += 2
    }

    // 선택 패턴 분석 (A vs B)
    // 통계적으로 A가 더 많이 선택되면 pragmatic
    // B가 더 많이 선택되면 emotional
    utilitarian += 1 // 기본값
  })

  const total = utilitarian + deontological + virtueEthics + pragmatic + emotional

  if (total === 0) {
    return {
      utilitarian: 20,
      deontological: 20,
      virtueEthics: 20,
      pragmatic: 20,
      emotional: 20
    }
  }

  return {
    utilitarian: Math.round((utilitarian / total) * 100),
    deontological: Math.round((deontological / total) * 100),
    virtueEthics: Math.round((virtueEthics / total) * 100),
    pragmatic: Math.round((pragmatic / total) * 100),
    emotional: Math.round((emotional / total) * 100)
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    // userId 없으면 익명 전체 통계 반환
    const whereClause = userId ? { userId } : {}

    // 사용자의 선택 기록
    const userChoices = await prisma.choice.findMany({
      where: whereClause,
      include: {
        dilemma: {
          select: {
            id: true,
            title: true,
            category: true,
            complexity: true,
            emotionalIntensity: true,
            optionA: true,
            optionB: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (userChoices.length === 0) {
      return successResponse({
        totalChoices: 0,
        ethics: {
          utilitarian: 20,
          deontological: 20,
          virtueEthics: 20,
          pragmatic: 20,
          emotional: 20
        },
        topCategories: [],
        recentChoices: []
      })
    }

    // 윤리 성향 분석
    const ethics = analyzeEthics(userChoices)

    // 카테고리별 선택 횟수
    const categoryCount: Record<string, number> = {}
    userChoices.forEach(choice => {
      const cat = choice.dilemma.category
      categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }))

    // 최근 선택 5개
    const recentChoices = userChoices.slice(0, 5).map(choice => ({
      dilemmaId: choice.dilemmaId,
      title: choice.dilemma.title,
      choice: choice.choice,
      choiceText: choice.choice === 'A' ? choice.dilemma.optionA : choice.dilemma.optionB,
      createdAt: choice.createdAt
    }))

    // 평균 복잡도/감정 강도
    const avgComplexity = userChoices.reduce((sum, c) => sum + (c.dilemma.complexity || 5), 0) / userChoices.length
    const avgEmotionalIntensity = userChoices.reduce((sum, c) => sum + (c.dilemma.emotionalIntensity || 5), 0) / userChoices.length

    return successResponse({
      totalChoices: userChoices.length,
      ethics,
      topCategories,
      recentChoices,
      averages: {
        complexity: avgComplexity.toFixed(1),
        emotionalIntensity: avgEmotionalIntensity.toFixed(1)
      }
    })

  } catch (error: any) {
    console.error('❌ Error fetching user profile:', error)
    return errorResponse(error.message || 'Failed to fetch profile')
  }
}
