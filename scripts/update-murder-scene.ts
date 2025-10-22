/**
 * Update murder crime scene dilemma with fixed 3D room scene
 * Uses the exact 3D room layout from My-3D-Room repository
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Fixed 3D room scene - neutral gray background, no fog
const murderRoomScene = {
  skyColor: '#808080',  // Medium gray
  groundColor: '#8B7355',  // Brown ground
  fogColor: '#909090',  // Gray fog (disabled)
  fogDensity: 0.0,  // No fog
  ambientLightIntensity: 0.5,  // Moderate ambient
  ambientLightColor: '#ffffff',  // White ambient
  objects: [
    {
      type: 'box' as const,
      position: [0, 0, 0] as [number, number, number],
      scale: [4.5, 4.5, 4.5] as [number, number, number], // Much larger room for portals and hologram
      rotation: [0, 0, 0] as [number, number, number],
      color: '#ffffff',
      modelPath: '/models/room/roomModel.glb',
      metalness: 0.1,
      roughness: 0.8
    }
  ],
  lights: [
    {
      type: 'directional' as const,
      position: [10, 20, 8] as [number, number, number],
      color: '#ffffff',  // Main directional light
      intensity: 1.0
    },
    {
      type: 'point' as const,
      position: [0, 5, 0] as [number, number, number],
      color: '#ffffff',  // Top center light
      intensity: 1.5
    }
  ]
}

async function main() {
  console.log('🔪 Updating murder crime scene with fixed 3D room...\\n')

  // Update the murder dilemma with scene data
  const updated = await prisma.dilemma.update({
    where: {
      id: 'cmh0murder001default'
    },
    data: {
      sceneData: JSON.stringify(murderRoomScene)
    }
  })

  console.log(`✅ Updated murder dilemma: ${updated.id}`)
  console.log(`   Title: ${updated.title}`)
  console.log(`   Scene objects: ${JSON.parse(updated.sceneData || '{}').objects?.length || 0}`)
  console.log('\\n📦 Scene uses single roomModel.glb with all furniture pre-placed')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
