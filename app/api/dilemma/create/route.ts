import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDilemma, generateRandomDilemma, getDefaultDilemma } from '@/lib/ai/dilemma-generator'
import { generateSceneFromPrompt } from '@/lib/ai/scene-generator'
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api-response'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      theme,
      category,
      complexity,
      emotionalIntensity,
      context,
      userId,
      useAI = true,
    } = body

    console.log('🎭 Starting dilemma generation...')

    // For MVP, create anonymous user if not provided
    let authorId = userId
    if (!authorId) {
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
        authorId = newUser.id
      } else {
        authorId = anonymousUser.id
      }
    }

    // Generate dilemma
    let dilemmaData

    if (!useAI) {
      console.log('📝 Using default dilemma')
      dilemmaData = getDefaultDilemma()
    } else if (theme || category || complexity || emotionalIntensity || context) {
      console.log('🎯 Generating custom dilemma')
      dilemmaData = await generateDilemma({
        theme,
        category,
        complexity,
        emotionalIntensity,
        context,
      })
    } else {
      console.log('🎲 Generating random dilemma')
      dilemmaData = await generateRandomDilemma()
    }

    console.log('✅ Dilemma generated:', dilemmaData.title)

    // Generate 3D scene for the dilemma (only for AI mode)
    let sceneData: string | null = null
    if (useAI) {
      try {
        console.log('🏗️ Generating 3D dilemma scene...')

        // Create detailed prompt for 3D scene generation
        const facts = Array.isArray(dilemmaData.facts) ? dilemmaData.facts : JSON.parse(dilemmaData.facts)

        const scenePrompt = `
DILEMMA TITLE: ${dilemmaData.title}

CATEGORY: ${dilemmaData.category}

FULL SITUATION: ${dilemmaData.situation}

CHOICE A: ${dilemmaData.optionA}
CHOICE B: ${dilemmaData.optionB}

CONTEXT FACTS:
${facts.join('\n')}

IMPORTANT: Create a realistic 3D environment that matches the scenario context.
- If this is about vehicles/traffic, create roads, cars, traffic lights, crosswalks
- If this is medical/hospital, create medical equipment, hospital building, beds
- If this is office/work, create desks, computers, office furniture
- If this is nature/outdoor, create trees, natural elements
- Add relevant objects that make the scene believable and immersive
- Position two distinct choice zones (left for option A, right for option B)
- Use appropriate colors and lighting for the scenario type
`

        const scene = await generateSceneFromPrompt(
          scenePrompt,
          dilemmaData.category,
          dilemmaData.title,
          dilemmaData.situation
        )
        sceneData = JSON.stringify(scene)
        console.log('✅ 3D scene generated with', JSON.parse(sceneData).objects.length, 'objects')
      } catch (sceneError: any) {
        console.error('❌ 3D scene generation failed:', sceneError)
        sceneData = null
      }
    } else {
      console.log('⏭️ Skipping 3D scene generation for DEFAULT mode')
    }

    // Create dilemma record
    const dilemma = await prisma.dilemma.create({
      data: {
        title: dilemmaData.title,
        description: dilemmaData.description,
        optionA: dilemmaData.optionA,
        optionB: dilemmaData.optionB,

        situation: dilemmaData.situation,
        facts: JSON.stringify(dilemmaData.facts),

        immediateConsequences: JSON.stringify(dilemmaData.immediateConsequences),
        longTermConsequences: JSON.stringify(dilemmaData.longTermConsequences),
        ethicalPrinciples: JSON.stringify(dilemmaData.ethicalPrinciples),
        hiddenMeaning: dilemmaData.hiddenMeaning,

        category: dilemmaData.category,
        complexity: complexity || 7,
        emotionalIntensity: emotionalIntensity || 7,

        sceneData,

        authorId,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true, // Auto-approve AI-generated dilemmas
      }
    })

    console.log('✅ Dilemma created successfully:', dilemma.id)

    return successResponse({
      dilemmaId: dilemma.id,
      title: dilemma.title,
      status: 'ready',
      message: 'Dilemma created successfully'
    }, 201)

  } catch (error: any) {
    console.error('❌ Error creating dilemma:', error)
    return errorResponse(error.message || 'Failed to create dilemma')
  }
}

// Helper function to generate title from prompt
function generateDilemmaTitle(description: string): string {
  const words = description.split(' ').slice(0, 5).join(' ')
  return words.length > 30 ? words.substring(0, 27) + '...' : words
}
