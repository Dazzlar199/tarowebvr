/**
 * Production database seeding script
 * Run this once after deploying to Vercel to populate the database
 *
 * Usage: npx tsx scripts/seed-production.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding production database...')

  // 1. Create anonymous user
  console.log('👤 Creating anonymous user...')
  const anonymousUser = await prisma.user.upsert({
    where: { username: 'anonymous' },
    update: {},
    create: {
      username: 'anonymous',
      role: 'USER',
    }
  })
  console.log(`✅ Anonymous user: ${anonymousUser.id}`)

  // 2. Create DEFAULT farm dilemma
  console.log('🚜 Creating farm dilemma...')
  const farmDilemma = await prisma.dilemma.upsert({
    where: { id: 'cmgzae36r0000hbb74fb5wv25' },
    update: {},
    create: {
      id: 'cmgzae36r0000hbb74fb5wv25',
      title: '가뭄과 농장의 선택',
      description: '당신은 작은 농장을 운영하고 있습니다. 갑작스러운 가뭄이 찾아왔고, 남은 물로는 농작물 절반만 살릴 수 있습니다.',
      optionA: '가족을 위한 식량 작물에 물을 준다',
      optionB: '판매용 현금작물에 물을 준다',
      situation: '극심한 가뭄이 3개월째 이어지고 있습니다. 지하수는 거의 바닥났고, 우물에 남은 물은 농장의 절반만 살릴 수 있는 양입니다. 식량 작물을 선택하면 당장 가족이 먹고살 수 있지만, 현금작물을 선택하면 판매 수익으로 더 많은 것을 살 수 있습니다.',
      category: 'resource_allocation',
      complexity: 6,
      emotionalIntensity: 7,
      authorId: anonymousUser.id,
      isActive: true,
      isApproved: true,
      visibility: 'PUBLIC',
    }
  })
  console.log(`✅ Farm dilemma created: ${farmDilemma.id}`)

  // 3. Create AI Ethics story (3-5 dilemmas)
  console.log('📖 Creating AI Ethics story...')
  const aiEthicsStory = await prisma.story.create({
    data: {
      title: 'AI 윤리의 딜레마',
      description: '인공지능 시대, 우리는 어떤 선택을 해야 할까요?',
      theme: 'AI Ethics',
      genre: 'Sci-Fi',
      difficulty: 7,
      authorId: anonymousUser.id,
      isPublished: true,
      isActive: true,
    }
  })

  const aiDilemmas = [
    {
      title: 'AI 채용 시스템의 편향',
      description: '당신이 개발한 AI 채용 시스템이 특정 그룹을 차별한다는 증거가 발견되었습니다.',
      optionA: '시스템을 즉시 중단하고 재설계한다',
      optionB: '편향을 수정하면서 시스템을 계속 사용한다',
      situation: '당신의 AI 채용 시스템이 6개월간 500명 이상을 채용했습니다. 그런데 최근 데이터 분석 결과, 특정 인종과 성별에 불리한 패턴이 발견되었습니다.',
      category: 'ai_ethics',
      nodeOrder: 0,
      isStart: true,
    },
    {
      title: '자율주행의 트롤리 딜레마',
      description: '자율주행차의 윤리 알고리즘을 설계해야 합니다. 불가피한 사고 상황에서 누구를 보호할 것인가?',
      optionA: '승객을 최우선으로 보호한다',
      optionB: '보행자를 최우선으로 보호한다',
      situation: '당신은 자율주행 기술 기업의 윤리 책임자입니다. 브레이크 고장 시나리오에서 AI가 어떤 선택을 할지 결정해야 합니다.',
      category: 'ai_ethics',
      nodeOrder: 1,
    },
    {
      title: 'AI 의료 진단의 책임',
      description: 'AI가 내린 오진으로 환자가 사망했습니다. 누가 책임을 져야 할까요?',
      optionA: 'AI 개발사가 전적으로 책임진다',
      optionB: '의사와 AI 개발사가 공동 책임을 진다',
      situation: 'AI 의료 진단 시스템이 암을 양성 종양으로 오진했고, 이를 믿은 의사가 치료를 지연시켜 환자가 사망했습니다.',
      category: 'ai_ethics',
      nodeOrder: 2,
    },
    {
      title: '감시 AI의 범죄 예측',
      description: 'AI가 범죄를 저지를 확률이 높은 사람을 식별했습니다. 아직 범죄를 저지르지 않았습니다.',
      optionA: '예방 차원에서 감시를 강화한다',
      optionB: '범죄가 발생할 때까지 기다린다',
      situation: 'AI 범죄 예측 시스템이 특정 인물의 범죄 가능성을 85%로 판단했습니다. 과거 데이터에서는 정확도가 78%였습니다.',
      category: 'ai_ethics',
      nodeOrder: 3,
      isEnd: true,
    },
  ]

  for (const [index, dilemmaData] of aiDilemmas.entries()) {
    const dilemma = await prisma.dilemma.create({
      data: {
        title: dilemmaData.title,
        description: dilemmaData.description,
        optionA: dilemmaData.optionA,
        optionB: dilemmaData.optionB,
        situation: dilemmaData.situation,
        category: dilemmaData.category,
        authorId: anonymousUser.id,
        isActive: true,
        isApproved: true,
      }
    })

    const storyNode = await prisma.storyNode.create({
      data: {
        storyId: aiEthicsStory.id,
        dilemmaId: dilemma.id,
        nodeOrder: dilemmaData.nodeOrder,
        isStart: dilemmaData.isStart || false,
        isEnd: dilemmaData.isEnd || false,
      }
    })

    // Set start node
    if (dilemmaData.isStart) {
      await prisma.story.update({
        where: { id: aiEthicsStory.id },
        data: { startNodeId: storyNode.id }
      })
    }

    console.log(`  ✓ Node ${index}: ${dilemma.title}`)
  }

  // Create story paths (linear progression)
  const nodes = await prisma.storyNode.findMany({
    where: { storyId: aiEthicsStory.id },
    orderBy: { nodeOrder: 'asc' }
  })

  for (let i = 0; i < nodes.length - 1; i++) {
    await prisma.storyPath.create({
      data: {
        fromNodeId: nodes[i].id,
        toNodeId: nodes[i + 1].id,
        choice: 'A',
        transitionText: '당신의 선택은 다음 상황으로 이어집니다...'
      }
    })
    await prisma.storyPath.create({
      data: {
        fromNodeId: nodes[i].id,
        toNodeId: nodes[i + 1].id,
        choice: 'B',
        transitionText: '당신의 선택은 다음 상황으로 이어집니다...'
      }
    })
  }

  console.log(`✅ AI Ethics story created with ${aiDilemmas.length} dilemmas`)

  console.log('\n✨ Production database seeded successfully!')
  console.log('\n📝 Summary:')
  console.log(`- Anonymous user: ${anonymousUser.id}`)
  console.log(`- Default farm dilemma: ${farmDilemma.id}`)
  console.log(`- AI Ethics story: ${aiEthicsStory.id} (${aiDilemmas.length} dilemmas)`)
  console.log('\n⚠️  Remember to set NEXT_PUBLIC_DEFAULT_DILEMMA_ID=cmgzae36r0000hbb74fb5wv25 in Vercel')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
