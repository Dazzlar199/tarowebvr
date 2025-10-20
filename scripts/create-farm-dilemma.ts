import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createFarmDilemma() {
  try {
    // 농장 3D 씬 데이터 (OBJ 모델 사용)
    const farmScene = {
      skyColor: '#87CEEB',
      groundColor: '#8B7355',
      fogColor: '#e0e0e0',
      fogDensity: 0.01,
      ambientLightIntensity: 0.8,
      ambientLightColor: '#ffffff',
      objects: [
        // 큰 헛간 (왼쪽 멀리)
        {
          type: 'building',
          modelPath: '/models/farm/Big Barn/BigBarn.obj',
          position: [-15, 0, -12],
          scale: [1, 1, 1],
          rotation: [0, Math.PI / 3, 0],
          color: '#8B4513'
        },
        // 작은 헛간 (오른쪽 멀리)
        {
          type: 'building',
          modelPath: '/models/farm/Small Barn/SmallBarn.obj',
          position: [15, 0, -11],
          scale: [0.8, 0.8, 0.8],
          rotation: [0, -Math.PI / 4, 0],
          color: '#A0522D'
        },
        // 닭장 (왼쪽 중간)
        {
          type: 'building',
          modelPath: '/models/farm/ChickenCoop/ChickenCoop.obj',
          position: [-12, 0, -8],
          scale: [0.7, 0.7, 0.7],
          rotation: [0, 0.5, 0],
          color: '#CD853F'
        },
        // 사일로 (중앙 뒤쪽)
        {
          type: 'building',
          modelPath: '/models/farm/Silo/Silo.obj',
          position: [0, 0, -15],
          scale: [0.8, 0.8, 0.8],
          rotation: [0, 0, 0],
          color: '#C0C0C0'
        },
        // 풍차 (오른쪽 멀리)
        {
          type: 'building',
          modelPath: '/models/farm/Tower Windmill/TowerWindmill.obj',
          position: [18, 0, -14],
          scale: [0.7, 0.7, 0.7],
          rotation: [0, 0, 0],
          color: '#F5DEB3'
        },
        // 울타리 (왼쪽 앞)
        {
          type: 'fence',
          modelPath: '/models/farm/Fence/Fence2.obj',
          position: [-8, 0, -6],
          scale: [0.6, 0.6, 0.6],
          rotation: [0, 0, 0],
          color: '#8B7355'
        },
        // 울타리 (오른쪽 앞)
        {
          type: 'fence',
          modelPath: '/models/farm/Fence/Fence2.obj',
          position: [12, 0, -7],
          scale: [0.6, 0.6, 0.6],
          rotation: [0, Math.PI / 2, 0],
          color: '#8B7355'
        }
      ],
      lights: [
        {
          type: 'directional',
          position: [10, 20, 10],
          color: '#ffffff',
          intensity: 1.2
        },
        {
          type: 'point',
          position: [-10, 5, -8],
          color: '#FFA500',
          intensity: 0.8
        },
        {
          type: 'point',
          position: [10, 5, -8],
          color: '#FFA500',
          intensity: 0.8
        }
      ]
    }

    // 농장 딜레마 생성
    const dilemma = await prisma.dilemma.create({
      data: {
        title: '가뭄과 농장의 선택',
        description: '극심한 가뭄으로 물이 부족합니다. 한정된 물로 무엇을 살릴 것인가?',
        situation: '당신은 3대째 이어온 농장을 운영하고 있습니다. 100년 만의 최악의 가뭄이 찾아왔고, 우물에 남은 물은 단 한 곳만 살릴 수 있는 양입니다. 왼쪽에는 50마리의 닭이 있는 닭장이 있고, 오른쪽에는 마을 전체가 먹을 곡식이 자라는 밭이 있습니다.',
        optionA: '닭을 살린다 - 50마리의 생명을 구하고, 계란으로 당분간 생계를 유지할 수 있습니다.',
        optionB: '곡식을 살린다 - 마을 사람들이 겨울을 날 수 있는 식량을 확보합니다.',
        category: 'agriculture',
        tags: '농장,가뭄,윤리,생존,공동체',
        complexity: 7,
        emotionalIntensity: 8,
        facts: JSON.stringify({
          chickens: '50마리의 닭은 하루에 40개의 계란을 생산합니다',
          crops: '이 밭의 곡식은 200명의 마을 사람들이 3개월간 먹을 수 있는 양입니다',
          drought: '가뭄은 앞으로 2개월 더 지속될 것으로 예상됩니다',
          economy: '닭 한 마리 가격은 30,000원, 곡식 전체 가치는 5,000,000원입니다'
        }),
        immediateConsequences: JSON.stringify({
          choiceA: '닭을 선택하였습니다. 50마리의 닭은 살았지만, 곡식밭은 모두 말라 죽었습니다. 당장 계란을 팔아 생계를 유지할 수 있지만, 마을에 나눠줄 곡식이 없어졌습니다.',
          choiceB: '곡식을 선택하였습니다. 곡식밭은 살았지만, 50마리의 닭은 모두 탈수로 죽었습니다. 마을 사람들은 안심했지만, 당신은 주 수입원을 잃었습니다.'
        }),
        longTermConsequences: JSON.stringify({
          choiceA: '계란 판매로 생계를 유지하며 새로운 곡식 종자를 구입했습니다. 하지만 마을 사람들은 당신을 이기적이라고 비난하며 농장에서 사는 것을 거부합니다.',
          choiceB: '마을 사람들이 감사하며 농장 재건을 도와줍니다. 하지만 닭 없이는 안정적인 수입이 없어 빚이 늘어갑니다. 결국 농장을 팔아야 할 처지에 놓입니다.'
        }),
        ethicalPrinciples: JSON.stringify({
          animalWelfare: '동물의 생명도 소중하며, 인간의 식량을 위해 희생되어야 하는가?',
          utilitarian: '최대 다수의 최대 행복 - 200명의 식량 vs 50마리의 생명',
          sustainability: '장기적 생존을 위한 선택 - 계란 생산력 vs 곡식 비축',
          community: '개인의 생계 vs 공동체의 생존'
        }),
        hiddenMeaning: '이 딜레마는 단순히 동물 vs 식량의 문제가 아닙니다. 개인의 생존과 공동체의 책임, 단기적 이익과 장기적 지속가능성 사이의 균형을 다룹니다. 어떤 선택을 하든, 당신은 무언가를 잃게 됩니다. 중요한 것은 그 선택의 무게를 인식하고, 책임지는 것입니다.',
        sceneData: JSON.stringify(farmScene)
      }
    })

    console.log('✅ 농장 딜레마가 생성되었습니다!')
    console.log('📍 딜레마 ID:', dilemma.id)
    console.log('🌾 제목:', dilemma.title)
    console.log('🔗 URL: http://localhost:3000/explore/' + dilemma.id)

    return dilemma
  } catch (error) {
    console.error('❌ 에러 발생:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createFarmDilemma()
