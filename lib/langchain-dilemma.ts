import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'
import { RunnableSequence } from '@langchain/core/runnables'

// 딜레마 구조 정의 - 3D 시나리오 포함
const dilemmaSchema = z.object({
  title: z.string().describe('딜레마의 제목'),
  situation: z.string().describe('구체적인 상황 설정'),
  description: z.string().describe('상황의 세부사항과 제약조건'),
  facts: z.array(z.string()).describe('명확한 사실과 숫자'),
  optionA: z.string().describe('선택지 A와 그 결과'),
  optionB: z.string().describe('선택지 B와 그 결과'),
  category: z.string().describe('카테고리'),
  immediateConsequences: z.object({
    choiceA: z.string().describe('선택 A의 즉각적 결과'),
    choiceB: z.string().describe('선택 B의 즉각적 결과'),
  }),
  longTermConsequences: z.object({
    choiceA: z.string().describe('선택 A의 장기적 결과'),
    choiceB: z.string().describe('선택 B의 장기적 결과'),
  }),
  ethicalPrinciples: z.object({
    choiceA: z.string().describe('선택 A가 기반한 윤리 원칙'),
    choiceB: z.string().describe('선택 B가 기반한 윤리 원칙'),
  }),
  hiddenMeaning: z.string().describe('숨겨진 의미와 상징'),
})

export type Dilemma = z.infer<typeof dilemmaSchema>

const DEFAULT_MODEL = 'gpt-4o-mini'

// LangChain 모델 설정
const model = new ChatOpenAI({
  modelName: DEFAULT_MODEL,
  temperature: 0.8,
  openAIApiKey: process.env.OPENAI_API_KEY,
})

// 구조화된 출력 파서
const parser = StructuredOutputParser.fromZodSchema(dilemmaSchema)

// 프롬프트 템플릿 - 3D VR 시나리오에 최적화
const dilemmaPromptTemplate = PromptTemplate.fromTemplate(`
당신은 철학적 사고 실험을 설계하는 전문가입니다.
트롤리 문제처럼 구체적이고 명확한 상황의 딜레마를 생성하세요.

테마: {theme}
복잡도: {complexity}
감정적 강도: {emotionalIntensity}
맥락: {context}

생성 규칙:
1. **구체적인 시나리오**: 시간, 장소, 인물, 숫자가 명확해야 합니다
2. **측정 가능한 결과**: 각 선택의 결과를 정량적으로 제시하세요
3. **제한된 정보**: 주어진 정보만으로 결정해야 하는 상황
4. **시간 압박**: 즉시 결정해야 하는 이유를 포함하세요
5. **도덕적 갈등**: 공리주의 vs 의무론적 윤리 등 철학적 대립
6. **현실성**: 실제로 일어날 수 있는 상황이어야 합니다
7. **개인적 연관**: 결정자와 관련된 요소를 포함하세요
8. **3D 시각화 가능**: 물리적 공간과 객체로 표현할 수 있는 상황

**CRITICAL: optionA와 optionB는 반드시 2-3개 문장으로 작성하세요.**

각 옵션은 다음을 포함해야 합니다:
- 첫 번째 문장: 선택하는 행동과 즉각적 결과 (구체적 숫자 포함)
- 두 번째 문장: 추가적인 결과나 도덕적 딜레마
- 세 번째 문장 (선택적): 장기적 결과나 감정적 무게

예시 형식:
- situation: "자율주행차가 고장났고, 브레이크 없이 시속 80km로 달리고 있다"
- facts: ["속도: 시속 80km", "거리: 50m", "횡단보도에 5명", "옆 차선에 1명"]
- optionA: "핸들을 급격히 틀어 옆 차선의 1명을 향한다 - 1명이 즉시 사망하지만 5명은 구한다. 당신의 직접적인 행동으로 한 사람을 죽이는 것이다. 평생 그 사람의 얼굴을 잊지 못할 것이다."
- optionB: "그대로 직진한다 - 횡단보도의 5명이 사망한다. 하지만 당신은 직접적으로 누구도 죽이지 않았다. 당신이 행동했다면 5명을 구할 수 있었다는 사실을 평생 안고 살아야 한다."

{format_instructions}

특별 지시:
- 숫자와 구체적 사실을 반드시 포함하세요
- 각 선택이 가져올 결과를 명확히 제시하세요
- 추상적 표현보다 구체적 상황을 사용하세요
- optionA와 optionB는 ABSOLUTELY 2-3개 문장으로 작성하세요
- 3D 공간에서 시각화할 수 있는 장면을 포함하세요 (도로, 건물, 사람 등)
`)

// 딜레마 생성 함수
export async function generateAdvancedDilemma(params: {
  theme?: string
  complexity?: 'simple' | 'moderate' | 'complex' | 'paradoxical'
  emotionalIntensity?: 'low' | 'medium' | 'high' | 'extreme'
  context?: string
}) {
  const {
    theme = '도덕적 결정',
    complexity = 'complex',
    emotionalIntensity = 'high',
    context = '현대 사회'
  } = params

  const chain = RunnableSequence.from([
    dilemmaPromptTemplate,
    model,
    parser,
  ])

  const result = await chain.invoke({
    theme,
    complexity,
    emotionalIntensity,
    context,
    format_instructions: parser.getFormatInstructions(),
  })

  return result as Dilemma
}

// 시나리오 기반 딜레마 생성
export async function generateScenarioDilemma(scenario: {
  type: 'medical' | 'ai_ethics' | 'resource_allocation' | 'privacy' | 'environmental' | 'war_ethics' | 'autonomous_vehicle' | 'social'
  urgency: 'immediate' | 'hours' | 'days'
  stakes: 'life_death' | 'economic' | 'social' | 'environmental'
}) {
  const scenarioPrompt = PromptTemplate.fromTemplate(`
다음 시나리오 타입의 딜레마를 생성하세요:

시나리오 타입: {type}
긴급도: {urgency}
이해관계: {stakes}

시나리오별 특별 지시:
- medical: 환자 수, 생존율, 치료 자원 등 구체적 의료 데이터 포함
- ai_ethics: 영향받는 사용자 수, 정확도, 편향성 수치 등 포함
- resource_allocation: 자원량, 필요 인원, 효율성 지표 등 포함
- privacy: 데이터 규모, 영향받는 인원, 보안 수준 등 포함
- environmental: CO2 배출량, 영향받는 생태계 규모 등 포함
- war_ethics: 민간인 수, 군사 목표 가치, 부수 피해 등 포함
- autonomous_vehicle: 차량 속도, 승객/보행자 수, 충돌 가능성 등 포함
- social: 영향받는 사람 수, 사회적 비용, 장단기 효과 등 포함

반드시 포함:
1. 구체적인 숫자와 통계
2. 제한된 시간 (정확한 시간 명시)
3. 명확한 trade-off
4. 검증 가능한 결과
5. 3D 공간에서 시각화 가능한 장면 (도로, 병원, 건물 등)

**CRITICAL: optionA와 optionB는 반드시 2-3개 문장으로 작성하세요.**
- 첫 번째 문장: 선택하는 행동과 즉각적 결과 (구체적 숫자 포함)
- 두 번째 문장: 추가적인 결과나 도덕적 딜레마
- 세 번째 문장: 장기적 결과나 감정적 무게

{format_instructions}
`)

  const chain = RunnableSequence.from([
    scenarioPrompt,
    model,
    parser,
  ])

  const result = await chain.invoke({
    type: scenario.type,
    urgency: scenario.urgency,
    stakes: scenario.stakes,
    format_instructions: parser.getFormatInstructions(),
  })

  return result as Dilemma
}

// 랜덤 테마 생성기
export function getRandomTheme(): string {
  const themes = [
    '자율주행차 사고',
    '의료 자원 배분',
    '인공지능 윤리',
    '환경 보호 vs 경제',
    '개인정보 vs 공공안전',
    '전쟁과 민간인',
    '조직의 충성심',
    '가족과 정의',
    '생명 구조',
    '재난 상황 대응',
  ]
  return themes[Math.floor(Math.random() * themes.length)]
}

// 랜덤 시나리오 타입 생성기
export function getRandomScenarioType(): {
  type: 'medical' | 'ai_ethics' | 'resource_allocation' | 'privacy' | 'environmental' | 'war_ethics' | 'autonomous_vehicle' | 'social'
  urgency: 'immediate' | 'hours' | 'days'
  stakes: 'life_death' | 'economic' | 'social' | 'environmental'
} {
  const types = ['medical', 'ai_ethics', 'resource_allocation', 'privacy', 'environmental', 'war_ethics', 'autonomous_vehicle', 'social'] as const
  const urgencies = ['immediate', 'hours', 'days'] as const
  const stakes = ['life_death', 'economic', 'social', 'environmental'] as const

  return {
    type: types[Math.floor(Math.random() * types.length)],
    urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
    stakes: stakes[Math.floor(Math.random() * stakes.length)],
  }
}
