/**
 * 3D Model Generation with Meshy AI
 * Free tier: 200 credits/month
 * https://www.meshy.ai
 */

interface Meshy3DResponse {
  id: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed'
  model_url?: string // GLB file
  thumbnail_url?: string
}

export async function generateMeshy3D(prompt: string): Promise<string | null> {
  const MESHY_API_KEY = process.env.MESHY_API_KEY

  if (!MESHY_API_KEY) {
    console.warn('MESHY_API_KEY not configured')
    return null
  }

  try {
    // Step 1: Create 3D generation task
    const createResponse = await fetch('https://api.meshy.ai/v2/text-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MESHY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'preview', // 'preview' or 'refine' (preview is faster, free)
        prompt: prompt,
        art_style: 'realistic',
        negative_prompt: 'low quality, blurry, distorted',
        target_polycount: 30000, // Lower for web performance
      })
    })

    const task = await createResponse.json()
    console.log('Meshy task created:', task.id)

    // Step 2: Poll for completion (usually takes 1-3 minutes for preview)
    let result: Meshy3DResponse = task
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max

    while (result.status !== 'succeeded' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

      const statusResponse = await fetch(`https://api.meshy.ai/v2/text-to-3d/${task.id}`, {
        headers: {
          'Authorization': `Bearer ${MESHY_API_KEY}`,
        }
      })

      result = await statusResponse.json()
      attempts++

      console.log(`Meshy status (${attempts}/${maxAttempts}):`, result.status)

      if (result.status === 'failed') {
        throw new Error('3D generation failed')
      }
    }

    if (result.status === 'succeeded' && result.model_url) {
      console.log('✅ Meshy 3D generated:', result.model_url)
      return result.model_url // GLB file URL
    }

    throw new Error('3D generation timeout')

  } catch (error) {
    console.error('Meshy 3D generation error:', error)
    return null
  }
}

/**
 * Alternative: Poly Pizza free models
 */
export async function searchPolyPizza(keywords: string): Promise<string | null> {
  try {
    const response = await fetch(`https://poly.pizza/api/models?keywords=${encodeURIComponent(keywords)}`)
    const data = await response.json()

    if (data.models && data.models.length > 0) {
      // Return first matching model GLB
      const model = data.models[0]
      return model.formats?.glb || null
    }

    return null
  } catch (error) {
    console.error('Poly Pizza search error:', error)
    return null
  }
}

/**
 * Procedural 3D generation (completely free, no API needed)
 */
export function generateProceduralScene(prompt: string) {
  // Returns Three.js scene configuration as JSON
  // This will be rendered client-side

  const sceneConfig = {
    objects: [] as any[],
    lighting: {
      ambient: { color: 0x404040, intensity: 0.5 },
      directional: { color: 0xffffff, intensity: 0.8, position: [10, 10, 10] }
    },
    camera: {
      position: [0, 2, 5],
      lookAt: [0, 0, 0]
    }
  }

  // Simple keyword-based generation
  const lowerPrompt = prompt.toLowerCase()

  // Add floor
  sceneConfig.objects.push({
    type: 'plane',
    position: [0, 0, 0],
    rotation: [-Math.PI / 2, 0, 0],
    scale: [50, 50, 1],
    material: { color: 0x808080 }
  })

  // Keyword detection
  if (lowerPrompt.includes('도서관') || lowerPrompt.includes('library')) {
    // Add bookshelves
    for (let i = 0; i < 5; i++) {
      sceneConfig.objects.push({
        type: 'box',
        position: [-10 + i * 5, 2, -5],
        scale: [2, 4, 1],
        material: { color: 0x8B4513 }
      })
    }
  }

  if (lowerPrompt.includes('구슬') || lowerPrompt.includes('sphere') || lowerPrompt.includes('orb')) {
    // Add glowing sphere
    sceneConfig.objects.push({
      type: 'sphere',
      position: [0, 3, 0],
      scale: [0.5, 0.5, 0.5],
      material: {
        color: 0x9333ea,
        emissive: 0x9333ea,
        emissiveIntensity: 2
      }
    })
  }

  if (lowerPrompt.includes('숲') || lowerPrompt.includes('forest') || lowerPrompt.includes('tree')) {
    // Add trees
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 20 - 10
      const z = Math.random() * 20 - 10

      sceneConfig.objects.push({
        type: 'cylinder',
        position: [x, 1, z],
        scale: [0.3, 2, 0.3],
        material: { color: 0x8B4513 }
      })
      sceneConfig.objects.push({
        type: 'cone',
        position: [x, 3, z],
        scale: [1, 2, 1],
        material: { color: 0x228B22 }
      })
    }
  }

  return sceneConfig
}
