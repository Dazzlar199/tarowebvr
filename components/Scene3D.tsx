"use client"

import { useMemo, useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Scene3D, SceneObject } from '@/lib/ai/scene-generator'

interface Scene3DProps {
  sceneData: Scene3D
}

/**
 * Animated Point Light with pulsing effect
 */
const AnimatedPointLight = memo(function AnimatedPointLight({
  position,
  color,
  baseIntensity
}: {
  position: [number, number, number]
  color: string
  baseIntensity: number
}) {
  const lightRef = useRef<THREE.PointLight>(null)

  // Pulsing animation using sine wave
  useFrame((state) => {
    if (lightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 1 // Range: 0.7 to 1.3
      lightRef.current.intensity = baseIntensity * pulse
    }
  })

  return (
    <pointLight
      ref={lightRef}
      position={position}
      color={color}
      intensity={baseIntensity}
      distance={50}
      decay={2}
    />
  )
})

/**
 * Renders a 3D scene object based on its type
 */
const SceneObjectMesh = memo(function SceneObjectMesh({ obj }: { obj: SceneObject }) {
  // Special case: Tree (group of meshes)
  if (obj.type === 'tree') {
    return (
      <group
        position={obj.position as [number, number, number]}
        rotation={obj.rotation as [number, number, number]}
      >
        <mesh position={[0, obj.scale[1] / 4, 0]}>
          <cylinderGeometry args={[obj.scale[0] / 4, obj.scale[0] / 4, obj.scale[1] / 2, 8]} />
          <meshStandardMaterial color="#2d1f00" />
        </mesh>
        <mesh position={[0, obj.scale[1] * 0.75, 0]}>
          <coneGeometry args={[obj.scale[0], obj.scale[1], 8]} />
          <meshStandardMaterial
            color={obj.color}
            emissive={obj.emissive || '#000000'}
            emissiveIntensity={obj.emissiveIntensity || 0}
          />
        </mesh>
      </group>
    )
  }

  // Regular single mesh objects
  return (
    <mesh
      position={obj.position as [number, number, number]}
      rotation={obj.rotation as [number, number, number]}
    >
      {obj.type === 'box' && <boxGeometry args={obj.scale as [number, number, number]} />}
      {obj.type === 'sphere' && <sphereGeometry args={[obj.scale[0], 32, 32]} />}
      {obj.type === 'cylinder' && <cylinderGeometry args={[obj.scale[0], obj.scale[0], obj.scale[1], 32]} />}
      {obj.type === 'cone' && <coneGeometry args={[obj.scale[0], obj.scale[1], 32]} />}
      {obj.type === 'torus' && <torusGeometry args={[obj.scale[0], obj.scale[1] / 4, 16, 100]} />}
      {obj.type === 'plane' && <planeGeometry args={[obj.scale[0], obj.scale[1]]} />}
      {obj.type === 'building' && <boxGeometry args={obj.scale as [number, number, number]} />}
      {obj.type === 'rock' && <dodecahedronGeometry args={[obj.scale[0], 1]} />}

      <meshStandardMaterial
        color={obj.color}
        emissive={obj.emissive || '#000000'}
        emissiveIntensity={obj.emissiveIntensity || 0}
        metalness={obj.metalness || 0.5}
        roughness={obj.roughness || 0.5}
      />
    </mesh>
  )
})

/**
 * Main 3D scene component
 */
export default function Scene3DRenderer({ sceneData }: Scene3DProps) {
  return (
    <>
      {/* Sky */}
      <color attach="background" args={[sceneData.skyColor]} />

      {/* Fog */}
      <fog attach="fog" args={[sceneData.fogColor, 1, 100 / sceneData.fogDensity]} />

      {/* Ambient Light */}
      <ambientLight
        color={sceneData.ambientLightColor}
        intensity={sceneData.ambientLightIntensity}
      />

      {/* Scene Lights */}
      {sceneData.lights.map((light, index) => {
        switch (light.type) {
          case 'point':
            return (
              <AnimatedPointLight
                key={`light-${index}`}
                position={light.position as [number, number, number]}
                color={light.color}
                baseIntensity={light.intensity}
              />
            )
          case 'directional':
            return (
              <directionalLight
                key={`light-${index}`}
                position={light.position as [number, number, number]}
                color={light.color}
                intensity={light.intensity}
              />
            )
          case 'spot':
            return (
              <spotLight
                key={`light-${index}`}
                position={light.position as [number, number, number]}
                color={light.color}
                intensity={light.intensity}
                angle={Math.PI / 6}
                penumbra={0.5}
              />
            )
          default:
            return null
        }
      })}

      {/* Scene Objects */}
      {sceneData.objects.map((obj, index) => (
        <SceneObjectMesh key={`object-${index}`} obj={obj} />
      ))}
    </>
  )
}
