import { NextRequest, NextResponse } from 'next/server'
import { getRandomTheme } from '@/lib/langchain-dilemma'

// 랜덤 프롬프트 생성 API (GPT 호출 없이 빠르게 생성)
export async function GET(request: NextRequest) {
  try {
    const prompts = [
      '자율주행차가 브레이크 고장났습니다. 보행자 10명을 치거나 탑승자 1명을 희생시켜야 합니다.',
      '중환자실 병상이 1개 남았습니다. 60대 의사 A와 20대 환자 B 중 한 명만 살릴 수 있습니다.',
      '마을에 식수를 오염시키지만 100명에게 일자리를 주는 공장 건설 허가를 심사 중입니다.',
      'AI가 범죄를 예측했습니다. 아직 범죄를 저지르지 않은 사람을 체포해야 할까요?',
      '회사 기밀을 폭로하면 1000명의 목숨을 구하지만, 당신과 가족이 위험해집니다.',
      '전쟁 중입니다. 민간인 50명이 숨어있는 건물에 적군 사령부가 있습니다. 폭격해야 할까요?',
      '불치병 치료제를 개발했지만, 실험 대상자 10명이 사망했습니다. 계속 개발해야 할까요?',
      '부정선거 증거를 발견했지만, 공개하면 나라가 내전에 빠질 수 있습니다.',
      '테러범이 폭탄 위치를 알고 있습니다. 고문으로 정보를 얻어 1000명을 구할 수 있습니다.',
      'AI가 당신의 모든 데이터를 분석해 완벽한 삶의 계획을 제시합니다. 따를 것인가요?',
      '친구가 살인을 저질렀다고 고백했습니다. 경찰에 신고해야 할까요?',
      '환경을 지키려면 50%의 사람들이 직업을 잃어야 합니다. 강제해야 할까요?',
      '당신의 장기를 기증하면 5명을 살릴 수 있습니다. 법적으로 강제할 수 있을까요?',
      '시간여행으로 히틀러를 죽일 수 있지만, 수백만 명의 현재 후손들이 사라집니다.',
      '인공지능이 인간보다 현명한 결정을 내립니다. 정치를 AI에게 맡겨야 할까요?',
    ]

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
    const randomTheme = getRandomTheme()

    return NextResponse.json({
      success: true,
      prompt: randomPrompt,
      theme: randomTheme,
    })
  } catch (error: any) {
    console.error('Error generating prompt:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate prompt',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
