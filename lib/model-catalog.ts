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
    path: '/models/farm/Big%20Barn/BigBarn.obj',
    category: 'farm',
    tags: ['barn', 'agriculture', 'rural', 'building', 'farm'],
    defaultScale: 1.0
  },
  {
    name: 'Small Barn',
    path: '/models/farm/Small%20Barn/SmallBarn.obj',
    category: 'farm',
    tags: ['barn', 'agriculture', 'rural', 'building', 'farm'],
    defaultScale: 0.8
  },
  {
    name: 'Open Barn',
    path: '/models/farm/Open%20Barn/OpenBarn.obj',
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
    path: '/models/farm/Silo%20House/Silo_House.obj',
    category: 'farm',
    tags: ['silo', 'storage', 'agriculture', 'rural', 'farm', 'building'],
    defaultScale: 0.8
  },
  {
    name: 'Tower Windmill',
    path: '/models/farm/Tower%20Windmill/TowerWindmill.obj',
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
  },

  // Furniture Models (FBX) - 매우 작은 스케일 (FBX 파일이 매우 큰 스케일로 export됨)
  {
    name: 'Double Bed',
    path: '/models/furniture/Bed%20Double/BedDouble.fbx',
    category: 'furniture',
    tags: ['bed', 'furniture', 'bedroom', 'sleep', 'medical', 'hospital', 'indoor'],
    defaultScale: 0.03
  },
  {
    name: 'Twin Bed',
    path: '/models/furniture/Bed%20Twin/BedTwin.fbx',
    category: 'furniture',
    tags: ['bed', 'furniture', 'bedroom', 'sleep', 'medical', 'hospital', 'indoor'],
    defaultScale: 0.03
  },
  {
    name: 'Bookcase with Books',
    path: '/models/furniture/Bookcase%20with%20Books/Bookcase_Books.fbx',
    category: 'furniture',
    tags: ['bookcase', 'books', 'furniture', 'library', 'office', 'education', 'indoor'],
    defaultScale: 0.03
  },
  {
    name: 'Chair',
    path: '/models/furniture/Chair/Chair.fbx',
    category: 'furniture',
    tags: ['chair', 'furniture', 'seating', 'office', 'dining', 'indoor'],
    defaultScale: 0.025
  },
  {
    name: 'Individual Sofa Chair',
    path: '/models/furniture/Chair/Sofa_individual.fbx',
    category: 'furniture',
    tags: ['chair', 'sofa', 'furniture', 'seating', 'living room', 'indoor'],
    defaultScale: 0.03
  },
  {
    name: 'Closet',
    path: '/models/furniture/Closet/Closet.fbx',
    category: 'furniture',
    tags: ['closet', 'wardrobe', 'furniture', 'storage', 'bedroom', 'indoor'],
    defaultScale: 0.03
  },
  {
    name: 'Short Closet',
    path: '/models/furniture/Short%20Closet/ShortCloset.fbx',
    category: 'furniture',
    tags: ['closet', 'wardrobe', 'furniture', 'storage', 'bedroom', 'indoor'],
    defaultScale: 0.025
  },
  {
    name: 'Desk',
    path: '/models/furniture/Desk/Desk.fbx',
    category: 'furniture',
    tags: ['desk', 'furniture', 'office', 'work', 'study', 'indoor'],
    defaultScale: 0.03
  },
  {
    name: 'Office Chair',
    path: '/models/furniture/Office%20Chair/OfficeChair.fbx',
    category: 'furniture',
    tags: ['chair', 'office', 'furniture', 'seating', 'work', 'indoor'],
    defaultScale: 0.025
  },
  {
    name: 'Door Style 1',
    path: '/models/furniture/Door/Door1.fbx',
    category: 'furniture',
    tags: ['door', 'entrance', 'building', 'indoor', 'architecture'],
    defaultScale: 0.03
  },
  {
    name: 'Door Style 2',
    path: '/models/furniture/Door/Door2.fbx',
    category: 'furniture',
    tags: ['door', 'entrance', 'building', 'indoor', 'architecture'],
    defaultScale: 0.03
  },
  {
    name: 'Door Style 3',
    path: '/models/furniture/Door/Door3.fbx',
    category: 'furniture',
    tags: ['door', 'entrance', 'building', 'indoor', 'architecture'],
    defaultScale: 0.03
  },
  {
    name: 'Night Stand',
    path: '/models/furniture/Night%20Stand/NightStand.fbx',
    category: 'furniture',
    tags: ['nightstand', 'furniture', 'bedroom', 'storage', 'indoor'],
    defaultScale: 0.02
  },
  {
    name: 'Sofa',
    path: '/models/furniture/Sofa/Sofa.fbx',
    category: 'furniture',
    tags: ['sofa', 'couch', 'furniture', 'seating', 'living room', 'indoor'],
    defaultScale: 0.03
  },
  {
    name: 'Sofa Style 2',
    path: '/models/furniture/Sofa/Sofa2.fbx',
    category: 'furniture',
    tags: ['sofa', 'couch', 'furniture', 'seating', 'living room', 'indoor'],
    defaultScale: 0.03
  },
  {
    name: 'Sofa Style 3',
    path: '/models/furniture/Sofa/Sofa3.fbx',
    category: 'furniture',
    tags: ['sofa', 'couch', 'furniture', 'seating', 'living room', 'indoor'],
    defaultScale: 0.03
  },
  {
    name: 'Stool',
    path: '/models/furniture/Stool/Stool.fbx',
    category: 'furniture',
    tags: ['stool', 'chair', 'furniture', 'seating', 'kitchen', 'bar', 'indoor'],
    defaultScale: 0.02
  },
  {
    name: 'Table',
    path: '/models/furniture/Table/Table.fbx',
    category: 'furniture',
    tags: ['table', 'furniture', 'dining', 'kitchen', 'indoor'],
    defaultScale: 0.03
  },
  {
    name: 'Table Style 2',
    path: '/models/furniture/Table/Table2.fbx',
    category: 'furniture',
    tags: ['table', 'furniture', 'dining', 'kitchen', 'indoor'],
    defaultScale: 0.03
  },

  // House Models (FBX) - 매우 작은 스케일
  {
    name: 'Single Story House',
    path: '/models/houses/House/house_type07.fbx',
    category: 'urban',
    tags: ['house', 'building', 'home', 'residential', 'suburban', 'architecture'],
    defaultScale: 0.05
  },
  {
    name: 'Single Story House Alt',
    path: '/models/houses/House-7VSVwAg2T3/house_type05.fbx',
    category: 'urban',
    tags: ['house', 'building', 'home', 'residential', 'suburban', 'architecture'],
    defaultScale: 0.05
  },
  {
    name: 'Two Story House Type 1',
    path: '/models/houses/Two%20story%20house/house_type02.fbx',
    category: 'urban',
    tags: ['house', 'building', 'home', 'residential', 'suburban', 'architecture', 'two story'],
    defaultScale: 0.05
  },
  {
    name: 'Two Story House Type 2',
    path: '/models/houses/Two%20story%20house/house_type03.fbx',
    category: 'urban',
    tags: ['house', 'building', 'home', 'residential', 'suburban', 'architecture', 'two story'],
    defaultScale: 0.05
  },
  {
    name: 'Two Story House Type 3',
    path: '/models/houses/Two%20story%20house/house_type06.fbx',
    category: 'urban',
    tags: ['house', 'building', 'home', 'residential', 'suburban', 'architecture', 'two story'],
    defaultScale: 0.05
  },
  {
    name: 'Two Story House Type 4',
    path: '/models/houses/Two%20story%20house/house_type12.fbx',
    category: 'urban',
    tags: ['house', 'building', 'home', 'residential', 'suburban', 'architecture', 'two story'],
    defaultScale: 0.05
  },
  {
    name: 'Two Story House Type 5',
    path: '/models/houses/Two%20story%20house-htvFgnVP4d/house_type08.fbx',
    category: 'urban',
    tags: ['house', 'building', 'home', 'residential', 'suburban', 'architecture', 'two story'],
    defaultScale: 0.05
  },
  {
    name: 'Two Story House Type 6',
    path: '/models/houses/Two%20story%20house-QsF9E0PqyN/house_type15.fbx',
    category: 'urban',
    tags: ['house', 'building', 'home', 'residential', 'suburban', 'architecture', 'two story'],
    defaultScale: 0.05
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
