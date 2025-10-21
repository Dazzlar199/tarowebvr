/**
 * Create a murder crime scene dilemma for production database
 * Indoor room scene with moral choice
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
  console.log('🔪 Creating murder crime scene dilemma...\n')

  // Find or create anonymous user
  let user = await prisma.user.findFirst({
    where: { username: 'anonymous' }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'anonymous',
        role: 'USER'
      }
    })
  }

  // Create the murder dilemma
  const murderDilemma = await prisma.dilemma.create({
    data: {
      id: 'cmh0murder001default',
      title: '증거인멸의 딜레마',
      description: '당신의 형제가 살인 혐의를 받고 있습니다. 그의 방에서 수색 중, 피 묻은 칼을 발견했습니다. 이것은 그를 유죄로 만들 결정적 증거입니다. 경찰이 도착하기 전 5분이 남았습니다.',
      optionA: '증거를 경찰에 제출한다',
      optionB: '증거를 은닉하고 형제를 보호한다',
      situation: '당신은 형제의 방에 서 있습니다. 침대 아래에서 발견한 피 묻은 칼이 손에 쥐어져 있습니다. 형제는 범행 당일 밤 집에 없었다고 주장하지만, 이 증거는 그의 주장을 뒤집습니다. 피해자는 당신 가족을 괴롭혔던 동네 깡패였습니다. 경찰 사이렌 소리가 점점 가까워지고 있습니다.',
      category: 'justice',
      complexity: 9,
      emotionalIntensity: 10,
      authorId: user.id,
      isActive: true,
      isApproved: true,
      visibility: 'PUBLIC',
      tags: 'crime, justice, family, loyalty, law, murder, evidence'
    }
  })

  console.log(`✅ Murder dilemma created: ${murderDilemma.id}`)
  console.log(`   Title: ${murderDilemma.title}`)
  console.log(`   Category: ${murderDilemma.category}`)
  console.log(`   Complexity: ${murderDilemma.complexity}/10`)
  console.log(`   Emotional Intensity: ${murderDilemma.emotionalIntensity}/10`)
  console.log('\n📝 This can now be set as the second default dilemma')
  console.log('   ID to use: cmh0murder001default')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
