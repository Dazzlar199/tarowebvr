import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api-response'

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'

/**
 * Get current node for user's story progress
 * Or start a new story if no progress exists
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'anonymous'

    // Get user
    let user = await prisma.user.findFirst({
      where: { username: userId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: { username: userId, role: 'USER' }
      })
    }

    // Get story
    const story = await prisma.story.findUnique({
      where: { id: storyId },
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

    if (!story) {
      return errorResponse('Story not found', 404)
    }

    if (!story.startNodeId) {
      return errorResponse('Story has no start node', 400)
    }

    // Get or create user progress
    let progress = await prisma.userStoryProgress.findUnique({
      where: {
        userId_storyId: {
          userId: user.id,
          storyId: story.id,
        }
      },
    })

    let currentNode

    if (!progress) {
      // Start new story
      progress = await prisma.userStoryProgress.create({
        data: {
          userId: user.id,
          storyId: story.id,
          currentNodeId: story.startNodeId,
          choicesMade: JSON.stringify([]),
          isCompleted: false,
        },
      })

      currentNode = story.nodes.find(n => n.id === story.startNodeId)
    } else {
      // Continue existing story
      if (progress.isCompleted) {
        return successResponse({
          story,
          progress,
          currentNode: null,
          isCompleted: true,
          message: 'Story already completed',
        })
      }

      currentNode = story.nodes.find(n => n.id === progress.currentNodeId)
    }

    if (!currentNode) {
      return errorResponse('Current node not found', 404)
    }

    return successResponse({
      story: {
        id: story.id,
        title: story.title,
        description: story.description,
        theme: story.theme,
        genre: story.genre,
      },
      progress,
      currentNode: {
        ...currentNode,
        pathsFrom: currentNode.pathsFrom,
      },
      isCompleted: false,
    })

  } catch (error: any) {
    console.error('Error getting story progress:', error)
    return errorResponse(error.message || 'Failed to get story progress')
  }
}

/**
 * Make a choice and progress to next node
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: storyId } = params
    const body = await request.json()
    const { userId = 'anonymous', nodeId, choice } = body

    if (!choice || (choice !== 'A' && choice !== 'B')) {
      return badRequestResponse('Choice must be "A" or "B"')
    }

    // Get user
    let user = await prisma.user.findFirst({
      where: { username: userId }
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Get progress
    const progress = await prisma.userStoryProgress.findUnique({
      where: {
        userId_storyId: {
          userId: user.id,
          storyId,
        }
      },
    })

    if (!progress) {
      return errorResponse('No story progress found. Start the story first.', 404)
    }

    if (progress.isCompleted) {
      return errorResponse('Story already completed', 400)
    }

    // Get current node
    const currentNode = await prisma.storyNode.findUnique({
      where: { id: nodeId },
      include: {
        pathsFrom: true,
      },
    })

    if (!currentNode) {
      return errorResponse('Node not found', 404)
    }

    // Find the path for this choice
    const path = currentNode.pathsFrom.find(p => p.choice === choice)

    if (!path) {
      // This is an end node
      if (!currentNode.isEnd) {
        return errorResponse('Invalid choice: no path found and not an end node', 400)
      }

      // Complete the story
      const choicesMade = JSON.parse(progress.choicesMade)
      choicesMade.push({
        nodeId,
        choice,
        timestamp: new Date().toISOString(),
      })

      await prisma.userStoryProgress.update({
        where: { id: progress.id },
        data: {
          choicesMade: JSON.stringify(choicesMade),
          isCompleted: true,
          currentNodeId: null,
        },
      })

      return successResponse({
        isCompleted: true,
        finalNode: currentNode,
        message: 'Story completed!',
      })
    }

    // Save choice to user's choice history (for analysis)
    await prisma.choice.upsert({
      where: {
        dilemmaId_userId: {
          dilemmaId: currentNode.dilemmaId,
          userId: user.id,
        }
      },
      update: {
        choice,
      },
      create: {
        dilemmaId: currentNode.dilemmaId,
        userId: user.id,
        choice,
        vrSession: false,
      },
    })

    // Move to next node
    const choicesMade = JSON.parse(progress.choicesMade)
    choicesMade.push({
      nodeId,
      choice,
      timestamp: new Date().toISOString(),
    })

    const nextNode = await prisma.storyNode.findUnique({
      where: { id: path.toNodeId },
      include: {
        dilemma: true,
        pathsFrom: true,
      },
    })

    if (!nextNode) {
      return errorResponse('Next node not found', 404)
    }

    // Check if next node is an end node
    const isCompleted = nextNode.isEnd && nextNode.pathsFrom.length === 0

    await prisma.userStoryProgress.update({
      where: { id: progress.id },
      data: {
        currentNodeId: nextNode.id,
        choicesMade: JSON.stringify(choicesMade),
        isCompleted,
      },
    })

    return successResponse({
      transitionText: path.transitionText,
      nextNode,
      isCompleted,
      message: 'Choice recorded successfully',
    })

  } catch (error: any) {
    console.error('Error making choice:', error)
    return errorResponse(error.message || 'Failed to make choice')
  }
}
