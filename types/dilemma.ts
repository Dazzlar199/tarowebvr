/**
 * Type definitions for Dilemma and related data structures
 */

export interface DilemmaConsequences {
  choiceA: string
  choiceB: string
}

export interface DilemmaData {
  id: string
  title: string
  description: string
  optionA: string
  optionB: string
  situation?: string
  facts?: string[]
  immediateConsequences?: DilemmaConsequences
  longTermConsequences?: DilemmaConsequences
  ethicalPrinciples?: DilemmaConsequences
  hiddenMeaning?: string
  imageUrl?: string
  thumbnailUrl?: string
  sceneData?: string
  category: string
  tags?: string[]
  complexity: number
  emotionalIntensity: number
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE'
  isActive: boolean
  isApproved: boolean
  viewCount: number
  choiceCount: number
  authorId?: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ChoiceData {
  id: string
  dilemmaId: string
  userId: string
  choice: 'A' | 'B'
  timeSpent?: number
  vrSession: boolean
  createdAt: Date | string
}

export interface AnalysisData {
  id: string
  userId: string
  type: string
  description: string
  bigFive: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  valueAxes: {
    individualismCollectivism: number
    idealismRealism: number
    emotionLogic: number
    conservativeProgressive: number
  }
  decisionPattern?: string
  defenseMechanisms?: string[]
  growthAreas?: string[]
  traits?: string[]
  choiceCount: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CreateDilemmaRequest {
  useAI: boolean
  theme?: string
}

export interface CreateDilemmaResponse {
  dilemmaId: string
  message: string
}
