/**
 * Procedural 3D Scene Generator
 * Analyzes prompts and generates 3D environments using Three.js
 */

import OpenAI from 'openai'
import { MODEL_CATALOG, getRelevantModels, formatCatalogForGPT } from '@/lib/model-catalog'

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

  // Get relevant models based on the prompt
  const relevantModels = getRelevantModels(prompt, 15)
  const modelListText = relevantModels.map(m =>
    `  - "${m.name}" → path: "${m.path}" (${m.tags.join(', ')})`
  ).join('\n')

  // ALWAYS use GPT-4 Omni to generate scene based on prompt
  // Randomized minimalist scene is fallback if GPT-4 fails
  const systemPrompt = `You are a minimalist 3D scene designer for moral dilemmas. Create SIMPLE, CLEAN, SYMBOLIC 3D environments that represent the dilemma's theme.

**AVAILABLE 3D MODELS** - You MUST use these OBJ models instead of basic shapes when appropriate:
${modelListText}

CRITICAL RULES - MUST FOLLOW:
1. **MINIMALIST APPROACH** - Use 6-10 objects ONLY. Less is more.
2. **SYMBOLIC REPRESENTATION** - Objects should SYMBOLIZE the dilemma, not recreate reality
3. **USE REAL 3D MODELS** - ALWAYS use the OBJ models from the available list above when they match the theme
   - If the dilemma is about farming, nature, or rural life → use barn, silo, windmill, fence models
   - Include the exact "modelPath" field from the available models list
   - You can still use basic shapes (box, sphere, etc.) for abstract elements, but PREFER real models
4. **CENTRAL SPACE MUST BE EMPTY** - The area around [0, 0-2, -3 to 0] must be kept CLEAR for the dilemma display panel
5. **POSITION CONSTRAINTS - STRICTLY FOLLOW**:
   - x axis: -15 to -5 (LEFT side) or 5 to 15 (RIGHT side) - AVOID CENTER (-5 to 5)
   - y axis: 0 or higher (NEVER negative - objects must be on or above ground)
   - z axis: -12 to -4 (BEHIND the central panel, visible but not blocking)
   - Keep objects SMALL and SPREAD OUT
6. Available object types (use SPARINGLY):
   - Basic shapes: box, sphere, cylinder, cone, torus, plane
   - Urban: car, road, crosswalk, traffic_light, building, lamp_post, sign, bench, fence
   - Indoor: table, chair, computer, door, window, wall
   - Medical: hospital (building type)
   - Nature: tree, rock
   - Human: person
7. Scale objects SMALL (1 unit = 1 meter):
   - Keep objects compact: [0.5-2, 0.5-3, 0.5-2] range
   - Background elements should be distant and small
8. Use SIMPLE, SYMBOLIC colors:
   - Choose 2-3 main colors that represent the dilemma theme
   - Use LOW metalness (0.1-0.2) and HIGH roughness (0.8-0.9)
   - Avoid overly bright or emissive materials
9. Minimal lighting - let the main scene lights do the work
10. Keep sky/ground/fog DARK and subtle

MINIMALIST EXAMPLES (6-10 objects MAX):

Medical/Organ donation dilemma:
- 2 small boxes (representing medical equipment) at [-8, 0.5, -8] and [8, 0.5, -8]
- 1 person (patient) at [-10, 0.85, -7]
- 1 person (doctor) at [10, 0.85, -7]
- 1 sphere (symbolic organ) at [-6, 1, -10]
- 1 small building (hospital) at [0, 2.5, -12]
Total: 6 objects

Self-driving car dilemma:
- 1 car at [-8, 0.75, -6]
- 1 person (pedestrian) at [8, 0.85, -8]
- 1 traffic light at [10, 2, -10]
- 1 small road segment at [0, 0, -10]
Total: 4 objects

Privacy/Data dilemma:
- 2 boxes (servers/data) at [-10, 1, -8] and [10, 1, -8]
- 1 sphere (globe/network) at [0, 2, -12]
- 1 computer at [-7, 0.5, -6]
Total: 4 objects

Return ONLY valid JSON in this exact format (6-10 objects, AVOID CENTER x: -5 to 5, z: -3 to 0):
{
  "skyColor": "#0a0a0a",
  "groundColor": "#1a1a1a",
  "fogColor": "#0a0a0a",
  "fogDensity": 0.02,
  "ambientLightIntensity": 0.2,
  "ambientLightColor": "#ffffff",
  "objects": [
    {
      "type": "building",
      "modelPath": "/models/farm/Barn/Barn.obj",
      "position": [-8, 0, -8],
      "scale": [1, 1, 1],
      "rotation": [0, 0.5, 0],
      "color": "#8B4513",
      "metalness": 0.1,
      "roughness": 0.9
    },
    {
      "type": "fence",
      "modelPath": "/models/farm/Fence/Fence2.obj",
      "position": [10, 0, -7],
      "scale": [1, 1, 1],
      "rotation": [0, -0.5, 0],
      "color": "#A0522D",
      "metalness": 0.1,
      "roughness": 0.9
    },
    {
      "type": "sphere",
      "position": [-6, 1.5, -10],
      "scale": [0.8, 0.8, 0.8],
      "rotation": [0, 0, 0],
      "color": "#4488ff",
      "metalness": 0.1,
      "roughness": 0.9
    }
  ],
  "lights": [
    {
      "type": "point",
      "position": [-10, 5, -8],
      "color": "#ffffff",
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
          content: `Create a MINIMALIST 3D scene with 6-10 symbolic objects for this dilemma:

${prompt}

STRICT REQUIREMENTS:
- 6-10 objects ONLY (NOT MORE!)
- **USE THE AVAILABLE OBJ MODELS** from the list above - include exact "modelPath" when using them
- Objects represent SYMBOLIC meaning of the dilemma
- AVOID CENTER AREA: x must be < -5 or > 5, z must be < -4
- Position objects in BACKGROUND (z: -12 to -4)
- Keep objects SMALL and VISIBLE
- Return ONLY valid JSON, no markdown, no explanation

START JSON NOW:`
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
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
    const scene = generateRandomMinimalistScene()
    console.log('✅ Randomized scene generated:', scene.objects.length, 'objects')
    return scene
  }
}

/**
 * Generate a randomized minimalist scene with 6-10 objects
 * This ensures variety and prevents the same objects from appearing
 * Now uses real OBJ models from the catalog
 */
function generateRandomMinimalistScene(): Scene3D {
  const objectTypes: SceneObject['type'][] = [
    'box', 'sphere', 'cylinder', 'cone', 'torus',
    'tree', 'building', 'rock', 'car',
    'bench', 'lamp_post', 'sign'
  ]

  const colors = [
    '#8B4513', '#A0522D', '#CD853F', '#D2691E', // Browns for farm
    '#87CEEB', '#4488ff', '#ff4444', '#44ff44', // Sky blue, primary colors
    '#666666', '#888888', '#aaaaaa' // Grays
  ]

  // Generate 6-10 objects, mixing real models and basic shapes
  const objectCount = 6 + Math.floor(Math.random() * 5) // 6 to 10
  const objects: SceneObject[] = []

  // Use 50% real models, 50% basic shapes
  const useRealModels = Math.random() > 0.3 // 70% chance to use real models
  const availableModels = MODEL_CATALOG.length > 0 ? MODEL_CATALOG : []

  for (let i = 0; i < objectCount; i++) {
    let obj: SceneObject

    // 70% chance to use a real OBJ model if available
    if (useRealModels && availableModels.length > 0 && Math.random() > 0.3) {
      const model = availableModels[Math.floor(Math.random() * availableModels.length)]

      // Random position (AVOID CENTER, stay in BACKGROUND)
      const xSide = Math.random() > 0.5 ? 1 : -1
      const x = xSide * (5 + Math.random() * 10)
      const y = 0 // Models sit on ground
      const z = -12 + Math.random() * 8

      // Use model's default scale with some variation
      const scaleBase = model.defaultScale * (0.8 + Math.random() * 0.4)
      const scale: [number, number, number] = [scaleBase, scaleBase, scaleBase]

      const rotation: [number, number, number] = [0, Math.random() * Math.PI * 2, 0]
      const color = colors[Math.floor(Math.random() * colors.length)]

      obj = {
        type: 'building', // Use generic type for OBJ models
        modelPath: model.path, // Include the model path!
        position: [x, y, z],
        scale,
        rotation,
        color,
        metalness: 0.1,
        roughness: 0.9
      }
    } else {
      // Use basic geometric shape
      const type = objectTypes[Math.floor(Math.random() * objectTypes.length)]

      const xSide = Math.random() > 0.5 ? 1 : -1
      const x = xSide * (5 + Math.random() * 10)
      const y = Math.random() * 2
      const z = -12 + Math.random() * 8

      const scaleBase = 0.5 + Math.random() * 1.5
      const scale: [number, number, number] = [
        scaleBase,
        scaleBase * (0.8 + Math.random() * 0.4),
        scaleBase
      ]

      const rotation: [number, number, number] = [0, Math.random() * Math.PI * 2, 0]
      const color = colors[Math.floor(Math.random() * colors.length)]

      obj = {
        type,
        position: [x, y, z],
        scale,
        rotation,
        color,
        metalness: 0.1,
        roughness: 0.9
      }
    }

    objects.push(obj)
  }

  // Add 1-2 random lights
  const lightCount = 1 + Math.floor(Math.random() * 2)
  const lights = []

  for (let i = 0; i < lightCount; i++) {
    lights.push({
      type: 'point' as const,
      position: [
        (Math.random() - 0.5) * 20, // -10 to 10
        3 + Math.random() * 2, // 3 to 5
        -8 + Math.random() * 4 // -8 to -4
      ] as [number, number, number],
      color: '#ffffff',
      intensity: 0.5 + Math.random() * 0.5
    })
  }

  return {
    skyColor: '#0a0a0a',
    groundColor: '#1a1a1a',
    fogColor: '#0a0a0a',
    fogDensity: 0.02,
    ambientLightIntensity: 0.2,
    ambientLightColor: '#ffffff',
    objects,
    lights
  }
}

