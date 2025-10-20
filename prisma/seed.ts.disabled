import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@tarotaros.com' },
    update: {},
    create: {
      email: 'demo@tarotaros.com',
      username: 'demo',
      role: 'USER',
    },
  })

  console.log('✅ Demo user created:', demoUser.username)

  // Create sample worlds
  const world1 = await prisma.world.create({
    data: {
      title: '폐허가 된 도서관',
      description: '빛나는 구슬이 떠오르는 신비로운 폐허 도서관',
      prompt: '폐허가 된 도서관 안에서 빛나는 구슬이 떠오른다',
      authorId: demoUser.id,
      visibility: 'PUBLIC',
      tags: 'fantasy,mystical,library',
      viewCount: 42,
      likeCount: 15,
    },
  })

  const world2 = await prisma.world.create({
    data: {
      title: '안개 낀 숲속 호수',
      description: '신비로운 문이 서있는 호수가',
      prompt: '안개 낀 숲속 호수가에 신비로운 문이 서있다',
      authorId: demoUser.id,
      visibility: 'PUBLIC',
      tags: 'nature,portal,mystical',
      viewCount: 28,
      likeCount: 9,
    },
  })

  const world3 = await prisma.world.create({
    data: {
      title: '수정 신전',
      description: '우주 공간에 떠있는 수정으로 된 신전',
      prompt: '우주 공간에 떠있는 수정으로 된 신전',
      authorId: demoUser.id,
      visibility: 'PUBLIC',
      tags: 'space,crystal,architecture',
      viewCount: 56,
      likeCount: 23,
    },
  })

  console.log('✅ Sample worlds created:', [world1.title, world2.title, world3.title])

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
