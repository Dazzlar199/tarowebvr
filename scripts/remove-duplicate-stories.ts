/**
 * Remove duplicate stories from production database
 * Keep only the latest version of each story
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
  console.log('🗑️  Removing duplicate stories...\n')

  // Stories to delete (older duplicates)
  const storiesToDelete = [
    // AI 윤리의 딜레마 - delete 2 older versions
    'cmh0dy6nd0002akcn0i0316cy',  // 2nd oldest
    'cmh0bt60s000a5rcshdmhtkut',   // oldest

    // 의료 현장의 선택 - delete 1 older version
    'cmh0btasv000x5rcsdmpk4c7s',   // oldest

    // 기후 위기의 선택 - delete 1 older version
    'cmh0btew4001j5rcsm17an6cq',   // oldest
  ]

  for (const storyId of storiesToDelete) {
    console.log(`Deleting story: ${storyId}`)

    // Delete the story (cascades to nodes and paths)
    await prisma.story.delete({
      where: { id: storyId }
    })

    console.log(`✅ Deleted story ${storyId}`)
  }

  console.log(`\n✅ Removed ${storiesToDelete.length} duplicate stories`)

  // Check remaining stories
  const remainingStories = await prisma.story.findMany({
    where: {
      isPublished: true
    },
    include: {
      nodes: true
    }
  })

  console.log(`\n📚 Remaining stories: ${remainingStories.length}`)
  for (const story of remainingStories) {
    console.log(`   - ${story.title} (${story.nodes.length} dilemmas)`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
