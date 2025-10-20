import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generate360Image, generateThumbnail } from '@/lib/ai/image-generator'
import { generateSceneFromPrompt } from '@/lib/ai/scene-generator'
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api-response'
import { CONSTANTS } from '@/lib/constants'

export const runtime = 'nodejs' // Use Node.js runtime for OpenAI
export const maxDuration = 60 // Allow up to 60 seconds for image generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, title, userId } = body

    // Validation
    if (!prompt || typeof prompt !== 'string') {
      return badRequestResponse('Prompt is required')
    }

    if (prompt.length > CONSTANTS.MAX_PROMPT_LENGTH) {
      return badRequestResponse(`Prompt must be less than ${CONSTANTS.MAX_PROMPT_LENGTH} characters`)
    }

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

    // Generate world title if not provided
    const worldTitle = title || generateWorldTitle(prompt)

    console.log('🎨 Starting world generation...')
    console.log('📝 Prompt:', prompt)

    // Generate images synchronously (in MVP, do it immediately)
    let imageUrl: string | null = null
    let thumbnailUrl: string | null = null

    // Generate 3D scene data
    let sceneData: string | null = null
    try {
      console.log('🏗️ Generating 3D scene...')
      const scene = await generateSceneFromPrompt(prompt)
      sceneData = JSON.stringify(scene)
      console.log('✅ 3D scene generated')
    } catch (sceneError: any) {
      console.error('❌ 3D scene generation failed:', sceneError)
      sceneData = null
    }

    try {
      console.log('🎨 Generating 360° panorama image...')
      imageUrl = await generate360Image(prompt)

      if (!imageUrl) {
        throw new Error('Failed to generate 360° image')
      }

      console.log('✅ Panorama generated:', imageUrl)

      console.log('🖼️ Generating thumbnail...')
      thumbnailUrl = await generateThumbnail(prompt)
      console.log('✅ Thumbnail generated:', thumbnailUrl)

    } catch (imageError: any) {
      console.error('❌ Image generation failed:', imageError)

      // For demo purposes, use a placeholder image
      imageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1792&h=1024&fit=crop'
      thumbnailUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop'

      console.log('⚠️ Using placeholder images due to generation error')
    }

    // Create world record with generated images and 3D scene
    const world = await prisma.world.create({
      data: {
        title: worldTitle,
        prompt,
        description: prompt.substring(0, 200),
        authorId,
        visibility: 'PUBLIC',
        imageUrl,
        thumbnailUrl,
        sceneData,
      }
    })

    console.log('✅ World created successfully:', world.id)

    return successResponse({
      worldId: world.id,
      title: world.title,
      status: 'ready',
      imageUrl: world.imageUrl,
      message: 'World created successfully'
    }, 201)

  } catch (error: any) {
    console.error('❌ Error creating world:', error)
    return errorResponse(error.message || 'Failed to create world')
  }
}

// Generate a creative title from prompt
function generateWorldTitle(prompt: string): string {
  // Simple title generation - in production, use GPT for better titles
  const words = prompt.split(' ').slice(0, 5).join(' ')
  return words.length > 50 ? words.substring(0, 50) + '...' : words
}
