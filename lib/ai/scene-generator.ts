/**
 * Procedural 3D Scene Generator
 * Analyzes prompts and generates 3D environments using Three.js
 */

import OpenAI from 'openai'
import { MODEL_CATALOG, getRelevantModels, formatCatalogForGPT, type ModelInfo } from '@/lib/model-catalog'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface SceneObject {
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'tree' | 'building' | 'rock' |
        'car' | 'road' | 'crosswalk' | 'traffic_light' | 'hospital' | 'person' | 'table' | 'chair' |
        'computer' | 'door' | 'window' | 'wall' | 'fence' | 'bench' | 'lamp_post' | 'sign'
  position: [number, number, number]
  scale: [number, number, number]
  rotation: [number, number, number]
  color: string
  modelPath?: string  // Optional path to OBJ model file
  emissive?: string
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
}

export interface Scene3D {
  skyColor: string
  groundColor: string
  fogColor: string
  fogDensity: number
  ambientLightIntensity: number
  ambientLightColor: string
  objects: SceneObject[]
  lights: Array<{
    type: 'point' | 'directional' | 'spot'
    position: [number, number, number]
    color: string
    intensity: number
  }>
}

/**
 * Uses GPT-4 Omni to analyze the prompt and generate a 3D scene description
 */
export async function generateSceneFromPrompt(prompt: string, category?: string, title?: string, situation?: string): Promise<Scene3D> {
  console.log('🎨 Generating scene from prompt using GPT-4 Omni...')

  // Detect if the scene is indoor or outdoor
  const fullContext = `${prompt} ${title || ''} ${situation || ''} ${category || ''}`.toLowerCase()

  // More precise indoor detection
  const indoorKeywords = ['hospital', 'office', 'room', 'indoor', '병원', '사무실', '실내', '방', 'bedroom', 'kitchen']
  const farmKeywords = ['farm', 'barn', 'agriculture', 'rural', '농장', '농업', 'drought', '가뭄', 'crop', 'harvest', 'field']
  const urbanKeywords = ['city', 'urban', 'street', 'building', 'traffic', '도시', '교통', 'car']

  const hasIndoorKeyword = indoorKeywords.some(keyword => fullContext.includes(keyword))
  const hasFarmKeyword = farmKeywords.some(keyword => fullContext.includes(keyword))
  const hasUrbanKeyword = urbanKeywords.some(keyword => fullContext.includes(keyword))

  // Get relevant models based on the prompt
  let relevantModels = getRelevantModels(prompt, 20)

  // Smart filtering based on context
  if (hasIndoorKeyword && !hasFarmKeyword && !hasUrbanKeyword) {
    // Pure indoor scene: only furniture
    relevantModels = relevantModels.filter(m => m.category === 'furniture')
  } else if (hasFarmKeyword) {
    // Farm scene: only farm models (no furniture, no urban)
    relevantModels = relevantModels.filter(m => m.category === 'farm')
  } else if (hasUrbanKeyword) {
    // Urban scene: houses and urban models (no furniture, no farm)
    relevantModels = relevantModels.filter(m => m.category === 'urban' || m.category === 'building')
  } else {
    // Mixed/Outdoor scene: use all categories, but prefer outdoor (farm + urban)
    // Exclude furniture unless specifically mentioned
    const hasFurnitureKeyword = ['bed', 'chair', 'desk', 'sofa', 'table', '침대', '의자', '책상'].some(k => fullContext.includes(k))
    if (!hasFurnitureKeyword) {
      relevantModels = relevantModels.filter(m => m.category !== 'furniture')
    }
  }

  // Limit to 15 models
  relevantModels = relevantModels.slice(0, 15)

  const modelListText = relevantModels.map(m =>
    `  - "${m.name}" → path: "${m.path}" (${m.tags.join(', ')})`
  ).join('\n')

  // ALWAYS use GPT-4 Omni to generate scene based on prompt
  // Randomized minimalist scene is fallback if GPT-4 fails
  let sceneContext = 'OUTDOOR'
  let sceneInstructions = '- This is an OUTDOOR scene. Use buildings, nature elements, and outdoor structures.'

  if (hasIndoorKeyword && !hasFarmKeyword && !hasUrbanKeyword) {
    sceneContext = 'INDOOR'
    sceneInstructions = '- This is an INDOOR scene. Use furniture, interior objects, and building elements. DO NOT use farm buildings or outdoor structures.'
  } else if (hasFarmKeyword) {
    sceneContext = 'FARM/RURAL'
    sceneInstructions = '- This is a FARM/RURAL scene. Use farm buildings (barns, silos, windmills, chicken coops, fences). DO NOT use furniture or urban buildings.'
  } else if (hasUrbanKeyword) {
    sceneContext = 'URBAN/CITY'
    sceneInstructions = '- This is an URBAN/CITY scene. Use houses, buildings, and city structures. DO NOT use farm buildings or furniture.'
  }

  const systemPrompt = `You are an expert 3D scene designer for immersive moral dilemmas. Create ATMOSPHERIC, DETAILED, and MEANINGFUL 3D environments that deeply represent the dilemma's theme and context.

**SCENE CONTEXT: ${sceneContext}**
${sceneInstructions}

**AVAILABLE 3D MODELS** - You MUST prioritize these models for realism:
${modelListText}

CRITICAL RULES - MUST FOLLOW:
1. **DETAILED REALISM** - Use 8-15 objects to create an immersive, believable environment
   - Create depth and layers with foreground, midground, background objects
   - Use varied sizes and positions to create visual interest

2. **CONTEXTUAL STORYTELLING** - Objects should tell the story of the dilemma
   ${sceneContext === 'INDOOR'
     ? '- Indoor/Hospital → Beds, chairs, desks, medical equipment, doors, walls\n   - Office → Desks, office chairs, bookcases, computers\n   - Use furniture and interior objects from the available models'
     : sceneContext === 'FARM/RURAL'
     ? '- Farm dilemma → Barns, silos, windmills, fences, chicken coops\n   - Use farm buildings and rural structures from the available models'
     : sceneContext === 'URBAN/CITY'
     ? '- Urban dilemma → Houses, buildings, city structures\n   - Use urban/residential buildings from the available models'
     : '- Use buildings, nature elements, and outdoor structures from the available models'
   }
   - Use real-world spatial logic and natural placement

3. **MAXIMIZE USE OF REAL 3D MODELS** - ALWAYS prefer available models over basic shapes
   - Include the exact "modelPath" field from the available models list
   - Only use basic shapes (box, sphere, etc.) for small decorative accents
   ${sceneContext === 'INDOOR'
     ? '- IMPORTANT: Only use FURNITURE and INDOOR models, never farm buildings or urban houses'
     : sceneContext === 'FARM/RURAL'
     ? '- IMPORTANT: Only use FARM models (barns, silos, windmills), never furniture or urban buildings'
     : sceneContext === 'URBAN/CITY'
     ? '- IMPORTANT: Only use URBAN/HOUSE models, never furniture or farm buildings'
     : '- IMPORTANT: Use appropriate outdoor models based on context'
   }

4. **CENTRAL SPACE MUST BE EMPTY** - Keep [0, 0-2, -3 to 0] CLEAR for UI panel

5. **IMPROVED POSITION CONSTRAINTS**:
   - **LEFT CLUSTER**: x: -15 to -4, z: -15 to -4 (larger area for more objects)
   - **RIGHT CLUSTER**: x: 4 to 15, z: -15 to -4 (larger area for more objects)
   - **BACKGROUND**: x: -3 to 3, z: -20 to -12 (far background objects)
   - **y axis**: 0 or higher (objects on ground, y=0 for buildings)
   - **SPREAD OBJECTS OUT** - Use the full space available, don't cluster too tight

6. Available object types (use generously for detail):
   - Basic shapes: box, sphere, cylinder, cone, torus, plane (accents only)
   - Urban: car, road, crosswalk, traffic_light, building, lamp_post, sign, bench, fence
   - Indoor: table, chair, computer, door, window, wall
   - Medical: hospital (building type)
   - Nature: tree, rock
   - Human: person

7. **REALISTIC SCALE** (1 unit = 1 meter):
   - **CRITICAL**: When using models from the catalog, use their EXACT scale value - DO NOT modify
   - Farm Buildings (OBJ): Use catalog scale (0.7-1.5)
   - Furniture/Houses (FBX): Use catalog scale (0.02-0.05) - FBX models are exported EXTREMELY large
   - Basic shapes: scale 0.5-2.0 for variety
   - DO NOT increase model scales - they are already correctly sized

8. **ATMOSPHERIC COLORS**:
   - Use thematic color palettes (browns/greens for farm, grays for urban, whites for medical)
   - Metalness: 0.1-0.3 for most objects
   - Roughness: 0.7-0.9 for natural materials
   - Add subtle emissive highlights for focal points (intensity: 0.1-0.3)

9. **ENHANCED LIGHTING** - Create atmosphere with 2-4 lights:
   - Main light in center-back for overall illumination
   - Side lights to create depth and shadows
   - Accent lights near important objects

10. **VISUAL COMPOSITION**:
    - Create LEFT and RIGHT clusters of objects
    - Add 1-2 background objects for depth
    - Rotate objects naturally (not all facing forward)
    - Use varying heights (y positions) for interest

DETAILED SCENE EXAMPLES (8-15 objects, REALISTIC POSITIONING):

**Farm/Drought dilemma** (12 objects):
LEFT CLUSTER (struggling farm):
- Big Barn at [-12, 0, -8], scale [1.2, 1.2, 1.2], rotation [0, 0.3, 0]
- Chicken Coop at [-8, 0, -6], scale [0.8, 0.8, 0.8]
- Fence at [-14, 0, -5], scale [1.0, 1.0, 1.0], rotation [0, 1.5, 0]
- Dried tree (rock) at [-10, 0, -10], scale [0.6, 1.2, 0.6]

RIGHT CLUSTER (alternative/choice):
- Silo at [10, 0, -7], scale [0.9, 0.9, 0.9]
- Tower Windmill at [12, 0, -9], scale [0.8, 0.8, 0.8]
- Small Barn at [7, 0, -12], scale [0.9, 0.9, 0.9]
- Fence at [14, 0, -6], scale [1.0, 1.0, 1.0]

BACKGROUND:
- Silo House at [0, 0, -16], scale [0.8, 0.8, 0.8]
- Tree at [-2, 0, -14], scale [0.7, 1.4, 0.7]
- Tree at [2, 0, -15], scale [0.6, 1.3, 0.6]
- Rock (dry ground) at [0, 0, -18], scale [1.2, 0.3, 1.2]
Total: 12 objects

**Urban/Traffic dilemma** (10 objects):
LEFT CLUSTER:
- Building at [-12, 0, -10], scale [1.5, 2.5, 1.5]
- Car at [-8, 0, -6], scale [1.0, 1.0, 1.0], rotation [0, -0.5, 0]
- Person at [-10, 0.85, -8]
- Traffic light at [-6, 2.5, -7]

RIGHT CLUSTER:
- Building at [11, 0, -12], scale [1.3, 2.2, 1.3]
- Road (plane) at [8, 0, -8], scale [4, 0.1, 8], rotation [-1.57, 0, 0]
- Crosswalk (plane) at [8, 0.01, -6], scale [2, 0.1, 3]
- Lamp post at [12, 0, -7], scale [0.5, 2.8, 0.5]

BACKGROUND:
- Building at [0, 0, -18], scale [1.4, 2.8, 1.4]
- Sign at [0, 2, -15], scale [0.8, 0.8, 0.8]
Total: 10 objects

Return ONLY valid JSON in this exact format (8-15 objects, use full space):
{
  "skyColor": "#1a1a2e",
  "groundColor": "#2a2a3e",
  "fogColor": "#1a1a2e",
  "fogDensity": 0.015,
  "ambientLightIntensity": 0.3,
  "ambientLightColor": "#ffffff",
  "objects": [
    {
      "type": "building",
      "modelPath": "/models/farm/Big%20Barn/BigBarn.obj",
      "position": [-12, 0, -8],
      "scale": [1.2, 1.2, 1.2],
      "rotation": [0, 0.3, 0],
      "color": "#8B4513",
      "metalness": 0.2,
      "roughness": 0.8
    },
    {
      "type": "building",
      "modelPath": "/models/farm/Silo/Silo.obj",
      "position": [10, 0, -7],
      "scale": [0.9, 0.9, 0.9],
      "rotation": [0, -0.2, 0],
      "color": "#D2691E",
      "metalness": 0.3,
      "roughness": 0.7
    },
    {
      "type": "building",
      "modelPath": "/models/farm/Tower%20Windmill/TowerWindmill.obj",
      "position": [12, 0, -9],
      "scale": [0.8, 0.8, 0.8],
      "rotation": [0, 0, 0],
      "color": "#F5DEB3",
      "metalness": 0.2,
      "roughness": 0.8
    },
    {
      "type": "fence",
      "modelPath": "/models/farm/Fence/Fence2.obj",
      "position": [-14, 0, -5],
      "scale": [1.0, 1.0, 1.0],
      "rotation": [0, 1.5, 0],
      "color": "#A0522D",
      "metalness": 0.1,
      "roughness": 0.9
    },
    {
      "type": "tree",
      "position": [-2, 0, -14],
      "scale": [0.7, 1.4, 0.7],
      "rotation": [0, 0.5, 0],
      "color": "#2d5016",
      "metalness": 0.1,
      "roughness": 0.9
    },
    {
      "type": "rock",
      "position": [0, 0, -18],
      "scale": [1.2, 0.3, 1.2],
      "rotation": [0, 0, 0],
      "color": "#8B7355",
      "metalness": 0.2,
      "roughness": 0.9
    }
  ],
  "lights": [
    {
      "type": "point",
      "position": [0, 8, -10],
      "color": "#ffeedd",
      "intensity": 0.8
    },
    {
      "type": "point",
      "position": [-12, 5, -8],
      "color": "#ffddcc",
      "intensity": 0.5
    },
    {
      "type": "point",
      "position": [10, 5, -7],
      "color": "#ffddcc",
      "intensity": 0.5
    }
  ]
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',  // GPT-4 Omni supports JSON mode
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Create a DETAILED, IMMERSIVE 3D scene with 8-15 objects for this dilemma:

**DILEMMA**: ${prompt}

STRICT REQUIREMENTS:
- **8-15 objects** - Create a rich, detailed environment
- **MAXIMIZE USE OF REAL OBJ MODELS** - Use barn, silo, windmill, fence models from the available list
  - Include the exact "modelPath" from the available models (with %20 for spaces)
  - Farm themes should use multiple farm buildings to create a complete farmyard
- **SPATIAL ORGANIZATION**:
  - Create LEFT cluster (x: -15 to -4, z: -15 to -4) with 3-5 objects
  - Create RIGHT cluster (x: 4 to 15, z: -15 to -4) with 3-5 objects
  - Add BACKGROUND objects (x: -3 to 3, z: -20 to -12) for depth
  - KEEP CENTER CLEAR (x: -3 to 3, z: -3 to 0)
- **REALISTIC POSITIONING**:
  - Buildings should be on ground (y=0)
  - Use varied positions - don't stack objects at same coordinates
  - Rotate objects naturally (rotation y: 0 to 6.28)
  - Scale objects appropriately (buildings: 0.8-1.5, small items: 0.5-1.0)
- **ENHANCED ATMOSPHERE**:
  - Add 2-4 lights for depth and drama
  - Use thematic color palette
  - Include emissive highlights on 1-2 focal objects (intensity 0.1-0.2)
- Return ONLY valid JSON, no markdown, no explanation

START JSON NOW:`
        },
      ],
      temperature: 0.5,  // Increased for more creative scene variations
      max_tokens: 3000,  // More tokens for detailed scenes
      response_format: { type: "json_object" },  // Force JSON response
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Extract JSON from response (handle markdown code blocks and mixed text)
    let jsonStr = content.trim()

    // Try to extract JSON from markdown code blocks
    if (jsonStr.includes('```json')) {
      const match = jsonStr.match(/```json\s*\n?([\s\S]*?)\n?```/)
      if (match) {
        jsonStr = match[1].trim()
      }
    } else if (jsonStr.includes('```')) {
      const match = jsonStr.match(/```\s*\n?([\s\S]*?)\n?```/)
      if (match) {
        jsonStr = match[1].trim()
      }
    }

    // Try to extract JSON object from mixed text
    if (!jsonStr.startsWith('{')) {
      const match = jsonStr.match(/\{[\s\S]*\}/)
      if (match) {
        jsonStr = match[0]
      }
    }

    const scene: Scene3D = JSON.parse(jsonStr)
    console.log('✅ Scene generated:', scene.objects.length, 'objects')

    return scene
  } catch (error: any) {
    console.error('❌ Failed to generate scene with GPT-4:', error)

    // Fallback: Generate a minimalist randomized scene
    console.log('⚠️ Falling back to randomized minimalist scene...')
    const scene = generateRandomMinimalistScene(relevantModels, sceneContext)
    console.log('✅ Randomized scene generated:', scene.objects.length, 'objects')
    return scene
  }
}

/**
 * Generate a detailed randomized scene with 8-15 objects
 * Uses real OBJ/FBX models from the catalog for immersion
 * Creates LEFT, RIGHT, and BACKGROUND clusters
 * Uses filtered models based on scene context
 */
function generateRandomMinimalistScene(availableModels: ModelInfo[], sceneContext: string): Scene3D {
  const objectTypes: SceneObject['type'][] = [
    'box', 'sphere', 'cylinder', 'cone', 'torus',
    'tree', 'building', 'rock', 'car',
    'bench', 'lamp_post', 'sign'
  ]

  const colors = [
    '#8B4513', '#A0522D', '#CD853F', '#D2691E', // Browns for farm
    '#2d5016', '#4a7c2c', '#6b8e23', // Greens for nature
    '#666666', '#888888', '#aaaaaa', '#8B7355' // Grays and earthy tones
  ]

  // Generate 8-15 objects for a richer scene
  const objectCount = 8 + Math.floor(Math.random() * 8) // 8 to 15
  const objects: SceneObject[] = []

  // Use the pre-filtered models passed from the main function
  console.log(`🎲 Random scene with ${availableModels.length} available models (${sceneContext})`)
  if (availableModels.length === 0) {
    console.warn('⚠️ No models available! Using default farm models...')
    availableModels = MODEL_CATALOG.filter(m => m.category === 'farm')
  }

  // Create LEFT cluster (3-5 objects)
  const leftCount = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < leftCount && objects.length < objectCount; i++) {
    const obj = createClusterObject(availableModels, objectTypes, colors, 'left')
    objects.push(obj)
  }

  // Create RIGHT cluster (3-5 objects)
  const rightCount = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < rightCount && objects.length < objectCount; i++) {
    const obj = createClusterObject(availableModels, objectTypes, colors, 'right')
    objects.push(obj)
  }

  // Add BACKGROUND objects (2-5 objects)
  const backgroundCount = 2 + Math.floor(Math.random() * 4)
  for (let i = 0; i < backgroundCount && objects.length < objectCount; i++) {
    const obj = createClusterObject(availableModels, objectTypes, colors, 'background')
    objects.push(obj)
  }

  // Add 2-4 atmospheric lights
  const lightCount = 2 + Math.floor(Math.random() * 3)
  const lights = []

  // Main center light
  lights.push({
    type: 'point' as const,
    position: [0, 8, -10] as [number, number, number],
    color: '#ffeedd',
    intensity: 0.8
  })

  // Side lights
  for (let i = 1; i < lightCount; i++) {
    const xSide = Math.random() > 0.5 ? 1 : -1
    lights.push({
      type: 'point' as const,
      position: [
        xSide * (8 + Math.random() * 6), // -14 to -8 or 8 to 14
        4 + Math.random() * 3, // 4 to 7
        -6 + Math.random() * 6 // -6 to -12
      ] as [number, number, number],
      color: Math.random() > 0.5 ? '#ffddcc' : '#ffeedd',
      intensity: 0.4 + Math.random() * 0.3
    })
  }

  return {
    skyColor: '#1a1a2e',
    groundColor: '#2a2a3e',
    fogColor: '#1a1a2e',
    fogDensity: 0.015,
    ambientLightIntensity: 0.3,
    ambientLightColor: '#ffffff',
    objects,
    lights
  }
}

/**
 * Helper function to create objects in clusters
 */
function createClusterObject(
  availableModels: ModelInfo[],
  objectTypes: SceneObject['type'][],
  colors: string[],
  cluster: 'left' | 'right' | 'background'
): SceneObject {
  // 90% chance to use real OBJ models (increased from 80%)
  const useModel = availableModels.length > 0 && Math.random() > 0.1

  let x: number, y: number, z: number

  // Position based on cluster
  if (cluster === 'left') {
    x = -15 + Math.random() * 11  // -15 to -4
    y = 0
    z = -15 + Math.random() * 11  // -15 to -4
  } else if (cluster === 'right') {
    x = 4 + Math.random() * 11   // 4 to 15
    y = 0
    z = -15 + Math.random() * 11  // -15 to -4
  } else { // background
    x = -3 + Math.random() * 6    // -3 to 3
    y = 0
    z = -20 + Math.random() * 8   // -20 to -12
  }

  if (useModel) {
    const model = availableModels[Math.floor(Math.random() * availableModels.length)]
    const scaleVariation = 0.8 + Math.random() * 0.7  // 0.8 to 1.5
    const scaleBase = model.defaultScale * scaleVariation
    const scale: [number, number, number] = [scaleBase, scaleBase, scaleBase]
    const rotation: [number, number, number] = [0, Math.random() * Math.PI * 2, 0]
    const color = colors[Math.floor(Math.random() * colors.length)]

    return {
      type: 'building',
      modelPath: model.path,
      position: [x, y, z],
      scale,
      rotation,
      color,
      metalness: 0.1 + Math.random() * 0.2,
      roughness: 0.7 + Math.random() * 0.2,
      emissive: Math.random() > 0.8 ? '#ffaa66' : undefined,
      emissiveIntensity: Math.random() > 0.8 ? 0.1 + Math.random() * 0.2 : undefined
    }
  } else {
    const type = objectTypes[Math.floor(Math.random() * objectTypes.length)]
    const scaleBase = 0.5 + Math.random() * 1.0
    const scale: [number, number, number] = [
      scaleBase,
      scaleBase * (0.8 + Math.random() * 0.4),
      scaleBase
    ]
    const rotation: [number, number, number] = [0, Math.random() * Math.PI * 2, 0]
    const color = colors[Math.floor(Math.random() * colors.length)]

    return {
      type,
      position: [x, y, z],
      scale,
      rotation,
      color,
      metalness: 0.1 + Math.random() * 0.2,
      roughness: 0.7 + Math.random() * 0.2
    }
  }
}

