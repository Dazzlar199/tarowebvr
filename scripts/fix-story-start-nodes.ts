/**
 * Fix stories by setting startNodeId to the first node with isStart=true
 * or the first node by nodeOrder
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  console.log('🔧 Fixing story start nodes...\n')

  // Get all stories
  const stories = await prisma.story.findMany({
    include: {
      nodes: {
        orderBy: { nodeOrder: 'asc' }
      }
    }
  })

  console.log(`Found ${stories.length} stories\n`)

  for (const story of stories) {
    console.log(`📖 Story: ${story.title} (${story.id})`)

    if (story.nodes.length === 0) {
      console.log(`   ⚠️  No nodes found - skipping\n`)
      continue
    }

    // Find start node (marked with isStart=true or first by order)
    let startNode = story.nodes.find(n => n.isStart)

    if (!startNode) {
      // Use first node by order
      startNode = story.nodes[0]
      console.log(`   ℹ️  No isStart node found, using first node: ${startNode.id}`)

      // Update node to mark it as start
      await prisma.storyNode.update({
        where: { id: startNode.id },
        data: { isStart: true }
      })
    } else {
      console.log(`   ✓ Found start node: ${startNode.id}`)
    }

    // Update story with startNodeId
    await prisma.story.update({
      where: { id: story.id },
      data: { startNodeId: startNode.id }
    })

    console.log(`   ✅ Updated story.startNodeId to ${startNode.id}\n`)
  }

  console.log('✨ All stories updated!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
