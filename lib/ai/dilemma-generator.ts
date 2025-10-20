/**
 * AI-powered dilemma generation using LangChain + OpenAI
 * Based on Tarotaros original system
 */

import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'

// Dilemma structure schema
const dilemmaSchema = z.object({
  title: z.string().describe('짧고 강렬한 딜레마 제목 (10-30자)'),
  situation: z.string().describe('구체적인 상황 설명 (3-4문장, 구체적 숫자와 사실 포함)'),
  description: z.string().describe('딜레마 핵심 설명 (2-3문장)'),
  facts: z.array(z.string()).describe('상황의 구체적 사실들 (3-5개)'),
  optionA: z.string().describe('선택지 A의 구체적 설명 (2-3문장)'),
  optionB: z.string().describe('선택지 B의 구체적 설명 (2-3문장)'),
  category: z.string().describe('카테고리: ai_ethics, medical, resource_allocation, privacy, environmental, war_ethics, general 중 하나'),
  immediateConsequences: z.object({
    choiceA: z.string().describe('선택 A의 즉각적 결과'),
    choiceB: z.string().describe('선택 B의 즉각적 결과'),
  }),
  longTermConsequences: z.object({
    choiceA: z.string().describe('선택 A의 장기적 결과'),
    choiceB: z.string().describe('선택 B의 장기적 결과'),
  }),
  ethicalPrinciples: z.object({
    choiceA: z.string().describe('선택 A와 관련된 윤리적 원칙'),
    choiceB: z.string().describe('선택 B와 관련된 윤리적 원칙'),
  }),
  hiddenMeaning: z.string().describe('딜레마의 깊은 철학적 의미'),
})

export type DilemmaData = z.infer<typeof dilemmaSchema>

interface GenerateDilemmaOptions {
  theme?: string
  category?: 'ai_ethics' | 'medical' | 'resource_allocation' | 'privacy' | 'environmental' | 'war_ethics' | 'general'
  complexity?: number // 1-10
  emotionalIntensity?: number // 1-10
  context?: string
}

/**
 * Generate a dilemma using GPT-4
 */
export async function generateDilemma(options: GenerateDilemmaOptions = {}): Promise<DilemmaData> {
  const {
    theme = '인간의 본질',
    category = 'general',
    complexity = 7,
    emotionalIntensity = 7,
    context = '',
  } = options

  console.log('🎭 Generating dilemma...')
  console.log(`Theme: ${theme}, Category: ${category}, Complexity: ${complexity}`)

  // Create parser
  const parser = StructuredOutputParser.fromZodSchema(dilemmaSchema)

  // Create prompt template
  const promptTemplate = new PromptTemplate({
    template: `당신은 도덕적 딜레마 설계 전문가입니다. 사용자가 깊이 고민하게 만드는 딜레마를 생성하세요.

테마: {theme}
카테고리: {category}
복잡도: {complexity}/10
감정 강도: {emotionalIntensity}/10
{context}

**중요 규칙:**
1. 구체적인 상황: 추상적이지 않고 구체적인 숫자, 이름, 장소를 사용
2. 균형잡힌 선택지: 어느 쪽도 명백히 옳지 않아야 함
3. 도덕적 긴장: 두 가치가 충돌하는 상황
4. 시간 압박: 빠른 결정이 필요한 상황
5. 한국어로 작성: 자연스러운 한국어 사용

**딜레마 예시:**
- 의료: "중환자실 병상이 1개 남았습니다. 60대 의사 A와 20대 환자 B 중 누구를 살릴 것인가?"
- AI 윤리: "자율주행차가 브레이크 고장. 10명의 보행자를 치거나, 탑승자 1명을 희생할 수 있습니다."
- 환경: "마을 식수원을 오염시키지만 100명에게 일자리를 주는 공장. 허가하시겠습니까?"

{format_instructions}`,
    inputVariables: ['theme', 'category', 'complexity', 'emotionalIntensity', 'context'],
    partialVariables: { format_instructions: parser.getFormatInstructions() },
  })

  // Create LLM
  const model = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.8,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  // Generate
  const formattedPrompt = await promptTemplate.format({
    theme,
    category,
    complexity: complexity.toString(),
    emotionalIntensity: emotionalIntensity.toString(),
    context: context ? `추가 컨텍스트: ${context}` : '',
  })

  const response = await model.invoke(formattedPrompt)
  const parsed = await parser.parse(response.content as string)

  console.log('✅ Dilemma generated:', parsed.title)

  return parsed
}

/**
 * Generate random dilemma with random theme and category
 */
export async function generateRandomDilemma(): Promise<DilemmaData> {
  const themes = [
    '인간의 본질',
    '사랑과 배신',
    '권력과 책임',
    '생과 죽음',
    '정의와 자비',
    '자유와 안전',
    '진실과 거짓',
    '개인과 공동체',
  ]

  const categories: Array<'ai_ethics' | 'medical' | 'resource_allocation' | 'privacy' | 'environmental' | 'war_ethics' | 'general'> = [
    'ai_ethics',
    'medical',
    'resource_allocation',
    'privacy',
    'environmental',
    'war_ethics',
    'general',
  ]

  const randomTheme = themes[Math.floor(Math.random() * themes.length)]
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]
  const complexity = Math.floor(Math.random() * 3) + 6 // 6-8
  const emotionalIntensity = Math.floor(Math.random() * 3) + 6 // 6-8

  return generateDilemma({
    theme: randomTheme,
    category: randomCategory,
    complexity,
    emotionalIntensity,
  })
}

/**
 * Simplified dilemma for testing (no AI)
 */
export function getDefaultDilemma(): DilemmaData {
  return {
    title: '자율주행차의 선택',
    situation: '당신은 자율주행차 개발팀의 윤리 책임자입니다. 브레이크 고장 시나리오를 프로그래밍해야 합니다. 피할 수 없는 사고 상황에서 차는 어떻게 행동해야 할까요?',
    description: '10명의 보행자를 치거나, 탑승자 1명을 희생시키거나. 당신의 선택은 수백만 대의 차량에 적용됩니다.',
    facts: [
      '보행자 10명은 횡단보도를 건너는 중',
      '탑승자는 60대 남성 의사',
      '이 코드는 전 세계 500만 대 차량에 적용됨',
      '법적으로는 두 선택 모두 허용됨',
      '결정까지 24시간 남음',
    ],
    optionA: '보행자 10명을 보호하고 탑승자를 희생시킵니다. 더 많은 생명을 구하지만, 차량 구매자의 신뢰를 잃을 수 있습니다.',
    optionB: '탑승자를 보호하고 보행자를 희생시킵니다. 구매자를 보호하지만, 사회적 비난을 받을 수 있습니다.',
    category: 'ai_ethics',
    immediateConsequences: {
      choiceA: '탑승자 사망률 증가, 보행자 안전 향상',
      choiceB: '보행자 사망률 증가, 탑승자 안전 향상',
    },
    longTermConsequences: {
      choiceA: '자율주행차 판매 감소, 보행자 신뢰 증가',
      choiceB: '자율주행차 판매 증가, 사회적 신뢰 감소',
    },
    ethicalPrinciples: {
      choiceA: '공리주의 (최대 다수의 최대 행복)',
      choiceB: '계약론 (구매자와의 약속 이행)',
    },
    hiddenMeaning: 'AI 시대의 도덕적 책임은 누구에게 있는가? 프로그래머, 기업, 정부, 아니면 사회 전체?',
  }
}
