/**
 * Add Gemini images to all story dilemmas
 */

import { PrismaClient } from '@prisma/client'
import { generateDilemmaImage } from '../lib/gemini'

const prisma = new PrismaClient()

async function main() {
  console.log('🖼️ Adding images to story dilemmas...')

  // Get all stories
  const stories = await prisma.story.findMany({
    where: { isPublished: true },
    include: {
      nodes: {
        include: {
          dilemma: true
        },
        orderBy: { nodeOrder: 'asc' }
      }
    }
  })

  for (const story of stories) {
    console.log(`\n📖 Processing story: ${story.title}`)

    for (const node of story.nodes) {
      const dilemma = node.dilemma

      // Skip if already has image
      if (dilemma.imageUrl) {
        console.log(`  ✓ ${dilemma.title} - already has image`)
        continue
      }

      try {
        console.log(`  🍌 Generating image for: ${dilemma.title}`)

        const imageUrl = await generateDilemmaImage({
          title: dilemma.title,
          description: dilemma.description,
          optionA: dilemma.optionA,
          optionB: dilemma.optionB,
          category: dilemma.category
        })

        await prisma.dilemma.update({
          where: { id: dilemma.id },
          data: { imageUrl }
        })

        console.log(`  ✅ Image added: ${dilemma.title}`)

        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error(`  ❌ Failed to generate image for ${dilemma.title}:`, error)
      }
    }
  }

  console.log('\n✅ All images added!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
