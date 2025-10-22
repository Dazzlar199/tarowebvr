/**
 * Fix AI 윤리의 딜레마 Node 1 image - replace external URL with base64
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
  console.log('🖼️ Fixing AI 윤리의 딜레마 Node 1 image...\n')

  // Find the AI ethics story
  const story = await prisma.story.findFirst({
    where: { title: 'AI 윤리의 딜레마' },
    include: {
      nodes: {
        include: { dilemma: true },
        orderBy: { nodeOrder: 'asc' }
      }
    }
  })

  if (!story) {
    console.log('❌ Story not found')
    return
  }

  console.log(`📖 Story found: ${story.title}`)

  const node1 = story.nodes[0]
  const node2 = story.nodes[1]

  if (!node1 || !node2) {
    console.log('❌ Nodes not found')
    return
  }

  console.log(`📄 Node 1: ${node1.dilemma.title}`)
  console.log(`   Current image: ${node1.dilemma.imageUrl?.substring(0, 60)}...`)
  console.log(`\n📄 Node 2: ${node2.dilemma.title}`)
  console.log(`   Current image: ${node2.dilemma.imageUrl?.substring(0, 60)}...`)

  if (!node2.dilemma.imageUrl) {
    console.log('❌ Node 2 has no image to copy')
    return
  }

  // Copy Node 2's base64 image to Node 1
  console.log('\n📋 Copying Node 2 image to Node 1...')

  await prisma.dilemma.update({
    where: { id: node1.dilemma.id },
    data: { imageUrl: node2.dilemma.imageUrl }
  })

  console.log(`✅ Updated Node 1 dilemma ${node1.dilemma.id} with base64 image`)
  console.log('\n✨ Done!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
