/**
 * 3D Model Catalog
 * Available OBJ models for scene generation
 */

export interface ModelInfo {
  name: string
  path: string
  category: 'farm' | 'building' | 'furniture' | 'nature' | 'urban'
  tags: string[]
  defaultScale: number
}

/**
 * Available OBJ models (excluding human models)
 */
export const MODEL_CATALOG: ModelInfo[] = [
  // Farm Buildings
  {
    name: 'Big Barn',
    path: '/models/farm/Big Barn/BigBarn.obj',
    category: 'farm',
    tags: ['barn', 'agriculture', 'rural', 'building', 'farm'],
    defaultScale: 1.0
  },
  {
    name: 'Small Barn',
    path: '/models/farm/Small Barn/SmallBarn.obj',
    category: 'farm',
    tags: ['barn', 'agriculture', 'rural', 'building', 'farm'],
    defaultScale: 0.8
  },
  {
    name: 'Open Barn',
    path: '/models/farm/Open Barn/OpenBarn.obj',
    category: 'farm',
    tags: ['barn', 'agriculture', 'rural', 'building', 'farm'],
    defaultScale: 0.9
  },
  {
    name: 'Barn',
    path: '/models/farm/Barn/Barn.obj',
    category: 'farm',
    tags: ['barn', 'agriculture', 'rural', 'building', 'farm'],
    defaultScale: 1.0
  },
  {
    name: 'Chicken Coop',
    path: '/models/farm/ChickenCoop/ChickenCoop.obj',
    category: 'farm',
    tags: ['coop', 'chicken', 'agriculture', 'rural', 'farm'],
    defaultScale: 0.7
  },
  {
    name: 'Silo',
    path: '/models/farm/Silo/Silo.obj',
    category: 'farm',
    tags: ['silo', 'storage', 'agriculture', 'rural', 'farm'],
    defaultScale: 0.8
  },
  {
    name: 'Silo House',
    path: '/models/farm/Silo House/Silo_House.obj',
    category: 'farm',
    tags: ['silo', 'storage', 'agriculture', 'rural', 'farm', 'building'],
    defaultScale: 0.8
  },
  {
    name: 'Tower Windmill',
    path: '/models/farm/Tower Windmill/TowerWindmill.obj',
    category: 'farm',
    tags: ['windmill', 'tower', 'energy', 'rural', 'farm'],
    defaultScale: 0.7
  },
  {
    name: 'Fence',
    path: '/models/farm/Fence/Fence2.obj',
    category: 'farm',
    tags: ['fence', 'boundary', 'rural', 'farm'],
    defaultScale: 1.0
  }
]

/**
 * Get models by category
 */
export function getModelsByCategory(category: ModelInfo['category']): ModelInfo[] {
  return MODEL_CATALOG.filter(model => model.category === category)
}

/**
 * Get models by tags (matches any tag)
 */
export function getModelsByTags(tags: string[]): ModelInfo[] {
  return MODEL_CATALOG.filter(model =>
    model.tags.some(tag => tags.includes(tag.toLowerCase()))
  )
}

/**
 * Get a random model from a category
 */
export function getRandomModel(category?: ModelInfo['category']): ModelInfo {
  const models = category ? getModelsByCategory(category) : MODEL_CATALOG
  return models[Math.floor(Math.random() * models.length)]
}

/**
 * Get multiple random models (no duplicates)
 */
export function getRandomModels(count: number, category?: ModelInfo['category']): ModelInfo[] {
  const models = category ? getModelsByCategory(category) : MODEL_CATALOG
  const shuffled = [...models].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, models.length))
}

/**
 * Get models relevant to a prompt/theme
 */
export function getRelevantModels(prompt: string, maxCount: number = 10): ModelInfo[] {
  const lowerPrompt = prompt.toLowerCase()

  // Extract keywords from prompt
  const keywords = lowerPrompt.split(/\s+/)

  // Score each model based on tag matches
  const scoredModels = MODEL_CATALOG.map(model => {
    let score = 0
    model.tags.forEach(tag => {
      if (keywords.some(keyword => keyword.includes(tag) || tag.includes(keyword))) {
        score += 1
      }
    })
    return { model, score }
  })

  // Sort by score and return top matches
  const sortedModels = scoredModels
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.model)

  // If no matches, return random models
  if (sortedModels.length === 0) {
    return getRandomModels(maxCount)
  }

  return sortedModels.slice(0, maxCount)
}

/**
 * Format model catalog for GPT prompt
 */
export function formatCatalogForGPT(): string {
  return MODEL_CATALOG.map(model =>
    `- ${model.name}: ${model.path} (tags: ${model.tags.join(', ')})`
  ).join('\n')
}
