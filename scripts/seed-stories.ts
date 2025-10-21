/**
 * Seed predefined stories with 3-5 dilemmas each
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding stories...')

  // Find or create a system user
  let systemUser = await prisma.user.findUnique({
    where: { email: 'system@tarotaros.com' }
  })

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system@tarotaros.com',
        username: 'Tarotaros',
        role: 'ADMIN'
      }
    })
  }

  // Story 1: AI Ethics Journey (4 dilemmas)
  console.log('📖 Creating Story 1: AI 윤리의 딜레마...')

  const story1Dilemmas = await Promise.all([
    prisma.dilemma.create({
      data: {
        title: '자율주행차의 선택',
        description: '자율주행차가 피할 수 없는 사고 상황에 직면했습니다.',
        optionA: '보행자 5명을 피해 탑승자 1명을 희생',
        optionB: '탑승자를 보호하고 보행자 5명 희생',
        situation: '자율주행차의 브레이크가 고장났습니다. 앞에는 횡단보도를 건너는 5명의 보행자가 있고, 차선을 바꾸면 차 안의 탑승자가 위험합니다.',
        category: 'ai_ethics',
        complexity: 7,
        emotionalIntensity: 8,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id,
        imageUrl: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-X9GrcFiLe9Z0gZwIeN4EZOIQ/user-U1YbaZfipmQPNbeObHmNPEBH/img-placeholder-ai-car.jpg',
        sceneData: JSON.stringify({
          skyColor: '#1a1a2e',
          groundColor: '#2a2a3e',
          fogColor: '#1a1a2e',
          fogDensity: 0.015,
          ambientLightIntensity: 0.3,
          ambientLightColor: '#ffffff',
          objects: [],
          lights: [
            { type: 'point', position: [0, 8, -10], color: '#ffeedd', intensity: 0.8 }
          ]
        })
      }
    }),
    prisma.dilemma.create({
      data: {
        title: 'AI 면접관의 판단',
        description: 'AI가 당신의 면접을 평가합니다. 하지만 AI의 판단 기준이 공정한지 의문이 듭니다.',
        optionA: 'AI 평가를 받아들인다',
        optionB: '인간 면접관을 요청한다',
        situation: '당신은 꿈의 직장 면접을 봤습니다. 하지만 면접관은 AI였고, 알고리즘의 편향성이 의심됩니다.',
        category: 'ai_ethics',
        complexity: 6,
        emotionalIntensity: 6,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    }),
    prisma.dilemma.create({
      data: {
        title: '개인정보 vs 공공안전',
        description: 'AI가 범죄를 예방하기 위해 개인정보를 수집합니다.',
        optionA: '개인정보 제공에 동의 (범죄율 50% 감소)',
        optionB: '개인정보 보호 (범죄율 유지)',
        situation: '정부는 AI 치안 시스템을 도입하려 합니다. 이 시스템은 범죄를 예방하지만 모든 시민의 위치와 행동을 추적합니다.',
        category: 'ai_ethics',
        complexity: 8,
        emotionalIntensity: 7,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    }),
    prisma.dilemma.create({
      data: {
        title: 'AI 창작물의 저작권',
        description: 'AI가 만든 예술작품의 소유권은 누구에게 있을까요?',
        optionA: 'AI 개발자에게 저작권',
        optionB: '공공 재산으로 개방',
        situation: 'AI가 만든 그림이 경매에서 10억 원에 낙찰되었습니다. 누가 이 돈을 받아야 할까요?',
        category: 'ai_ethics',
        complexity: 7,
        emotionalIntensity: 5,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    })
  ])

  const story1 = await prisma.story.create({
    data: {
      title: 'AI 윤리의 딜레마',
      description: '인공지능 시대, 우리는 어떤 선택을 해야 할까요? AI와 함께 살아가는 미래에 대한 4가지 도덕적 질문.',
      theme: 'AI Ethics',
      genre: 'Sci-Fi',
      difficulty: 7,
      isPublished: true,
      authorId: systemUser.id,
      nodes: {
        create: [
          { dilemmaId: story1Dilemmas[0].id, nodeOrder: 1, isStart: true, isEnd: false },
          { dilemmaId: story1Dilemmas[1].id, nodeOrder: 2, isStart: false, isEnd: false },
          { dilemmaId: story1Dilemmas[2].id, nodeOrder: 3, isStart: false, isEnd: false },
          { dilemmaId: story1Dilemmas[3].id, nodeOrder: 4, isStart: false, isEnd: true }
        ]
      }
    },
    include: { nodes: true }
  })

  // Create linear paths (A→B→C→D)
  const story1Nodes = story1.nodes.sort((a, b) => a.nodeOrder - b.nodeOrder)
  for (let i = 0; i < story1Nodes.length - 1; i++) {
    await prisma.storyPath.createMany({
      data: [
        {
          fromNodeId: story1Nodes[i].id,
          toNodeId: story1Nodes[i + 1].id,
          choice: 'A'
        },
        {
          fromNodeId: story1Nodes[i].id,
          toNodeId: story1Nodes[i + 1].id,
          choice: 'B'
        }
      ]
    })
  }

  console.log(`✅ Story 1 created: ${story1.title} (${story1Dilemmas.length} dilemmas)`)

  // Story 2: Medical Ethics (5 dilemmas)
  console.log('📖 Creating Story 2: 의료 현장의 선택...')

  const story2Dilemmas = await Promise.all([
    prisma.dilemma.create({
      data: {
        title: '한정된 치료제',
        description: '치명적인 전염병이 퍼졌습니다. 치료제는 단 10개뿐입니다.',
        optionA: '추첨으로 무작위 선정',
        optionB: '생존 가능성이 높은 사람 우선',
        situation: '병원에 50명의 환자가 있지만 치료제는 10개뿐입니다. 어떻게 배분할까요?',
        category: 'medical',
        complexity: 9,
        emotionalIntensity: 10,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    }),
    prisma.dilemma.create({
      data: {
        title: '실험적 치료법',
        description: '검증되지 않은 치료법이 마지막 희망입니다.',
        optionA: '실험적 치료 시도',
        optionB: '완화 치료만 제공',
        situation: '말기 환자가 실험적 치료를 원합니다. 성공률 5%, 부작용으로 즉사 가능성 30%.',
        category: 'medical',
        complexity: 8,
        emotionalIntensity: 9,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    }),
    prisma.dilemma.create({
      data: {
        title: '장기 기증 우선순위',
        description: '심장 이식을 기다리는 두 환자. 한 명만 살릴 수 있습니다.',
        optionA: '10세 어린이에게 기증',
        optionB: '40세 3자녀 부모에게 기증',
        situation: '적합한 심장이 하나 나왔습니다. 두 환자 모두 급박한 상황입니다.',
        category: 'medical',
        complexity: 10,
        emotionalIntensity: 10,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    }),
    prisma.dilemma.create({
      data: {
        title: '환자의 알 권리',
        description: '환자에게 나쁜 소식을 전해야 할 때',
        optionA: '사실대로 알린다',
        optionB: '희망적으로 완곡하게 표현',
        situation: '환자는 말기 암입니다. 6개월 시한부. 가족은 알리지 말라고 부탁합니다.',
        category: 'medical',
        complexity: 7,
        emotionalIntensity: 8,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    }),
    prisma.dilemma.create({
      data: {
        title: '안락사의 권리',
        description: '극심한 고통 속의 환자가 안락사를 원합니다.',
        optionA: '환자의 선택을 존중',
        optionB: '생명 유지 노력 계속',
        situation: '회복 불가능한 환자가 명료한 정신으로 안락사를 요청합니다.',
        category: 'medical',
        complexity: 10,
        emotionalIntensity: 10,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    })
  ])

  const story2 = await prisma.story.create({
    data: {
      title: '의료 현장의 선택',
      description: '생명을 다루는 의료 현장에서 마주하는 극한의 도덕적 딜레마. 5가지 상황에서 당신의 선택은?',
      theme: 'Medical Ethics',
      genre: 'Drama',
      difficulty: 9,
      isPublished: true,
      authorId: systemUser.id,
      nodes: {
        create: [
          { dilemmaId: story2Dilemmas[0].id, nodeOrder: 1, isStart: true, isEnd: false },
          { dilemmaId: story2Dilemmas[1].id, nodeOrder: 2, isStart: false, isEnd: false },
          { dilemmaId: story2Dilemmas[2].id, nodeOrder: 3, isStart: false, isEnd: false },
          { dilemmaId: story2Dilemmas[3].id, nodeOrder: 4, isStart: false, isEnd: false },
          { dilemmaId: story2Dilemmas[4].id, nodeOrder: 5, isStart: false, isEnd: true }
        ]
      }
    },
    include: { nodes: true }
  })

  const story2Nodes = story2.nodes.sort((a, b) => a.nodeOrder - b.nodeOrder)
  for (let i = 0; i < story2Nodes.length - 1; i++) {
    await prisma.storyPath.createMany({
      data: [
        {
          fromNodeId: story2Nodes[i].id,
          toNodeId: story2Nodes[i + 1].id,
          choice: 'A'
        },
        {
          fromNodeId: story2Nodes[i].id,
          toNodeId: story2Nodes[i + 1].id,
          choice: 'B'
        }
      ]
    })
  }

  console.log(`✅ Story 2 created: ${story2.title} (${story2Dilemmas.length} dilemmas)`)

  // Story 3: Climate Crisis (3 dilemmas)
  console.log('📖 Creating Story 3: 기후 위기의 선택...')

  const story3Dilemmas = await Promise.all([
    prisma.dilemma.create({
      data: {
        title: '댐 건설 vs 생태계',
        description: '가뭄 해결을 위한 댐 건설이 생태계를 파괴합니다.',
        optionA: '댐 건설 (1만 명 식수 해결)',
        optionB: '댐 건설 포기 (멸종위기종 서식지 보호)',
        situation: '극심한 가뭄으로 도시에 물 부족 사태가 발생했습니다.',
        category: 'resource_allocation',
        complexity: 8,
        emotionalIntensity: 7,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    }),
    prisma.dilemma.create({
      data: {
        title: '탄소세 도입',
        description: '탄소 배출에 세금을 부과하면 물가가 오릅니다.',
        optionA: '탄소세 도입 (환경 보호, 물가 15% 상승)',
        optionB: '탄소세 반대 (현상 유지)',
        situation: '기후 위기 대응을 위해 정부가 탄소세를 검토 중입니다.',
        category: 'resource_allocation',
        complexity: 7,
        emotionalIntensity: 6,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    }),
    prisma.dilemma.create({
      data: {
        title: '섬나라의 운명',
        description: '해수면 상승으로 가라앉는 섬나라. 난민을 받아들일까요?',
        optionA: '난민 수용 (자국 실업률 증가 예상)',
        optionB: '난민 거부 (섬나라 주민 수만 명 위험)',
        situation: '태평양의 섬나라가 해수면 상승으로 수몰 위기입니다.',
        category: 'resource_allocation',
        complexity: 9,
        emotionalIntensity: 9,
        visibility: 'PUBLIC',
        isActive: true,
        isApproved: true,
        authorId: systemUser.id
      }
    })
  ])

  const story3 = await prisma.story.create({
    data: {
      title: '기후 위기의 선택',
      description: '지구 온난화와 기후 변화 앞에서 우리가 내려야 할 결정들. 3가지 환경 딜레마.',
      theme: 'Climate Crisis',
      genre: 'Contemporary',
      difficulty: 8,
      isPublished: true,
      authorId: systemUser.id,
      nodes: {
        create: [
          { dilemmaId: story3Dilemmas[0].id, nodeOrder: 1, isStart: true, isEnd: false },
          { dilemmaId: story3Dilemmas[1].id, nodeOrder: 2, isStart: false, isEnd: false },
          { dilemmaId: story3Dilemmas[2].id, nodeOrder: 3, isStart: false, isEnd: true }
        ]
      }
    },
    include: { nodes: true }
  })

  const story3Nodes = story3.nodes.sort((a, b) => a.nodeOrder - b.nodeOrder)
  for (let i = 0; i < story3Nodes.length - 1; i++) {
    await prisma.storyPath.createMany({
      data: [
        {
          fromNodeId: story3Nodes[i].id,
          toNodeId: story3Nodes[i + 1].id,
          choice: 'A'
        },
        {
          fromNodeId: story3Nodes[i].id,
          toNodeId: story3Nodes[i + 1].id,
          choice: 'B'
        }
      ]
    })
  }

  console.log(`✅ Story 3 created: ${story3.title} (${story3Dilemmas.length} dilemmas)`)

  console.log('✅ All stories seeded successfully!')
  console.log(`
📚 Created Stories:
1. ${story1.title} - ${story1Dilemmas.length} dilemmas (Difficulty: ${story1.difficulty}/10)
2. ${story2.title} - ${story2Dilemmas.length} dilemmas (Difficulty: ${story2.difficulty}/10)
3. ${story3.title} - ${story3Dilemmas.length} dilemmas (Difficulty: ${story3.difficulty}/10)
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding stories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
