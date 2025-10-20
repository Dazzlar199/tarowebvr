import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixImages() {
  console.log('🔧 Fixing expired image URLs...')

  // Unsplash placeholder images for each world
  const worlds = await prisma.world.findMany()

  for (const world of worlds) {
    let imageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1792&h=1024&fit=crop'
    let thumbnailUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop'

    // Use different images based on title
    if (world.title.includes('도서관') || world.title.includes('library')) {
      imageUrl = 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1792&h=1024&fit=crop'
      thumbnailUrl = 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1024&h=1024&fit=crop'
    } else if (world.title.includes('호수') || world.title.includes('lake') || world.title.includes('숲')) {
      imageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1792&h=1024&fit=crop'
      thumbnailUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop'
    } else if (world.title.includes('수정') || world.title.includes('crystal') || world.title.includes('우주')) {
      imageUrl = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1792&h=1024&fit=crop'
      thumbnailUrl = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1024&h=1024&fit=crop'
    }

    await prisma.world.update({
      where: { id: world.id },
      data: {
        imageUrl,
        thumbnailUrl,
      }
    })

    console.log(`✅ Updated: ${world.title}`)
  }

  console.log('🎉 All images updated!')
}

fixImages()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
