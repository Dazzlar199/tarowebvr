import { NextRequest, NextResponse } from 'next/server'
import { generateAdvancedDilemma, generateScenarioDilemma, getRandomTheme, getRandomScenarioType } from '@/lib/langchain-dilemma'
import { prisma } from '@/lib/prisma'
import { generateDilemmaImage } from '@/lib/gemini'
import { generateSceneFromPrompt } from '@/lib/ai/scene-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      theme,
      complexity,
      emotionalIntensity,
      context,
      mode = 'random', // 'random', 'custom', 'scenario'
      autoSave = true,
      generateImage = true,
    } = body

    let dilemma

    // 모드에 따라 다른 생성 방식 사용
    if (mode === 'scenario') {
      const scenario = getRandomScenarioType()
      dilemma = await generateScenarioDilemma(scenario)
    } else if (mode === 'random') {
      // 완전 랜덤 생성
      const randomTheme = getRandomTheme()
      const complexities = ['simple', 'moderate', 'complex', 'paradoxical'] as const
      const intensities = ['low', 'medium', 'high', 'extreme'] as const

      dilemma = await generateAdvancedDilemma({
        theme: randomTheme,
        complexity: complexities[Math.floor(Math.random() * complexities.length)],
        emotionalIntensity: intensities[Math.floor(Math.random() * intensities.length)],
        context: '현대 사회',
      })
    } else {
      // 커스텀 파라미터로 생성
      dilemma = await generateAdvancedDilemma({
        theme,
        complexity,
        emotionalIntensity,
        context,
      })
    }

    console.log('✅ Dilemma generated:', dilemma.title)

    // 이미지 생성 (선택적)
    let imageUrl: string | null = null
    if (generateImage) {
      try {
        console.log('🍌 Generating image with Nano Banana...')
        imageUrl = await generateDilemmaImage({
          title: dilemma.title,
          description: dilemma.description,
          optionA: dilemma.optionA,
          optionB: dilemma.optionB,
          category: dilemma.category,
        })
        console.log('✅ Image generated:', imageUrl ? 'Success' : 'Failed')
      } catch (imageError) {
        console.error('Image generation failed:', imageError)
        // 이미지 생성 실패해도 딜레마는 반환
      }
    }

    // 3D 장면 생성 (GPT-4로 프롬프트 기반 고유 씬 생성)
    let sceneDataJson: string | null = null
    try {
      console.log('🎨 Generating 3D scene with GPT-4...')
      const scenePrompt = `${dilemma.title}. ${dilemma.description}. ${dilemma.situation || ''}`
      const scene3D = await generateSceneFromPrompt(
        scenePrompt,
        dilemma.category,
        dilemma.title,
        dilemma.situation
      )
      sceneDataJson = JSON.stringify(scene3D)
      console.log('✅ 3D scene generated:', scene3D.objects.length, 'objects')
    } catch (sceneError) {
      console.error('3D scene generation failed:', sceneError)
      // 씬 생성 실패해도 딜레마는 반환
    }

    // 자동 저장 (DB에 저장)
    let savedDilemmaId: string | undefined

    if (autoSave) {
      try {
        const savedDilemma = await prisma.dilemma.create({
          data: {
            title: dilemma.title,
            description: dilemma.description,
            situation: dilemma.situation,
            optionA: dilemma.optionA,
            optionB: dilemma.optionB,
            category: dilemma.category,
            imageUrl: imageUrl,
            sceneData: sceneDataJson, // 생성된 3D 장면 저장
            isActive: true,
            totalResponses: 0,
            countA: 0,
            countB: 0,
          },
        })

        savedDilemmaId = savedDilemma.id
        console.log('✅ Dilemma saved to DB:', savedDilemmaId)
      } catch (saveError) {
        console.error('Failed to save dilemma to DB:', saveError)
      }
    }

    return NextResponse.json({
      success: true,
      dilemma: {
        id: savedDilemmaId,
        title: dilemma.title,
        situation: dilemma.situation,
        description: dilemma.description,
        facts: dilemma.facts,
        optionA: dilemma.optionA,
        optionB: dilemma.optionB,
        category: dilemma.category,
        imageUrl,
        immediateConsequences: dilemma.immediateConsequences,
        longTermConsequences: dilemma.longTermConsequences,
        ethicalPrinciples: dilemma.ethicalPrinciples,
        hiddenMeaning: dilemma.hiddenMeaning,
      },
      saved: autoSave,
    })
  } catch (error: any) {
    console.error('Error generating dilemma:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate dilemma',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// GET 요청 - 랜덤 딜레마 빠르게 생성
export async function GET(request: NextRequest) {
  try {
    const randomTheme = getRandomTheme()
    const complexities = ['simple', 'moderate', 'complex', 'paradoxical'] as const
    const intensities = ['low', 'medium', 'high', 'extreme'] as const

    const dilemma = await generateAdvancedDilemma({
      theme: randomTheme,
      complexity: complexities[Math.floor(Math.random() * complexities.length)],
      emotionalIntensity: intensities[Math.floor(Math.random() * intensities.length)],
      context: '현대 사회',
    })

    // 3D 장면 생성 (GET 요청도 고유 씬 생성)
    let sceneDataJson: string | null = null
    try {
      console.log('🎨 Generating 3D scene with GPT-4...')
      const scenePrompt = `${dilemma.title}. ${dilemma.description}. ${dilemma.situation || ''}`
      const scene3D = await generateSceneFromPrompt(
        scenePrompt,
        dilemma.category,
        dilemma.title,
        dilemma.situation
      )
      sceneDataJson = JSON.stringify(scene3D)
      console.log('✅ 3D scene generated:', scene3D.objects.length, 'objects')
    } catch (sceneError) {
      console.error('3D scene generation failed:', sceneError)
    }

    // DB에 저장
    const savedDilemma = await prisma.dilemma.create({
      data: {
        title: dilemma.title,
        description: dilemma.description,
        situation: dilemma.situation,
        optionA: dilemma.optionA,
        optionB: dilemma.optionB,
        category: dilemma.category,
        sceneData: sceneDataJson, // 3D 장면도 함께 저장
        isActive: true,
        totalResponses: 0,
        countA: 0,
        countB: 0,
      },
    })

    return NextResponse.json({
      success: true,
      dilemma: {
        id: savedDilemma.id,
        title: dilemma.title,
        description: dilemma.description,
        optionA: dilemma.optionA,
        optionB: dilemma.optionB,
        category: dilemma.category,
      },
    })
  } catch (error: any) {
    console.error('Error generating dilemma:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate dilemma',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
