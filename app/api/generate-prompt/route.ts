import { NextRequest, NextResponse } from 'next/server'
import { getRandomTheme } from '@/lib/langchain-dilemma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// 랜덤 프롬프트 생성 API (GPT로 매번 새로운 딜레마 생성)
export async function GET(request: NextRequest) {
  try {
    // GPT-4를 사용해 완전히 새로운 딜레마 프롬프트 생성
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 창의적인 도덕적 딜레마 시나리오 작가입니다.

매번 완전히 새롭고 독창적인 도덕적 딜레마 상황을 한국어로 생성하세요.

**딜레마 카테고리 (랜덤 선택)**:
- 의료/생명윤리: 장기기증, 안락사, 실험, 치료 우선순위
- 기술/AI 윤리: 자율주행, AI 의사결정, 개인정보, 감시
- 환경/자원: 기후변화, 자원 분배, 동물권, 환경보호 vs 경제
- 전쟁/정치: 전시 도덕, 테러리즘, 정의 vs 안보
- 경제/사회: 부의 재분배, 노동권, 차별, 정의
- 가족/개인: 충성심, 정직성, 우정 vs 의무
- 법/정의: 처벌 vs 재활, 사형제도, 법 준수 vs 도덕
- 우주/미래: 우주 식민지, 인류 멸종, 타임트래블, 외계 생명

**형식**:
- 2-3문장으로 구체적인 상황 설명
- 명확한 두 가지 선택지 (암묵적으로 포함)
- 수치를 사용해 현실감 있게 (예: "10명", "50%", "100억원")
- 감정적으로 몰입되는 디테일 추가

**예시 스타일** (이 예시를 그대로 사용하지 말고, 이런 스타일로 완전히 새로운 딜레마 생성):
- "우주선이 고장났습니다. 산소가 24시간 남았고, 승무원 10명 중 절반만 살릴 수 있습니다."
- "당신의 자녀가 범죄를 저질렀습니다. 신고하면 20년 형을 받고, 숨기면 무고한 사람이 누명을 씁니다."

**중요**:
- 기존 유명한 딜레마(트롤리, 하인즈)와 다른 완전히 새로운 상황 창작
- 매번 다른 카테고리, 다른 숫자, 다른 상황
- 한국어로 자연스럽고 몰입감 있게 작성`
        },
        {
          role: 'user',
          content: '완전히 새롭고 독창적인 도덕적 딜레마 상황을 2-3문장으로 생성해주세요. 프롬프트 내용만 출력하고, 다른 설명은 하지 마세요.'
        }
      ],
      temperature: 1.0, // 높은 창의성을 위해 temperature 최대
      max_tokens: 200,
    })

    const generatedPrompt = response.choices[0].message.content?.trim() || ''
    const randomTheme = getRandomTheme()

    if (!generatedPrompt) {
      throw new Error('Failed to generate prompt from GPT')
    }

    console.log('✅ Generated new unique dilemma prompt:', generatedPrompt)

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt,
      theme: randomTheme,
    })
  } catch (error: any) {
    console.error('Error generating prompt:', error)

    // Fallback: 저장된 프롬프트 사용 (GPT 실패시)
    const fallbackPrompts = [
      '자율주행차가 브레이크 고장났습니다. 보행자 10명을 치거나 탑승자 1명을 희생시켜야 합니다.',
      '중환자실 병상이 1개 남았습니다. 60대 의사 A와 20대 환자 B 중 한 명만 살릴 수 있습니다.',
      '마을에 식수를 오염시키지만 100명에게 일자리를 주는 공장 건설 허가를 심사 중입니다.',
      'AI가 범죄를 예측했습니다. 아직 범죄를 저지르지 않은 사람을 체포해야 할까요?',
      '회사 기밀을 폭로하면 1000명의 목숨을 구하지만, 당신과 가족이 위험해집니다.',
    ]

    const fallbackPrompt = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)]
    const randomTheme = getRandomTheme()

    return NextResponse.json({
      success: true,
      prompt: fallbackPrompt,
      theme: randomTheme,
    })
  }
}
