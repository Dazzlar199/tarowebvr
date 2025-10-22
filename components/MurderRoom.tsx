"use client"

import { useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Murder Room - 3D Room with baked textures
 * Based on My-3D-Room by Houssem Lachtar
 */
export default function MurderRoom({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onDeskClick,
  onSofaClick
}: {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  onDeskClick?: () => void
  onSofaClick?: () => void
}) {
  const { scene } = useGLTF('/models/room/roomModel.glb')

  console.log('🏠 MurderRoom loading with scale:', scale)

  // Load baked night texture
  const bakedNightTexture = useTexture('/models/room/bakedNight.jpg')

  // Configure texture
  useMemo(() => {
    bakedNightTexture.flipY = false
    bakedNightTexture.colorSpace = THREE.SRGBColorSpace
    console.log('✅ Texture configured:', bakedNightTexture.image?.width + 'x' + bakedNightTexture.image?.height)
  }, [bakedNightTexture])

  // Clone scene and apply baked texture
  const roomScene = useMemo(() => {
    const clonedScene = scene.clone()

    let meshCount = 0
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshCount++
        // Apply baked texture as base material
        child.material = new THREE.MeshBasicMaterial({
          map: bakedNightTexture
        })
        child.castShadow = false
        child.receiveShadow = false

        // Make meshes clickable and identify objects
        const name = child.name.toLowerCase()
        console.log('🔍 Mesh name:', child.name)

        // Desk objects - trigger choice A
        if (name.includes('desk') || name.includes('table') || name.includes('bureau')) {
          child.userData.clickable = true
          child.userData.choice = 'A'
        }

        // Sofa objects - trigger choice B
        if (name.includes('sofa') || name.includes('couch') || name.includes('canape')) {
          child.userData.clickable = true
          child.userData.choice = 'B'
        }
      }
    })

    console.log(`✅ MurderRoom applied texture to ${meshCount} meshes`)

    return clonedScene
  }, [scene, bakedNightTexture])

  // Handle clicks on objects
  const handleClick = (event: any) => {
    event.stopPropagation()
    const clickedObject = event.object

    if (clickedObject.userData.clickable) {
      const choice = clickedObject.userData.choice
      console.log('🖱️ Clicked object:', clickedObject.name, 'Choice:', choice)

      if (choice === 'A' && onDeskClick) {
        onDeskClick()
      } else if (choice === 'B' && onSofaClick) {
        onSofaClick()
      }
    }
  }

  const handlePointerOver = (event: any) => {
    const hoveredObject = event.object
    if (hoveredObject.userData.clickable) {
      document.body.style.cursor = 'pointer'
    }
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'default'
  }

  return (
    <primitive
      object={roomScene}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  )
}

// Preload assets
useGLTF.preload('/models/room/roomModel.glb')
