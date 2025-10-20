import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateStoryArc, getDefaultStory, validateStoryArc } from '@/lib/ai/story-generator'
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api-response'
import { generateDilemmaImage } from '@/lib/gemini'

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      theme,
      genre,
      numberOfNodes = 5,
      context,
      userId,
      useAI = true,
    } = body

    console.log('📚 Starting story generation...')

    // Get or create anonymous user
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

    // Generate or get default story arc
    let storyArc
    if (!useAI) {
      console.log('Using default story arc')
      storyArc = getDefaultStory()
    } else {
      console.log('Generating AI story arc...')
      storyArc = await generateStoryArc({
        theme,
        genre,
        numberOfNodes,
        context,
      })
    }

    // Validate story arc
    const validation = validateStoryArc(storyArc)
    if (!validation.valid) {
      console.error('❌ Story arc validation failed:', validation.errors)
      return badRequestResponse(`Invalid story arc: ${validation.errors.join(', ')}`)
    }

    console.log(`✅ Story arc generated: ${storyArc.nodes.length} nodes`)

    // Create story in database
    const story = await prisma.story.create({
      data: {
        title: storyArc.title,
        description: storyArc.description,
        theme: storyArc.theme,
        genre: storyArc.genre,
        difficulty: storyArc.difficulty,
        authorId,
        isPublished: true,
        isActive: true,
      }
    })

    console.log(`📖 Story created: ${story.id}`)

    // Create dilemmas and story nodes
    const nodeMap = new Map<number, string>() // nodeOrder -> storyNodeId

    for (const node of storyArc.nodes) {
      // Generate Nano Banana image for this dilemma
      let imageUrl: string | null = null
      try {
        console.log(`  🍌 Generating Nano Banana image for node ${node.nodeOrder}...`)
        imageUrl = await generateDilemmaImage({
          title: node.dilemmaTitle,
          description: node.dilemmaDescription,
          optionA: node.optionA,
          optionB: node.optionB,
          category: storyArc.genre || 'story',
        })
        console.log(`  ✅ Image generated for node ${node.nodeOrder}`)
      } catch (imageError) {
        console.error(`  ⚠️ Failed to generate image for node ${node.nodeOrder}:`, imageError)
        // Continue without image
      }

      // Create the dilemma for this node
      const dilemma = await prisma.dilemma.create({
        data: {
          title: node.dilemmaTitle,
          description: node.dilemmaDescription,
          optionA: node.optionA,
          optionB: node.optionB,
          situation: node.situation,
          imageUrl: imageUrl, // Add Nano Banana image
          category: storyArc.genre,
          authorId,
          isActive: true,
          isApproved: true,
        }
      })

      // Create the story node
      const storyNode = await prisma.storyNode.create({
        data: {
          storyId: story.id,
          dilemmaId: dilemma.id,
          nodeOrder: node.nodeOrder,
          isStart: node.isStart,
          isEnd: node.isEnd,
          contextBefore: node.contextBefore,
          contextAfter: node.contextAfter,
        }
      })

      nodeMap.set(node.nodeOrder, storyNode.id)

      // Set start node in story
      if (node.isStart) {
        await prisma.story.update({
          where: { id: story.id },
          data: { startNodeId: storyNode.id }
        })
      }

      console.log(`  ✓ Node ${node.nodeOrder}: ${dilemma.title}`)
    }

    // Create story paths (connections between nodes)
    for (const node of storyArc.nodes) {
      const fromNodeId = nodeMap.get(node.nodeOrder)!

      // Path A
      if (node.pathA.toNodeOrder !== null) {
        const toNodeId = nodeMap.get(node.pathA.toNodeOrder)!
        await prisma.storyPath.create({
          data: {
            fromNodeId,
            toNodeId,
            choice: 'A',
            transitionText: node.pathA.transitionText,
          }
        })
      }

      // Path B
      if (node.pathB.toNodeOrder !== null) {
        const toNodeId = nodeMap.get(node.pathB.toNodeOrder)!
        await prisma.storyPath.create({
          data: {
            fromNodeId,
            toNodeId,
            choice: 'B',
            transitionText: node.pathB.transitionText,
          }
        })
      }
    }

    console.log(`✅ Story paths created`)

    // Fetch complete story with nodes
    const completeStory = await prisma.story.findUnique({
      where: { id: story.id },
      include: {
        nodes: {
          include: {
            dilemma: true,
            pathsFrom: true,
          },
          orderBy: { nodeOrder: 'asc' },
        },
      },
    })

    console.log(`✅ Story generation complete: ${story.id}`)

    return successResponse({
      story: completeStory,
      storyId: story.id,
      startNodeId: story.startNodeId,
      message: 'Story created successfully'
    }, 201)

  } catch (error: any) {
    console.error('❌ Error creating story:', error)
    return errorResponse(error.message || 'Failed to create story')
  }
}

// Get all stories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get('genre')
    const isPublished = searchParams.get('published') === 'true'

    const stories = await prisma.story.findMany({
      where: {
        ...(genre && { genre }),
        ...(isPublished !== undefined && { isPublished }),
        isActive: true,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        },
        nodes: {
          select: {
            id: true,
            nodeOrder: true,
            isStart: true,
            isEnd: true,
            dilemma: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
              }
            }
          },
          orderBy: { nodeOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({
      stories,
      count: stories.length,
    })

  } catch (error: any) {
    console.error('❌ Error fetching stories:', error)
    return errorResponse(error.message || 'Failed to fetch stories')
  }
}
