"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'ko' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  ko: {
    // Homepage
    'home.title': 'TAROTAROS',
    'home.ip.subtitle': 'A GOD DOES NOT BLINK Interactive Experience',
    'home.subtitle': 'Immersive choice experience',
    'home.tagline': 'Make your choice',
    'home.mode.default': 'CURATED',
    'home.mode.default.desc': '엄선된 프리미엄',
    'home.mode.ai': 'AI POWERED',
    'home.mode.ai.desc': '커스텀 시나리오',
    'home.mode.story': 'STORY MODE',
    'home.mode.story.desc': '내러티브 아크',
    'home.prompt.label': '시나리오 프롬프트 (선택사항)',
    'home.prompt.placeholder': '예: 자율주행차가 브레이크 고장으로 승객을 구할지 보행자를 구할지 선택해야 합니다...',
    'home.prompt.help': '비워두면 랜덤 AI 생성 시나리오',
    'home.button.enter': 'ENTER',
    'home.button.loading': 'LOADING...',
    'home.ai.prompt.label': '시나리오 프롬프트',
    'home.ai.prompt.placeholder': '예: 자율주행차가 브레이크 고장났습니다. 보행자 10명을 치거나 탑승자 1명을 희생시켜야 합니다...',
    'home.ai.prompt.help': '비워두면 완전 랜덤으로 생성됩니다',
    'home.ai.button.random': '랜덤 시나리오',
    'home.ai.button.randomGenerating': '생성 중...',
    'home.ai.button.enter': '딜레마 생성 및 입장',
    'home.ai.button.generating': '딜레마 생성 중...',
    'home.story.button': '스토리 보기',
    'home.default.murder': '밀실 딜레마',
    'home.halloffame.subtitle': '커뮤니티가 선택한 최고의 딜레마',
    'home.halloffame.views': '조회',
    'home.halloffame.choices': '선택',
    'home.feature.ai.title': 'AI GENERATED',
    'home.feature.ai.desc': '무한한 시나리오',
    'home.feature.xr.title': 'IMMERSIVE XR',
    'home.feature.xr.desc': '선택을 걸어서 경험하세요',
    'home.feature.analysis.title': 'DEEP ANALYSIS',
    'home.feature.analysis.desc': '자신을 알아가세요',

    // Stories
    'stories.title': 'STORIES',
    'stories.subtitle': '인터랙티브 분기형 내러티브',
    'stories.button.create': 'CREATE NEW',
    'stories.create.title': 'CREATE NEW STORY',
    'stories.create.mode.default': 'DEFAULT',
    'stories.create.mode.default.desc': '빠른 시작',
    'stories.create.mode.ai': 'AI POWERED',
    'stories.create.mode.ai.desc': '커스텀 스토리',
    'stories.create.theme.label': '스토리 테마 (선택사항)',
    'stories.create.theme.placeholder': '예: 사이버펑크 도시에서 범죄를 해결하는 탐정...',
    'stories.create.theme.help': '비워두면 랜덤 AI 생성 스토리',
    'stories.create.button.cancel': 'CANCEL',
    'stories.create.button.create': 'CREATE',
    'stories.create.button.creating': 'CREATING...',
    'stories.empty.title': '아직 스토리가 없습니다',
    'stories.empty.button': 'CREATE FIRST STORY',
    'stories.card.by': 'by',
    'stories.card.nodes': 'nodes',
    'stories.card.play': 'PLAY →',
    'stories.back': '← BACK TO HOME',

    // Story Player
    'story.back': '← BACK TO STORIES',
    'story.completed.title': 'STORY COMPLETED',
    'story.completed.subtitle': '이 내러티브의 끝에 도달했습니다',
    'story.completed.button.stories': 'BROWSE STORIES',
    'story.completed.button.home': 'RETURN HOME',
    'story.path.a': 'PATH A',
    'story.path.b': 'PATH B',
    'story.processing': 'PROCESSING CHOICE...',

    // Dilemma
    'dilemma.loading': '딜레마를 준비하는 중...',
    'dilemma.error': 'ERROR',
    'dilemma.error.notfound': 'Resource not found',
    'dilemma.error.button': 'RETURN',

    // Multiplayer
    'multiplayer.title': 'MULTIPLAYER',
    'multiplayer.subtitle': 'Experience dilemmas together',
    'multiplayer.button': 'MULTIPLAYER MODE',

    // Archive
    'archive.title': 'ARCHIVE',
    'archive.subtitle': '모든 딜레마 탐색',
    'archive.filter.all': '전체',
    'archive.filter.ai': 'AI 생성',
    'archive.filter.default': '기본',
    'archive.empty': '아직 딜레마가 없습니다',
    'archive.empty.button': '새 딜레마 만들기',
    'archive.card.explore': '탐색',

    // Profile
    'profile.title': 'PROFILE',
    'profile.subtitle': '당신의 선택 여정',
    'profile.empty': '아직 선택한 딜레마가 없습니다',
    'profile.empty.button': '첫 딜레마 시작하기',
    'profile.stats.total': '총 선택',
    'profile.stats.categories': '카테고리',
    'profile.stats.analysis': '성격 분석',
    'profile.categories.title': '카테고리 분포',
    'profile.recent.title': '최근 선택',
    'profile.analysis.title': '성격 분석 결과',

    // Common
    'common.loading': 'LOADING...',
    'common.error': 'ERROR',
  },
  en: {
    // Homepage
    'home.title': 'TAROTAROS',
    'home.ip.subtitle': 'A GOD DOES NOT BLINK Interactive Experience',
    'home.subtitle': 'Immersive choice experience',
    'home.tagline': 'Make your choice',
    'home.mode.default': 'CURATED',
    'home.mode.default.desc': 'Premium Selection',
    'home.mode.ai': 'AI POWERED',
    'home.mode.ai.desc': 'Custom scenario',
    'home.mode.story': 'STORY MODE',
    'home.mode.story.desc': 'Narrative arc',
    'home.prompt.label': 'SCENARIO PROMPT (OPTIONAL)',
    'home.prompt.placeholder': 'e.g., A self-driving car must choose between saving passengers or pedestrians...',
    'home.prompt.help': 'Leave blank for random AI-generated scenario',
    'home.button.enter': 'ENTER',
    'home.button.loading': 'LOADING...',
    'home.ai.prompt.label': 'Scenario Prompt',
    'home.ai.prompt.placeholder': 'e.g., A self-driving car has brake failure. Must hit 10 pedestrians or sacrifice 1 passenger...',
    'home.ai.prompt.help': 'Leave blank for completely random generation',
    'home.ai.button.random': 'Random Scenario',
    'home.ai.button.randomGenerating': 'Generating...',
    'home.ai.button.enter': 'Generate & Enter Dilemma',
    'home.ai.button.generating': 'Generating Dilemma...',
    'home.story.button': 'View Stories',
    'home.default.murder': 'Crime Scene',
    'home.halloffame.subtitle': 'Community\'s Best Dilemmas',
    'home.halloffame.views': 'views',
    'home.halloffame.choices': 'choices',
    'home.feature.ai.title': 'AI GENERATED',
    'home.feature.ai.desc': 'Infinite scenarios',
    'home.feature.xr.title': 'IMMERSIVE XR',
    'home.feature.xr.desc': 'Walk through your choice',
    'home.feature.analysis.title': 'DEEP ANALYSIS',
    'home.feature.analysis.desc': 'Know yourself',

    // Stories
    'stories.title': 'STORIES',
    'stories.subtitle': 'Interactive branching narratives',
    'stories.button.create': 'CREATE NEW',
    'stories.create.title': 'CREATE NEW STORY',
    'stories.create.mode.default': 'DEFAULT',
    'stories.create.mode.default.desc': 'Quick start',
    'stories.create.mode.ai': 'AI POWERED',
    'stories.create.mode.ai.desc': 'Custom story',
    'stories.create.theme.label': 'STORY THEME (OPTIONAL)',
    'stories.create.theme.placeholder': 'e.g., A detective solving crimes in a cyberpunk city...',
    'stories.create.theme.help': 'Leave blank for random AI-generated story',
    'stories.create.button.cancel': 'CANCEL',
    'stories.create.button.create': 'CREATE',
    'stories.create.button.creating': 'CREATING...',
    'stories.empty.title': 'No stories available yet',
    'stories.empty.button': 'CREATE FIRST STORY',
    'stories.card.by': 'by',
    'stories.card.nodes': 'nodes',
    'stories.card.play': 'PLAY →',
    'stories.back': '← BACK TO HOME',

    // Story Player
    'story.back': '← BACK TO STORIES',
    'story.completed.title': 'STORY COMPLETED',
    'story.completed.subtitle': 'You have reached the end of this narrative',
    'story.completed.button.stories': 'BROWSE STORIES',
    'story.completed.button.home': 'RETURN HOME',
    'story.path.a': 'PATH A',
    'story.path.b': 'PATH B',
    'story.processing': 'PROCESSING CHOICE...',

    // Dilemma
    'dilemma.loading': 'Preparing dilemma...',
    'dilemma.error': 'ERROR',
    'dilemma.error.notfound': 'Resource not found',
    'dilemma.error.button': 'RETURN',

    // Multiplayer
    'multiplayer.title': 'MULTIPLAYER',
    'multiplayer.subtitle': 'Experience dilemmas together',
    'multiplayer.button': 'MULTIPLAYER MODE',

    // Archive
    'archive.title': 'ARCHIVE',
    'archive.subtitle': 'Explore all dilemmas',
    'archive.filter.all': 'All',
    'archive.filter.ai': 'AI Generated',
    'archive.filter.default': 'Default',
    'archive.empty': 'No dilemmas available yet',
    'archive.empty.button': 'Create New Dilemma',
    'archive.card.explore': 'Explore',

    // Profile
    'profile.title': 'PROFILE',
    'profile.subtitle': 'Your choice journey',
    'profile.empty': 'No choices made yet',
    'profile.empty.button': 'Start First Dilemma',
    'profile.stats.total': 'Total Choices',
    'profile.stats.categories': 'Categories',
    'profile.stats.analysis': 'Analysis',
    'profile.categories.title': 'Category Distribution',
    'profile.recent.title': 'Recent Choices',
    'profile.analysis.title': 'Personality Analysis',

    // Common
    'common.loading': 'LOADING...',
    'common.error': 'ERROR',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ko] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
