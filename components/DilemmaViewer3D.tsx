"use client"

import React, { Suspense, useRef, useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Html, Environment, Sphere, Cylinder } from '@react-three/drei'
import { XR, createXRStore, useXR, useXREvent } from '@react-three/xr'
import { EffectComposer, Bloom, SSAO, N8AO, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import Model3D from './Model3D'

const xrStore = createXRStore()

interface SceneObject {
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'tree' | 'building' | 'rock' |
        'car' | 'road' | 'crosswalk' | 'traffic_light' | 'hospital' | 'person' | 'table' | 'chair' |
        'computer' | 'door' | 'window' | 'wall' | 'fence' | 'bench' | 'lamp_post' | 'sign'
  position: [number, number, number]
  scale: [number, number, number]
  rotation: [number, number, number]
  color: string
  modelPath?: string // OBJ file path
  emissive?: string
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
}

interface Scene3D {
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

interface DilemmaViewer3DProps {
  dilemma: {
    id: string
    title: string
    description: string
    optionA: string
    optionB: string
    situation?: string
    sceneData?: string
    category?: string
  }
  onChoice: (choice: 'A' | 'B', isVR?: boolean) => void
}

/**
 * Portal component - represents a choice
 * Memoized to prevent unnecessary re-renders
 * ENHANCED: Elevated and more visible
 */
const PortalInner = React.forwardRef<THREE.Group, {
  position: [number, number, number]
  color: string
  label: string
  emissiveIntensity?: number
  hovered?: boolean
  selected?: boolean
}>(({ position, color, label, emissiveIntensity = 0.8, hovered = false, selected = false }, ref) => {
  // Memoize static geometries
  const circleGeometry = useMemo(() => [4, 32] as [number, number], [])
  const ringGeometry = useMemo(() => [3.5, 4, 32] as [number, number, number], [])
  const meshRotation = useMemo(() => [-Math.PI / 2, 0, 0] as [number, number, number], [])
  const pillarsRotation = useMemo(() => [0, 0, 0] as [number, number, number], [])

  // Particle effect state
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 50
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      // Random position in a cylinder around the portal
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 2
      const height = Math.random() * 6

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = height
      positions[i * 3 + 2] = Math.sin(angle) * radius

      // Random velocity (upward + circular motion)
      velocities[i * 3] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 1] = Math.random() * 0.03 + 0.01
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    }

    return { positions, velocities }
  }, [])

  // Animate particles
  useFrame(() => {
    if (!particlesRef.current || (!hovered && !selected)) return

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < particleCount; i++) {
      // Update position
      positions[i * 3] += particles.velocities[i * 3]
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1]
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2]

      // Reset if particle goes too high or too far
      if (positions[i * 3 + 1] > 7) {
        const angle = Math.random() * Math.PI * 2
        const radius = 2 + Math.random() * 2
        positions[i * 3] = Math.cos(angle) * radius
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = Math.sin(angle) * radius
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  // Brighter color when hovered or selected
  const effectiveColor = (hovered || selected) ? '#ffffff' : color

  return (
    <group ref={ref} position={position}>
      {/* Elevated circular platform */}
      <mesh position={[0, 0.5, 0]} rotation={meshRotation}>
        <circleGeometry args={circleGeometry} />
        <meshStandardMaterial
          color={effectiveColor}
          metalness={0.1}
          roughness={0.9}
          emissive={hovered ? effectiveColor : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Outer ring */}
      <mesh position={[0, 0.55, 0]} rotation={meshRotation}>
        <ringGeometry args={ringGeometry} />
        <meshStandardMaterial
          color={effectiveColor}
          metalness={0.1}
          roughness={0.9}
          emissive={hovered ? effectiveColor : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Vertical pillar - LEFT */}
      <mesh position={[-3, 3, 0]} rotation={pillarsRotation}>
        <cylinderGeometry args={[0.15, 0.15, 6, 8]} />
        <meshStandardMaterial
          color={effectiveColor}
          metalness={0.1}
          roughness={0.9}
          emissive={hovered ? effectiveColor : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Vertical pillar - RIGHT */}
      <mesh position={[3, 3, 0]} rotation={pillarsRotation}>
        <cylinderGeometry args={[0.15, 0.15, 6, 8]} />
        <meshStandardMaterial
          color={effectiveColor}
          metalness={0.1}
          roughness={0.9}
          emissive={hovered ? effectiveColor : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Top horizontal beam */}
      <mesh position={[0, 6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 6, 8]} />
        <meshStandardMaterial
          color={effectiveColor}
          metalness={0.1}
          roughness={0.9}
          emissive={hovered ? effectiveColor : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Hover glow */}
      {hovered && (
        <pointLight position={[0, 3, 0]} color={effectiveColor} intensity={3} distance={10} />
      )}

      {/* Particle effect when hovered or selected */}
      {(hovered || selected) && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={particles.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color={effectiveColor}
            transparent
            opacity={0.6}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Pulsing rings when selected */}
      {selected && (
        <>
          <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3, 3.2, 32]} />
            <meshStandardMaterial
              color={effectiveColor}
              emissive={effectiveColor}
              emissiveIntensity={1.0}
              transparent
              opacity={0.7}
            />
          </mesh>
          <mesh position={[0, 3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 2.7, 32]} />
            <meshStandardMaterial
              color={effectiveColor}
              emissive={effectiveColor}
              emissiveIntensity={0.8}
              transparent
              opacity={0.5}
            />
          </mesh>
        </>
      )}

      {/* Label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.8}
        color={hovered ? '#ffffff' : '#dddddd'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.08}
        outlineColor="#000000"
        fontWeight="bold"
      >
        {label}
      </Text>
    </group>
  )
})

// Memoize the Portal component for performance
const Portal = memo(PortalInner)

/**
 * Dynamic 3D Scene Object - Using Model3D Component
 * Memoized to prevent unnecessary re-renders
 */
const SceneObjectMesh = memo(({ obj }: { obj: SceneObject }) => {
  // Memoize geometry selection
  const geometry = useMemo(() => {
    switch (obj.type) {
      case 'box':
        return <boxGeometry args={obj.scale} />
      case 'sphere':
        return <sphereGeometry args={[obj.scale[0], 32, 32]} />
      case 'road':
      case 'crosswalk':
      case 'plane':
        return <planeGeometry args={[obj.scale[0], obj.scale[1]]} />
      default:
        return null
    }
  }, [obj.type, obj.scale])

  // For simple primitives like road/crosswalk, use basic mesh
  if (['road', 'crosswalk', 'plane', 'box', 'sphere'].includes(obj.type)) {
    return (
      <mesh
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        receiveShadow
        castShadow
      >
        {geometry}
        <meshStandardMaterial
          color={obj.color}
          metalness={obj.metalness || 0.1}
          roughness={obj.roughness || 0.9}
        />
      </mesh>
    )
  }

  // Use Model3D for complex objects (car, person, building, etc.)
  return (
    <Model3D
      type={obj.type}
      modelPath={obj.modelPath}
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
      color={obj.color}
    />
  )
})

/**
 * Scene Image Component - loads texture dynamically
 */
const SceneImage = memo(({ url, position = [0, 6, -6], size = [18, 11] }: {
  url: string
  position?: [number, number, number]
  size?: [number, number]
}) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace
        setTexture(loadedTexture)
      },
      undefined,
      (error) => {
        console.error('Failed to load scene image:', error)
      }
    )
  }, [url])

  if (!texture) return null

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={texture}
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  )
})

/**
 * Central info display - ENHANCED VISIBILITY
 * Memoized to prevent unnecessary re-renders
 */
const DilemmaHologram = memo(({ dilemma, sceneImageUrl }: {
  dilemma: DilemmaViewer3DProps['dilemma']
  sceneImageUrl?: string
}) => {
  const textPanelGeometry = useMemo(() => [8, 4] as [number, number], [])
  const imagePanelGeometry = useMemo(() => [20, 12] as [number, number], [])
  const groupPosition = useMemo(() => [0, 0, 0] as [number, number, number], [])
  const imagePosition = useMemo(() => [0, 12, 0] as [number, number, number], []) // z=-10에서 z=0으로 변경
  const textPosition = useMemo(() => [0, 1.5, 0.1] as [number, number, number], []) // y: -2 → 1.5로 상승

  return (
    <group position={groupPosition}>
      {/* Background Image Panel - TOP & LARGE */}
      <mesh position={imagePosition}>
        <planeGeometry args={imagePanelGeometry} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.15}
          roughness={0.85}
        />
      </mesh>

      {/* Scene Image - if available - POSITIONED ABOVE */}
      {sceneImageUrl && <SceneImage url={sceneImageUrl} position={imagePosition} size={[18, 11]} />}

      {/* Text Panel - BOTTOM, SEPARATED */}
      <mesh position={textPosition}>
        <planeGeometry args={textPanelGeometry} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Subtle border */}
      <mesh position={[textPosition[0], textPosition[1], textPosition[2] - 0.01]}>
        <planeGeometry args={[8.05, 4.05]} />
        <meshStandardMaterial
          color="#555555"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Title - MUCH LARGER */}
      <Text
        position={[textPosition[0], textPosition[1] + 1.2, textPosition[2] + 0.1]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={7.5}
        textAlign="center"
        outlineWidth={0.06}
        outlineColor="#000000"
        fontWeight="bold"
        letterSpacing={0.03}
      >
        {dilemma.title}
      </Text>

      {/* Description - MUCH LARGER */}
      <Text
        position={[textPosition[0], textPosition[1] - 0.3, textPosition[2] + 0.1]}
        fontSize={0.4}
        color="#dddddd"
        anchorX="center"
        anchorY="middle"
        maxWidth={7.5}
        textAlign="center"
        lineHeight={1.5}
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {dilemma.description}
      </Text>

      {/* Category badge - SUBTLE */}
      <Text
        position={[textPosition[0], textPosition[1] - 1.4, textPosition[2] + 0.1]}
        fontSize={0.16}
        color="#999999"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
        letterSpacing={0.05}
      >
        {dilemma.category || 'MORAL DILEMMA'}
      </Text>
    </group>
  )
})

/**
 * Floor grid - IMPROVED VISUAL QUALITY
 * Memoized to prevent unnecessary re-renders
 */
const Floor = memo(({ groundColor = "#3a3a3a" }: { groundColor?: string }) => {
  const rotation = useMemo(() => [-Math.PI / 2, 0, 0] as [number, number, number], [])
  const planeArgs = useMemo(() => [100, 100] as [number, number], [])

  return (
    <mesh rotation={rotation} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={planeArgs} />
      <meshStandardMaterial
        color={groundColor}
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>
  )
})

/**
 * Grid lines on floor - ENHANCED
 * Memoized to prevent unnecessary re-renders
 */
const GridLines = memo(() => {
  const gridArgs = useMemo(() => [100, 100, '#555555', '#2a2a2a'] as [number, number, string, string], [])
  const position = useMemo(() => [0, 0.01, 0] as [number, number, number], [])

  return (
    <gridHelper
      args={gridArgs}
      position={position}
    />
  )
})

/**
 * VR Controller Detector - simple VR interaction
 */
function VRControllerDetector({
  portalARef,
  portalBRef,
  onChoice,
  selectedChoice,
  onHoverChange
}: {
  portalARef: React.RefObject<THREE.Group>
  portalBRef: React.RefObject<THREE.Group>
  onChoice: (choice: 'A' | 'B') => void
  selectedChoice: 'A' | 'B' | null
  onHoverChange: (portal: 'A' | 'B' | null) => void
}) {
  const [hasChosen, setHasChosen] = useState(false)
  const { session } = useXR()

  // Listen for select button press
  useXREvent('select', (event: any) => {
    if (hasChosen || selectedChoice) return

    // Check which portal is closer to the controller
    const source = event.inputSource
    if (!source || !source.gamepad) return

    // Get controller pose from event
    const frame = event.frame
    if (!frame) return

    const pose = frame.getPose(source.targetRaySpace, event.frame.session.referenceSpace)
    if (!pose) return

    const controllerPos = new THREE.Vector3(
      pose.transform.position.x,
      pose.transform.position.y,
      pose.transform.position.z
    )

    // Check distance to portals
    const portalAPos = new THREE.Vector3(-10, 2, 0)
    const portalBPos = new THREE.Vector3(10, 2, 0)

    const distToA = controllerPos.distanceTo(portalAPos)
    const distToB = controllerPos.distanceTo(portalBPos)

    if (distToA < 5) {
      setHasChosen(true)
      onChoice('A')
    } else if (distToB < 5) {
      setHasChosen(true)
      onChoice('B')
    }
  })

  return null
}

/**
 * VR Position Detector - detects when user is near a portal (walking-based)
 */
function VRPositionDetector({
  onChoice
}: {
  onChoice: (choice: 'A' | 'B') => void
}) {
  const [hasChosen, setHasChosen] = useState(false)
  const detectionDistance = 3 // Distance threshold for portal activation

  useFrame((state) => {
    if (hasChosen) return

    const camera = state.camera
    const cameraPosition = camera.position

    // Check distance to Portal A (left portal at [-10, 0, 0])
    const distanceToA = Math.sqrt(
      Math.pow(cameraPosition.x - (-10), 2) +
      Math.pow(cameraPosition.y - 2, 2) +
      Math.pow(cameraPosition.z - 0, 2)
    )

    // Check distance to Portal B (right portal at [10, 0, 0])
    const distanceToB = Math.sqrt(
      Math.pow(cameraPosition.x - 10, 2) +
      Math.pow(cameraPosition.y - 2, 2) +
      Math.pow(cameraPosition.z - 0, 2)
    )

    // If user is close enough to a portal, trigger selection
    if (distanceToA < detectionDistance) {
      setHasChosen(true)
      onChoice('A')
    } else if (distanceToB < detectionDistance) {
      setHasChosen(true)
      onChoice('B')
    }
  })

  return null
}

/**
 * VR Info Panel - floating UI panel in VR space
 */
function VRInfoPanel({
  dilemma,
  selectedChoice
}: {
  dilemma: any
  selectedChoice: 'A' | 'B' | null
}) {
  const xr = useXR()
  const panelRef = useRef<THREE.Group>(null)

  // Panel follows player gaze at a comfortable distance
  useFrame((state) => {
    if (!panelRef.current) return

    const camera = state.camera

    // Position panel in front of player at chest height
    const distance = 2.5
    const height = 1.2

    const forward = new THREE.Vector3(0, 0, -1)
    forward.applyQuaternion(camera.quaternion)
    forward.y = 0
    forward.normalize()

    const targetPos = camera.position.clone()
    targetPos.add(forward.multiplyScalar(distance))
    targetPos.y = height

    // Smooth follow
    panelRef.current.position.lerp(targetPos, 0.1)

    // Face the camera
    panelRef.current.lookAt(camera.position)
  })

  return (
    <group ref={panelRef}>
      {/* Main info panel background */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.5, 1.2]} />
        <meshStandardMaterial
          color="#1a1a1a"
          transparent
          opacity={0.85}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Border glow */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.55, 1.25]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Status indicator */}
      {selectedChoice && (
        <mesh position={[0, 0.5, 0.01]}>
          <planeGeometry args={[2.3, 0.2]} />
          <meshStandardMaterial
            color={selectedChoice === 'A' ? '#aaaaaa' : '#888888'}
            emissive={selectedChoice === 'A' ? '#aaaaaa' : '#888888'}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Choice status text */}
      <Text
        position={[0, 0.5, 0.02]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {selectedChoice ? `선택됨: ${selectedChoice === 'A' ? '선택 A' : '선택 B'}` : 'VR 모드'}
      </Text>

      {/* Instructions */}
      <Text
        position={[0, 0.15, 0.02]}
        fontSize={0.08}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
        textAlign="center"
        lineHeight={1.4}
      >
        {selectedChoice
          ? '포탈로 걸어가서 선택을 완료하세요'
          : '컨트롤러로 포탈을 가리키거나\n포탈로 걸어가서 선택하세요'}
      </Text>

      {/* Teleport hint */}
      <Text
        position={[0, -0.25, 0.02]}
        fontSize={0.07}
        color="#999999"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
        textAlign="center"
      >
        트리거를 눌러 텔레포트
      </Text>

      {/* Small light for visibility */}
      <pointLight position={[0, 0, 0.5]} color="#ffffff" intensity={0.5} distance={2} />
    </group>
  )
}

/**
 * VR Teleport System - allows VR users to teleport around the scene
 */
function VRTeleportSystem() {
  const [teleportMarkerPos, setTeleportMarkerPos] = useState<THREE.Vector3 | null>(null)
  const [isAiming, setIsAiming] = useState(false)
  const xr = useXR()

  // Create a raycaster for ground detection
  const raycaster = useMemo(() => new THREE.Raycaster(), [])

  // Handle teleport aiming and execution
  useXREvent('selectstart', (event: any) => {
    setIsAiming(true)
  })

  useXREvent('selectend', (event: any) => {
    setIsAiming(false)

    // Teleport to marker position if valid
    if (teleportMarkerPos) {
      // Note: Player teleport temporarily disabled - VR player API changed
      // TODO: Update to new @react-three/xr API
      setTeleportMarkerPos(null)
    }
  })

  // Update teleport marker position based on controller aim
  useFrame((state) => {
    if (!isAiming) {
      setTeleportMarkerPos(null)
      return
    }

    // Simple ground raycast at y=0
    // In a real implementation, we'd raycast from the controller
    const camera = state.camera
    const direction = new THREE.Vector3(0, -1, 0)

    // Calculate target position on ground (limited to reasonable range)
    const forwardDir = new THREE.Vector3(0, 0, -1)
    forwardDir.applyQuaternion(camera.quaternion)
    forwardDir.y = 0
    forwardDir.normalize()

    const targetPos = new THREE.Vector3()
    targetPos.copy(camera.position)
    targetPos.add(forwardDir.multiplyScalar(3))
    targetPos.y = 0.1

    // Limit teleport range to within scene bounds
    const maxDistance = 15
    if (Math.abs(targetPos.x) <= maxDistance && Math.abs(targetPos.z) <= maxDistance) {
      setTeleportMarkerPos(targetPos.clone())
    } else {
      setTeleportMarkerPos(null)
    }
  })

  return (
    <>
      {/* Teleport marker */}
      {teleportMarkerPos && (
        <group position={teleportMarkerPos}>
          {/* Glowing circle marker */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.6, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Inner circle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <circleGeometry args={[0.35, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Pulsing light */}
          <pointLight color="#ffffff" intensity={2} distance={3} />
        </group>
      )}
    </>
  )
}

/**
 * Main DilemmaViewer3D component
 */
export default function DilemmaViewer3D({ dilemma, onChoice }: DilemmaViewer3DProps) {
  const isVRSupportedRef = useRef(true)
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null)
  const [isVRActive, setIsVRActive] = useState(false)
  const [sceneImageUrl, setSceneImageUrl] = useState<string | undefined>(undefined)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [hoveredPortal, setHoveredPortal] = useState<'A' | 'B' | null>(null)

  // Refs for portals (for VR raycasting)
  const portalARef = useRef<THREE.Group>(null)
  const portalBRef = useRef<THREE.Group>(null)

  // Memoize scene3D parsing to avoid re-parsing on every render
  const scene3D = useMemo(() => {
    if (!dilemma.sceneData) return null

    try {
      const parsed = JSON.parse(dilemma.sceneData)
      console.log('✅ 3D Scene loaded:', parsed.objects?.length, 'objects')
      return parsed as Scene3D
    } catch (error) {
      console.error('Failed to parse sceneData:', error)
      return null
    }
  }, [dilemma.sceneData])

  // Memoize portal click handler
  const handlePortalClick = useCallback((choice: 'A' | 'B') => {
    console.log('🔘 handlePortalClick called:', choice)
    console.log('✅ Setting selected choice:', choice)
    setSelectedChoice(choice)
    setTimeout(() => {
      console.log('🚀 Calling onChoice after 1200ms delay')
      onChoice(choice, false)
    }, 1200) // Animation delay
  }, [onChoice])

  // Memoize VR choice handler
  const handleVRChoice = useCallback((choice: 'A' | 'B') => {
    setSelectedChoice((prev) => {
      if (prev) return prev // Prevent duplicate selections
      setTimeout(() => {
        onChoice(choice, true) // In VR
      }, 1200)
      return choice
    })
  }, [onChoice])

  // Memoize VR enter handler
  const handleEnterVR = useCallback(async () => {
    try {
      await xrStore.enterVR()
    } catch (error) {
      console.error('VR mode failed:', error)
      alert('WebXR not supported. VR-compatible browser and device required.')
      isVRSupportedRef.current = false
    }
  }, [])

  // Generate scene image on mount using Gemini (Nano Banana 🍌)
  useEffect(() => {
    const generateSceneImage = async () => {
      if (isGeneratingImage || sceneImageUrl) return

      setIsGeneratingImage(true)
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: dilemma.title,
            description: `${dilemma.description}${dilemma.situation ? '. ' + dilemma.situation : ''}`,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('🍌 Nano Banana image generated:', data.imageUrl ? 'Success' : 'Failed')
          setSceneImageUrl(data.imageUrl)
        }
      } catch (error) {
        console.error('Image generation failed:', error)
      } finally {
        setIsGeneratingImage(false)
      }
    }

    generateSceneImage()
  }, [dilemma.title, dilemma.description, dilemma.situation])

  // Listen for VR session changes
  useEffect(() => {
    const unsubscribe = xrStore.subscribe((state: any) => {
      const isInSession = state.session !== null
      setIsVRActive(isInSession)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ position: [0, 3, 15], fov: 60 }}
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.8 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.5
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          scene.background = new THREE.Color('#87CEEB')  // 하늘색
        }}
      >
        <XR store={xrStore}>
          {/* Ambient light - Reduced for less overall brightness */}
          <ambientLight
            intensity={scene3D?.ambientLightIntensity || 0.2}
            color={scene3D?.ambientLightColor || "#ffffff"}
          />

          {/* Main directional light - Key light (reduced) */}
          <directionalLight
            position={[10, 20, 8]}
            intensity={0.6}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-bias={-0.0001}
            shadow-radius={2}
            shadow-normalBias={0.02}
          />

          {/* Fill light - Much softer */}
          <directionalLight
            position={[-8, 12, -5]}
            intensity={0.3}
            color="#b3d9ff"
          />

          {/* Rim light - Reduced for subtle depth */}
          <directionalLight
            position={[0, 10, -15]}
            intensity={0.5}
            color="#ffffff"
          />

          {/* Hemisphere light - Much reduced */}
          <hemisphereLight
            intensity={0.3}
            color="#87ceeb"
            groundColor="#554433"
          />

          {/* Area lights for portals - Much reduced */}
          <pointLight
            position={[-10, 3, 0]}
            color="#e0e0e0"
            intensity={1.0}
            distance={18}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0005}
            shadow-radius={1.5}
          />
          <pointLight
            position={[10, 3, 0]}
            color="#d0d0d0"
            intensity={1.0}
            distance={18}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0005}
            shadow-radius={1.5}
          />

          {/* Top lights for hologram area - Reduced */}
          <spotLight
            position={[0, 10, 0]}
            angle={0.6}
            penumbra={0.5}
            intensity={0.8}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0005}
            shadow-radius={1.5}
            shadow-camera-near={5}
            shadow-camera-far={20}
          />
          <spotLight
            position={[0, 12, -6]}
            angle={0.5}
            penumbra={0.4}
            intensity={1.5}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0005}
            shadow-radius={1.5}
            target-position={[0, 6, -6]}
          />

          {/* Scene fog - atmospheric depth */}
          <fog attach="fog" args={[scene3D?.fogColor || '#2a2a2a', 40, 80]} />

          {/* Environment map for realistic reflections */}
          <Environment
            preset="warehouse"
            background={false}
            blur={0.3}
          />

          {/* Dynamic 3D Scene Objects */}
          {scene3D?.objects.map((obj, index) => (
            <SceneObjectMesh key={index} obj={obj} />
          ))}

          {/* Dynamic Lights */}
          {scene3D?.lights.map((light, index) => {
            if (light.type === 'point') {
              return (
                <pointLight
                  key={`light-${index}`}
                  position={light.position}
                  color={light.color}
                  intensity={light.intensity}
                />
              )
            }
            return null
          })}

          {/* Floor and grid */}
          <Floor groundColor={scene3D?.groundColor} />
          <GridLines />

          {/* Left Choice Zone (Path A) */}
          <group
            onClick={() => handlePortalClick('A')}
            onPointerOver={(e) => { if (!isVRActive) document.body.style.cursor = 'pointer' }}
            onPointerOut={(e) => { if (!isVRActive) document.body.style.cursor = 'default' }}
          >
            <Portal
              ref={portalARef}
              position={[-10, 0, 0]}
              color="#4488ff"
              label="선택 A"
              emissiveIntensity={selectedChoice === 'A' ? 1.2 : 0.6}
              hovered={hoveredPortal === 'A'}
              selected={selectedChoice === 'A'}
            />
          </group>

          {/* Right Choice Zone (Path B) */}
          <group
            onClick={() => handlePortalClick('B')}
            onPointerOver={(e) => { if (!isVRActive) document.body.style.cursor = 'pointer' }}
            onPointerOut={(e) => { if (!isVRActive) document.body.style.cursor = 'default' }}
          >
            <Portal
              ref={portalBRef}
              position={[10, 0, 0]}
              color="#ff4444"
              label="선택 B"
              emissiveIntensity={selectedChoice === 'B' ? 1.2 : 0.6}
              hovered={hoveredPortal === 'B'}
              selected={selectedChoice === 'B'}
            />
          </group>

          {/* Central hologram */}
          <Suspense fallback={null}>
            <DilemmaHologram dilemma={dilemma} sceneImageUrl={sceneImageUrl} />
          </Suspense>

          {/* Camera controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
            panSpeed={0.5}
            minDistance={8}
            maxDistance={30}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 1, 0]}
          />

          {/* Environment lighting - clean preset */}
          <Environment preset="studio" />

          {/* Post-processing effects for enhanced visuals */}
          <EffectComposer>
            <Bloom
              intensity={0.3}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>

          {/* VR Controller & Position Detection */}
          {isVRActive && (
            <>
              <VRControllerDetector
                portalARef={portalARef}
                portalBRef={portalBRef}
                onChoice={handleVRChoice}
                selectedChoice={selectedChoice}
                onHoverChange={setHoveredPortal}
              />
              <VRPositionDetector onChoice={handleVRChoice} />
              <VRTeleportSystem />
              <VRInfoPanel dilemma={dilemma} selectedChoice={selectedChoice} />
            </>
          )}
        </XR>
      </Canvas>

      {/* UI Overlay - COMPACT */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <p className="text-[10px] tracking-widest text-gray-500">
          {isVRActive ? 'WALK OR POINT CONTROLLER AT PORTAL & PRESS TRIGGER' : 'CLICK TO CHOOSE'}
        </p>
        {isVRActive && (
          <div className="mt-1 flex items-center gap-1 text-gray-300 animate-pulse">
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="text-[10px] font-bold tracking-wider">VR ACTIVE</span>
          </div>
        )}
      </div>

      {/* VR Button - COMPACT */}
      <div className="absolute top-3 right-3">
        <button
          onClick={handleEnterVR}
          className={`webxr-button flex items-center gap-1 text-white font-bold tracking-wider text-[10px] px-2 py-1 ${!isVRSupportedRef.current ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isVRSupportedRef.current}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isVRSupportedRef.current ? 'VR' : 'N/A'}
        </button>
      </div>

      {/* Option Details - CLICKABLE */}
      <div className="absolute bottom-3 left-3 right-3 flex gap-2 justify-between">
        {/* Path A info - CLICKABLE */}
        <div
          onClick={() => handlePortalClick('A')}
          className={`bg-black/80 backdrop-blur-sm p-3 border-2 flex-1 max-w-[48%] cursor-pointer transition-all duration-300 hover:bg-gray-700/30 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-300/50 ${
            selectedChoice === 'A'
              ? 'border-gray-300 shadow-lg shadow-gray-300/50'
              : 'border-gray-500/50'
          }`}
        >
          <h3 className="font-bold text-gray-200 mb-2 text-sm tracking-wider">PATH A</h3>
          <p className="text-xs text-gray-300 leading-relaxed">{dilemma.optionA}</p>
        </div>

        {/* Path B info - CLICKABLE */}
        <div
          onClick={() => handlePortalClick('B')}
          className={`bg-black/80 backdrop-blur-sm p-3 border-2 flex-1 max-w-[48%] cursor-pointer transition-all duration-300 hover:bg-gray-700/30 hover:border-gray-400 hover:shadow-lg hover:shadow-gray-400/50 ${
            selectedChoice === 'B'
              ? 'border-gray-400 shadow-lg shadow-gray-400/50'
              : 'border-gray-600/50'
          }`}
        >
          <h3 className="font-bold text-gray-300 mb-2 text-sm tracking-wider">PATH B</h3>
          <p className="text-xs text-gray-300 leading-relaxed">{dilemma.optionB}</p>
        </div>
      </div>

      {/* Selection feedback */}
      {selectedChoice && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/90 backdrop-blur-md p-10 border-2"
               style={{
                 borderColor: selectedChoice === 'A' ? '#00ffcc' : '#ff0040',
                 boxShadow: `0 0 50px ${selectedChoice === 'A' ? '#00ffcc' : '#ff0040'}`
               }}>
            <h2 className="text-5xl font-bold mb-6 tracking-wider"
                style={{ color: selectedChoice === 'A' ? '#00ffcc' : '#ff0040' }}>
              PATH {selectedChoice}
            </h2>
            <p className="text-gray-400 text-sm tracking-widest">SAVING...</p>
          </div>
        </div>
      )}
    </div>
  )
}
