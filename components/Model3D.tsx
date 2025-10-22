"use client"

import { useRef, useEffect, useMemo, memo } from 'react'
import * as THREE from 'three'
import { useLoader, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { OBJLoader } from 'three-stdlib'
import { MTLLoader } from 'three-stdlib'
import { FBXLoader } from 'three-stdlib'
import { optimizeModelTextures } from '@/lib/textureLoader'

interface Model3DProps {
  type: string
  modelPath?: string
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  color?: string
}

/**
 * 3D Model Loader Component
 * Loads GLTF/GLB models or fallback to improved primitives
 * Memoized for performance optimization
 */
const Model3D = memo(function Model3D({
  type,
  modelPath,
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color = '#ffffff'
}: Model3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Load 3D model (GLB, OBJ, or FBX) if modelPath is provided
  let loadedObj: THREE.Group | null = null
  let materials: any = null
  let gltfScene: THREE.Group | null = null

  if (modelPath) {
    const fileExtension = modelPath.toLowerCase().split('.').pop()
    console.log('🔧 Model3D loading:', modelPath, 'extension:', fileExtension)

    try {
      if (fileExtension === 'glb' || fileExtension === 'gltf') {
        // Load GLB/GLTF model using useGLTF hook
        const { scene } = useGLTF(modelPath)
        gltfScene = scene
        console.log('✅ GLB loaded, scene children:', scene.children.length)
      } else if (fileExtension === 'fbx') {
        // Load FBX model
        loadedObj = useLoader(FBXLoader, modelPath)
      } else if (fileExtension === 'obj') {
        // Get MTL path from OBJ path
        const mtlPath = modelPath.replace('.obj', '.mtl')

        // Load MTL first
        try {
          materials = useLoader(MTLLoader, mtlPath)
        } catch (mtlError) {
          console.warn('MTL file not found, using default materials:', mtlPath)
        }

        // Load OBJ with materials
        loadedObj = useLoader(OBJLoader, modelPath, (loader) => {
          if (materials) {
            materials.preload()
            loader.setMaterials(materials)
          }
        })
      } else {
        console.warn('Unsupported model format:', fileExtension)
      }
    } catch (error) {
      console.error('Failed to load model:', modelPath, error)
      loadedObj = null
      gltfScene = null
    }
  }

  // Apply quality optimizations to all models
  useEffect(() => {
    if (groupRef.current) {
      optimizeModelTextures(groupRef.current as unknown as THREE.Object3D)
    }
  }, [])

  // Memory cleanup: Dispose of geometries and materials on unmount
  useEffect(() => {
    return () => {
      const ref = groupRef.current || meshRef.current
      if (ref) {
        ref.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Dispose geometry
            if (child.geometry) {
              child.geometry.dispose()
            }
            // Dispose materials
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose())
              } else {
                child.material.dispose()
              }
            }
          }
        })
      }
    }
  }, [])

  // Windmill rotation animation
  const isWindmill = modelPath && (modelPath.toLowerCase().includes('windmill'))
  useFrame((state, delta) => {
    if (isWindmill && groupRef.current) {
      // Rotate windmill continuously around Y-axis
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  // If GLB/GLTF model was loaded, use it
  if (gltfScene) {
    console.log('📦 Rendering GLB scene')
    // Clone the loaded scene to avoid modifying the original
    const clonedScene = useMemo(() => gltfScene.clone(), [gltfScene])

    // Apply shadows to all meshes
    useEffect(() => {
      if (clonedScene) {
        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
      }
    }, [clonedScene])

    return (
      <primitive
        ref={groupRef}
        object={clonedScene}
        position={position}
        rotation={rotation}
        scale={scale}
      />
    )
  }

  // If OBJ/FBX model was loaded, use it
  if (loadedObj) {
    // Clone the loaded object to avoid modifying the original
    const clonedObj = useMemo(() => loadedObj.clone(), [loadedObj])

    // Apply color to all meshes in the OBJ
    useEffect(() => {
      if (clonedObj) {
        clonedObj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
            if (color && child.material) {
              // Apply color to material
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.color.set(color)
                  }
                })
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.color.set(color)
              }
            }
          }
        })
      }
    }, [clonedObj, color])

    return (
      <primitive
        ref={groupRef}
        object={clonedObj}
        position={position}
        rotation={rotation}
        scale={scale}
      />
    )
  }

  // Memoize geometry based on type to avoid re-creating on every render
  const geometry = useMemo(() => getFallbackGeometry(type), [type])

  // Check if this is a complex type with its own materials
  const isComplexType = useMemo(
    () => ['car', 'vehicle', 'person', 'pedestrian', 'building', 'tree', 'traffic_light'].includes(type),
    [type]
  )

  // For complex types, return the geometry group directly (they have their own materials)
  if (isComplexType) {
    return (
      <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
        {geometry}
      </group>
    )
  }

  // For simple primitives, wrap in mesh with material
  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      {geometry}
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  )
})

export default Model3D

/**
 * Get improved fallback geometry for each type
 */
function getFallbackGeometry(type: string) {
  switch (type) {
    case 'car':
    case 'vehicle':
      return <CarGeometry />

    case 'person':
    case 'pedestrian':
      return <PersonGeometry />

    case 'building':
      return <BuildingGeometry />

    case 'tree':
      return <TreeGeometry />

    case 'traffic_light':
      return <TrafficLightGeometry />

    case 'road':
      return <boxGeometry args={[1, 0.1, 1]} />

    case 'crosswalk':
      return <planeGeometry args={[1, 1]} />

    default:
      return <boxGeometry args={[1, 1, 1]} />
  }
}

/**
 * DETAILED Car Geometry - Realistic Vehicle Model
 */
function CarGeometry() {
  return (
    <group>
      {/* === MAIN BODY === */}

      {/* Lower body (chassis) */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.6, 0.5, 3.8]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Hood (front) */}
      <mesh position={[0, 0.55, 1.5]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.1, 1]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Trunk (back) */}
      <mesh position={[0, 0.55, -1.5]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.1, 1]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* === ROOF/CABIN === */}

      {/* Roof */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[1.5, 0.4, 2.2]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Windshield (front) */}
      <mesh position={[0, 0.8, 0.9]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.8, -0.9]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Side windows (left) */}
      <mesh position={[-0.76, 0.8, 0.4]}>
        <boxGeometry args={[0.05, 0.5, 0.8]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Side windows (right) */}
      <mesh position={[0.76, 0.8, 0.4]}>
        <boxGeometry args={[0.05, 0.5, 0.8]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* === WHEELS === */}

      {/* Front Left Wheel */}
      <group position={[-0.85, 0, 1.3]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.28, 16]} />
          <meshStandardMaterial color="#666666" metalness={0.9} />
        </mesh>
      </group>

      {/* Front Right Wheel */}
      <group position={[0.85, 0, 1.3]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.28, 16]} />
          <meshStandardMaterial color="#666666" metalness={0.9} />
        </mesh>
      </group>

      {/* Rear Left Wheel */}
      <group position={[-0.85, 0, -1.3]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.28, 16]} />
          <meshStandardMaterial color="#666666" metalness={0.9} />
        </mesh>
      </group>

      {/* Rear Right Wheel */}
      <group position={[0.85, 0, -1.3]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.28, 16]} />
          <meshStandardMaterial color="#666666" metalness={0.9} />
        </mesh>
      </group>

      {/* === LIGHTS === */}

      {/* Headlights (left) */}
      <mesh position={[-0.5, 0.4, 2.1]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffff99"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Headlights (right) */}
      <mesh position={[0.5, 0.4, 2.1]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffff99"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Taillights (left) */}
      <mesh position={[-0.5, 0.4, -2.05]}>
        <boxGeometry args={[0.3, 0.15, 0.08]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Taillights (right) */}
      <mesh position={[0.5, 0.4, -2.05]}>
        <boxGeometry args={[0.3, 0.15, 0.08]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* === DETAILS === */}

      {/* Front bumper */}
      <mesh position={[0, 0.1, 2.05]}>
        <boxGeometry args={[1.7, 0.15, 0.15]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Rear bumper */}
      <mesh position={[0, 0.1, -2.05]}>
        <boxGeometry args={[1.7, 0.15, 0.15]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Side mirrors (left) */}
      <mesh position={[-0.85, 0.75, 0.6]}>
        <boxGeometry args={[0.15, 0.12, 0.08]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
      </mesh>

      {/* Side mirrors (right) */}
      <mesh position={[0.85, 0.75, 0.6]}>
        <boxGeometry args={[0.15, 0.12, 0.08]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} />
      </mesh>

      {/* Door lines (left) */}
      <mesh position={[-0.81, 0.45, 0]}>
        <boxGeometry args={[0.02, 0.4, 1.8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Door lines (right) */}
      <mesh position={[0.81, 0.45, 0]}>
        <boxGeometry args={[0.02, 0.4, 1.8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Grille */}
      <mesh position={[0, 0.35, 2.08]}>
        <boxGeometry args={[1.2, 0.25, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
      </mesh>
    </group>
  )
}

/**
 * ENHANCED Person Geometry - More Realistic Humanoid Model
 */
function PersonGeometry() {
  return (
    <group>
      {/* === HEAD === */}

      {/* Head - more realistic oval shape */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <sphereGeometry args={[0.21, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial
          color="#3d2817"
          roughness={0.9}
        />
      </mesh>

      {/* Neck - smoother connection */}
      <mesh position={[0, 1.38, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.18, 12]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
        />
      </mesh>

      {/* === TORSO === */}

      {/* Shoulders - rounded */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.35, 8, 16]} />
        <meshStandardMaterial
          color="#3a6ea5"
          roughness={0.75}
        />
      </mesh>

      {/* Upper torso (chest) - capsule for rounder shape */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.45, 8, 16]} />
        <meshStandardMaterial
          color="#3a6ea5"
          roughness={0.75}
        />
      </mesh>

      {/* Lower torso (abdomen) - tapered */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.32, 8, 16]} />
        <meshStandardMaterial
          color="#3a6ea5"
          roughness={0.75}
        />
      </mesh>

      {/* Collar detail */}
      <mesh position={[0, 1.28, 0.05]}>
        <cylinderGeometry args={[0.11, 0.13, 0.08, 16]} />
        <meshStandardMaterial
          color="#2c5282"
          roughness={0.7}
        />
      </mesh>

      {/* === ARMS === */}

      {/* Left shoulder joint */}
      <mesh position={[-0.28, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshStandardMaterial
          color="#3a6ea5"
          roughness={0.75}
        />
      </mesh>

      {/* Left upper arm */}
      <mesh position={[-0.34, 0.88, 0]} rotation={[0, 0, 0.12]} castShadow>
        <capsuleGeometry args={[0.09, 0.38, 8, 14]} />
        <meshStandardMaterial
          color="#3a6ea5"
          roughness={0.75}
        />
      </mesh>

      {/* Left elbow */}
      <mesh position={[-0.4, 0.62, 0]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
        />
      </mesh>

      {/* Left forearm */}
      <mesh position={[-0.44, 0.38, 0]} rotation={[0, 0, 0.08]} castShadow>
        <capsuleGeometry args={[0.075, 0.35, 8, 14]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
        />
      </mesh>

      {/* Left hand - improved palm */}
      <mesh position={[-0.48, 0.16, 0]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.06]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
        />
      </mesh>

      {/* Left fingers - simple but visible */}
      <mesh position={[-0.48, 0.08, 0]} castShadow>
        <boxGeometry args={[0.07, 0.06, 0.04]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
        />
      </mesh>

      {/* Right shoulder joint */}
      <mesh position={[0.28, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshStandardMaterial
          color="#3a6ea5"
          roughness={0.75}
        />
      </mesh>

      {/* Right upper arm */}
      <mesh position={[0.34, 0.88, 0]} rotation={[0, 0, -0.12]} castShadow>
        <capsuleGeometry args={[0.09, 0.38, 8, 14]} />
        <meshStandardMaterial
          color="#3a6ea5"
          roughness={0.75}
        />
      </mesh>

      {/* Right elbow */}
      <mesh position={[0.4, 0.62, 0]} castShadow>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
        />
      </mesh>

      {/* Right forearm */}
      <mesh position={[0.44, 0.38, 0]} rotation={[0, 0, -0.08]} castShadow>
        <capsuleGeometry args={[0.075, 0.35, 8, 14]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
        />
      </mesh>

      {/* Right hand - improved palm */}
      <mesh position={[0.48, 0.16, 0]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.06]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
        />
      </mesh>

      {/* Right fingers */}
      <mesh position={[0.48, 0.08, 0]} castShadow>
        <boxGeometry args={[0.07, 0.06, 0.04]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
        />
      </mesh>

      {/* === LEGS === */}

      {/* Hip joint - left */}
      <mesh position={[-0.12, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial
          color="#2c5282"
          roughness={0.8}
        />
      </mesh>

      {/* Left upper leg (thigh) - improved shape */}
      <mesh position={[-0.12, 0.16, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.42, 8, 14]} />
        <meshStandardMaterial
          color="#2c5282"
          roughness={0.8}
        />
      </mesh>

      {/* Left knee */}
      <mesh position={[-0.12, -0.08, 0]} castShadow>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial
          color="#2c5282"
          roughness={0.8}
        />
      </mesh>

      {/* Left lower leg (shin) */}
      <mesh position={[-0.12, -0.32, 0]} castShadow>
        <capsuleGeometry args={[0.085, 0.42, 8, 14]} />
        <meshStandardMaterial
          color="#2c5282"
          roughness={0.8}
        />
      </mesh>

      {/* Left ankle */}
      <mesh position={[-0.12, -0.56, 0]} castShadow>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.9}
        />
      </mesh>

      {/* Left foot - more realistic shoe */}
      <mesh position={[-0.12, -0.62, 0.1]} castShadow>
        <boxGeometry args={[0.13, 0.1, 0.26]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.85}
        />
      </mesh>

      {/* Left shoe sole */}
      <mesh position={[-0.12, -0.67, 0.1]} castShadow>
        <boxGeometry args={[0.14, 0.03, 0.28]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.95}
        />
      </mesh>

      {/* Hip joint - right */}
      <mesh position={[0.12, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial
          color="#2c5282"
          roughness={0.8}
        />
      </mesh>

      {/* Right upper leg (thigh) */}
      <mesh position={[0.12, 0.16, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.42, 8, 14]} />
        <meshStandardMaterial
          color="#2c5282"
          roughness={0.8}
        />
      </mesh>

      {/* Right knee */}
      <mesh position={[0.12, -0.08, 0]} castShadow>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial
          color="#2c5282"
          roughness={0.8}
        />
      </mesh>

      {/* Right lower leg (shin) */}
      <mesh position={[0.12, -0.32, 0]} castShadow>
        <capsuleGeometry args={[0.085, 0.42, 8, 14]} />
        <meshStandardMaterial
          color="#2c5282"
          roughness={0.8}
        />
      </mesh>

      {/* Right ankle */}
      <mesh position={[0.12, -0.56, 0]} castShadow>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.9}
        />
      </mesh>

      {/* Right foot - more realistic shoe */}
      <mesh position={[0.12, -0.62, 0.1]} castShadow>
        <boxGeometry args={[0.13, 0.1, 0.26]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.85}
        />
      </mesh>

      {/* Right shoe sole */}
      <mesh position={[0.12, -0.67, 0.1]} castShadow>
        <boxGeometry args={[0.14, 0.03, 0.28]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.95}
        />
      </mesh>

      {/* === FACIAL FEATURES === */}

      {/* Eyes (left) - more prominent */}
      <mesh position={[-0.09, 1.65, 0.17]}>
        <sphereGeometry args={[0.025, 10, 10]} />
        <meshStandardMaterial
          color="#000000"
        />
      </mesh>

      {/* Eyes (right) */}
      <mesh position={[0.09, 1.65, 0.17]}>
        <sphereGeometry args={[0.025, 10, 10]} />
        <meshStandardMaterial
          color="#000000"
        />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 1.6, 0.19]}>
        <coneGeometry args={[0.025, 0.08, 8]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.85}
        />
      </mesh>

      {/* Mouth line */}
      <mesh position={[0, 1.52, 0.18]}>
        <capsuleGeometry args={[0.01, 0.08, 4, 8]} />
        <meshStandardMaterial
          color="#cc9966"
          roughness={0.9}
        />
      </mesh>

      {/* === CLOTHING DETAILS === */}

      {/* Belt - more detailed */}
      <mesh position={[0, 0.43, 0]}>
        <cylinderGeometry args={[0.215, 0.215, 0.06, 20]} />
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>

      {/* Belt buckle */}
      <mesh position={[0, 0.43, 0.215]}>
        <boxGeometry args={[0.06, 0.04, 0.02]} />
        <meshStandardMaterial
          color="#888888"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Shirt buttons */}
      <mesh position={[0, 1.1, 0.225]}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
        <meshStandardMaterial
          color="#2c5282"
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      <mesh position={[0, 0.9, 0.225]}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
        <meshStandardMaterial
          color="#2c5282"
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      <mesh position={[0, 0.7, 0.225]}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
        <meshStandardMaterial
          color="#2c5282"
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
    </group>
  )
}

/**
 * DETAILED Building Geometry - Realistic Modern Office Building
 */
function BuildingGeometry() {
  return (
    <group>
      {/* === MAIN STRUCTURE === */}

      {/* Main building body */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 5, 3]} />
        <meshStandardMaterial
          color="#c0c0c0"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* === WINDOWS - FRONT FACE === */}

      {/* Floor 1 windows */}
      <mesh position={[0, 0.8, 1.52]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Floor 2 windows */}
      <mesh position={[0, 1.8, 1.52]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Floor 3 windows */}
      <mesh position={[0, 2.8, 1.52]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Floor 4 windows */}
      <mesh position={[0, 3.8, 1.52]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Floor 5 windows */}
      <mesh position={[0, 4.8, 1.52]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* === WINDOWS - BACK FACE === */}

      <mesh position={[0, 0.8, -1.52]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[0, 1.8, -1.52]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[0, 2.8, -1.52]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[0, 3.8, -1.52]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[0, 4.8, -1.52]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* === WINDOWS - LEFT SIDE === */}

      <mesh position={[-1.52, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[-1.52, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[-1.52, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[-1.52, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* === WINDOWS - RIGHT SIDE === */}

      <mesh position={[1.52, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[1.52, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[1.52, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[1.52, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* === ENTRANCE === */}

      {/* Entrance door */}
      <mesh position={[0, 0.35, 1.55]}>
        <boxGeometry args={[0.6, 0.7, 0.08]} />
        <meshStandardMaterial
          color="#333333"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.2, 0.35, 1.6]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* === ROOF === */}

      {/* Roof slab */}
      <mesh position={[0, 5.15, 0]} castShadow>
        <boxGeometry args={[3.2, 0.3, 3.2]} />
        <meshStandardMaterial
          color="#888888"
          roughness={0.8}
        />
      </mesh>

      {/* Roof edge (front) */}
      <mesh position={[0, 5.05, 1.65]}>
        <boxGeometry args={[3.4, 0.1, 0.1]} />
        <meshStandardMaterial
          color="#666666"
        />
      </mesh>

      {/* Roof edge (back) */}
      <mesh position={[0, 5.05, -1.65]}>
        <boxGeometry args={[3.4, 0.1, 0.1]} />
        <meshStandardMaterial
          color="#666666"
        />
      </mesh>

      {/* === BUILDING BASE === */}

      {/* Ground floor base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[3.3, 0.2, 3.3]} />
        <meshStandardMaterial
          color="#707070"
          roughness={0.9}
        />
      </mesh>

      {/* === DETAILS === */}

      {/* Window dividers - vertical lines (front face) */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={`divider-front-${i}`} position={[x, 2.5, 1.53]}>
          <boxGeometry args={[0.05, 4.5, 0.02]} />
          <meshStandardMaterial color="#909090" />
        </mesh>
      ))}

      {/* AC units on roof */}
      <mesh position={[-0.8, 5.4, 0.8]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.5]} />
        <meshStandardMaterial
          color="#555555"
          metalness={0.5}
        />
      </mesh>

      <mesh position={[0.8, 5.4, 0.8]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.5]} />
        <meshStandardMaterial
          color="#555555"
          metalness={0.5}
        />
      </mesh>

      {/* Company sign on front */}
      <mesh position={[0, 4.3, 1.54]}>
        <boxGeometry args={[1.2, 0.25, 0.05]} />
        <meshStandardMaterial
          color="#1a1a1a"
          emissive="#888888"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

/**
 * DETAILED Tree Geometry - Realistic Natural Tree
 */
function TreeGeometry() {
  return (
    <group>
      {/* === TRUNK === */}

      {/* Main trunk - bottom */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 1.6, 12]} />
        <meshStandardMaterial
          color="#5d4037"
          roughness={0.9}
        />
      </mesh>

      {/* Trunk - middle section */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.8, 12]} />
        <meshStandardMaterial
          color="#5d4037"
          roughness={0.9}
        />
      </mesh>

      {/* Trunk - upper section */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.6, 12]} />
        <meshStandardMaterial
          color="#6d4c41"
          roughness={0.9}
        />
      </mesh>

      {/* === BRANCHES === */}

      {/* Main branch - left lower */}
      <mesh position={[-0.35, 1.9, 0]} rotation={[0, 0, 0.6]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
        <meshStandardMaterial
          color="#6d4c41"
          roughness={0.9}
        />
      </mesh>

      {/* Main branch - right lower */}
      <mesh position={[0.35, 1.9, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
        <meshStandardMaterial
          color="#6d4c41"
          roughness={0.9}
        />
      </mesh>

      {/* Main branch - front */}
      <mesh position={[0, 2.1, 0.3]} rotation={[0.6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
        <meshStandardMaterial
          color="#6d4c41"
          roughness={0.9}
        />
      </mesh>

      {/* Main branch - back */}
      <mesh position={[0, 2.1, -0.3]} rotation={[-0.6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
        <meshStandardMaterial
          color="#6d4c41"
          roughness={0.9}
        />
      </mesh>

      {/* === FOLIAGE - LAYERED CANOPY === */}

      {/* Lower canopy layer - largest */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshStandardMaterial
          color="#2e7d32"
          roughness={0.85}
        />
      </mesh>

      {/* Mid-lower canopy */}
      <mesh position={[-0.4, 2.7, 0.3]} castShadow>
        <sphereGeometry args={[0.6, 10, 10]} />
        <meshStandardMaterial
          color="#388e3c"
          roughness={0.85}
        />
      </mesh>

      <mesh position={[0.4, 2.7, -0.3]} castShadow>
        <sphereGeometry args={[0.6, 10, 10]} />
        <meshStandardMaterial
          color="#388e3c"
          roughness={0.85}
        />
      </mesh>

      {/* Mid-upper canopy */}
      <mesh position={[0, 3.0, 0]} castShadow>
        <sphereGeometry args={[0.7, 11, 11]} />
        <meshStandardMaterial
          color="#43a047"
          roughness={0.85}
        />
      </mesh>

      <mesh position={[-0.3, 3.1, -0.2]} castShadow>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial
          color="#43a047"
          roughness={0.85}
        />
      </mesh>

      <mesh position={[0.3, 3.1, 0.2]} castShadow>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial
          color="#43a047"
          roughness={0.85}
        />
      </mesh>

      {/* Upper canopy */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <sphereGeometry args={[0.6, 10, 10]} />
        <meshStandardMaterial
          color="#4caf50"
          roughness={0.85}
        />
      </mesh>

      <mesh position={[-0.2, 3.5, 0.15]} castShadow>
        <sphereGeometry args={[0.4, 9, 9]} />
        <meshStandardMaterial
          color="#66bb6a"
          roughness={0.85}
        />
      </mesh>

      <mesh position={[0.2, 3.5, -0.15]} castShadow>
        <sphereGeometry args={[0.4, 9, 9]} />
        <meshStandardMaterial
          color="#66bb6a"
          roughness={0.85}
        />
      </mesh>

      {/* Top canopy - crown */}
      <mesh position={[0, 3.7, 0]} castShadow>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial
          color="#66bb6a"
          roughness={0.85}
        />
      </mesh>

      {/* === ROOTS (visible at base) === */}

      {/* Root 1 */}
      <mesh position={[-0.22, 0.05, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.08, 0.12, 0.15, 8]} />
        <meshStandardMaterial
          color="#4e342e"
          roughness={0.95}
        />
      </mesh>

      {/* Root 2 */}
      <mesh position={[0.22, 0.05, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.08, 0.12, 0.15, 8]} />
        <meshStandardMaterial
          color="#4e342e"
          roughness={0.95}
        />
      </mesh>

      {/* Root 3 */}
      <mesh position={[0, 0.05, 0.22]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.15, 8]} />
        <meshStandardMaterial
          color="#4e342e"
          roughness={0.95}
        />
      </mesh>

      {/* Root 4 */}
      <mesh position={[0, 0.05, -0.22]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.15, 8]} />
        <meshStandardMaterial
          color="#4e342e"
          roughness={0.95}
        />
      </mesh>
    </group>
  )
}

/**
 * DETAILED Traffic Light Geometry - Realistic Traffic Signal
 */
function TrafficLightGeometry() {
  return (
    <group>
      {/* === POLE STRUCTURE === */}

      {/* Base plate */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 16]} />
        <meshStandardMaterial
          color="#2a2a2a"
          roughness={0.8}
        />
      </mesh>

      {/* Main pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 4, 16]} />
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Pole cap */}
      <mesh position={[0, 4.1, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.15, 16]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.7}
        />
      </mesh>

      {/* === HORIZONTAL ARM === */}

      {/* Arm connecting to signal box */}
      <mesh position={[0.4, 3.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 12]} />
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* === SIGNAL BOX === */}

      {/* Main signal housing - black box */}
      <mesh position={[0.85, 3.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 1.2, 0.35]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Back panel */}
      <mesh position={[0.7, 3.8, 0]}>
        <boxGeometry args={[0.02, 1.25, 0.38]} />
        <meshStandardMaterial
          color="#0a0a0a"
        />
      </mesh>

      {/* === LIGHTS === */}

      {/* RED light (top) */}
      <mesh position={[1.02, 4.2, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.6}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* Red light glass cover */}
      <mesh position={[1.06, 4.2, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.03, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* YELLOW light (middle) */}
      <mesh position={[1.02, 3.8, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ffaa00"
          emissiveIntensity={0.3}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* Yellow light glass cover */}
      <mesh position={[1.06, 3.8, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.03, 16]} />
        <meshStandardMaterial
          color="#ffaa00"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* GREEN light (bottom) - Changed to BLUE for grayscale compatibility */}
      <mesh position={[1.02, 3.4, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial
          color="#4488ff"
          emissive="#4488ff"
          emissiveIntensity={0.2}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* Blue light glass cover */}
      <mesh position={[1.06, 3.4, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.03, 16]} />
        <meshStandardMaterial
          color="#4488ff"
          transparent
          opacity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* === HOOD/VISOR === */}

      {/* Hood above red light */}
      <mesh position={[1.0, 4.35, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.35, 0.08, 0.38]} />
        <meshStandardMaterial
          color="#0a0a0a"
        />
      </mesh>

      {/* === DETAILS === */}

      {/* Side mounting bracket (left) */}
      <mesh position={[0.85, 4.45, -0.2]}>
        <boxGeometry args={[0.3, 0.05, 0.05]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.7}
        />
      </mesh>

      {/* Side mounting bracket (right) */}
      <mesh position={[0.85, 4.45, 0.2]}>
        <boxGeometry args={[0.3, 0.05, 0.05]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.7}
        />
      </mesh>

      {/* Cable conduit */}
      <mesh position={[0.45, 3.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <meshStandardMaterial
          color="#1a1a1a"
        />
      </mesh>

      {/* Warning stripes on pole (yellow/black) */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.15, 16]} />
        <meshStandardMaterial
          color="#ffff00"
          roughness={0.6}
        />
      </mesh>

      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.15, 16]} />
        <meshStandardMaterial
          color="#ffff00"
          roughness={0.6}
        />
      </mesh>

      {/* === POINT LIGHTS FOR ILLUMINATION === */}

      {/* Red light emission */}
      <pointLight
        position={[1.2, 4.2, 0]}
        color="#ff0000"
        intensity={1.5}
        distance={4}
      />

      {/* Yellow light emission (dimmer) */}
      <pointLight
        position={[1.2, 3.8, 0]}
        color="#ffaa00"
        intensity={0.8}
        distance={3}
      />

      {/* Blue light emission (dimmest) */}
      <pointLight
        position={[1.2, 3.4, 0]}
        color="#4488ff"
        intensity={0.5}
        distance={3}
      />
    </group>
  )
}

// Note: Preloading disabled until actual .glb files are added to public/models/
// When you add real model files, uncomment these lines:
// useGLTF.preload('/models/vehicles/car.glb')
// useGLTF.preload('/models/characters/person.glb')
// useGLTF.preload('/models/buildings/building.glb')
// useGLTF.preload('/models/props/tree.glb')
// useGLTF.preload('/models/props/traffic_light.glb')
