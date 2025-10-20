"use client"

import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture, Html, Environment } from '@react-three/drei'
import { XR, createXRStore } from '@react-three/xr'
import * as THREE from 'three'
import Scene3DRenderer from './Scene3D'
import type { Scene3D } from '@/lib/ai/scene-generator'

// Create XR store outside component to persist
const xrStore = createXRStore()

interface WorldViewerProps {
  imageUrl: string
  title: string
  sceneData?: string | null
}

// 360° Panorama Sphere
function PanoramaSphere({ imageUrl }: { imageUrl: string }) {
  let texture

  try {
    texture = useTexture(imageUrl, (loadedTexture) => {
      console.log('✅ Texture loaded successfully')
    })
  } catch (error) {
    console.error('❌ Failed to load texture:', error)
    // Return placeholder sphere on error
    return (
      <mesh>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial
          color="#1a1a2e"
          side={THREE.BackSide}
        />
      </mesh>
    )
  }

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// Loading fallback
function LoadingScene() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 1]} />
        <meshStandardMaterial
          color="#9333ea"
          wireframe
          emissive="#9333ea"
          emissiveIntensity={0.5}
        />
      </mesh>
      <Html center>
        <div className="text-white text-center bg-black/50 px-6 py-3 rounded-lg backdrop-blur-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>세계를 불러오는 중...</p>
        </div>
      </Html>
    </group>
  )
}

// Main viewer component
export default function WorldViewer({ imageUrl, title, sceneData }: WorldViewerProps) {
  const [isVRSupported, setIsVRSupported] = useState(true)
  const [viewMode, setViewMode] = useState<'panorama' | '3d'>(sceneData ? '3d' : 'panorama')

  // Parse scene data
  let scene: Scene3D | null = null
  if (sceneData) {
    try {
      scene = JSON.parse(sceneData)
    } catch (error) {
      console.error('Failed to parse scene data:', error)
    }
  }

  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ position: viewMode === '3d' ? [0, 1.6, 5] : [0, 0, 0.1], fov: 75 }}
        gl={{ antialias: true }}
      >
        {/* XR Mode Support */}
        <XR store={xrStore}>
          {viewMode === '3d' && scene ? (
            /* 3D Scene Mode */
            <>
              <Suspense fallback={<LoadingScene />}>
                <Scene3DRenderer sceneData={scene} />
              </Suspense>

              {/* Camera Controls for 3D scene */}
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                rotateSpeed={0.5}
                enableDamping
                dampingFactor={0.05}
                minDistance={2}
                maxDistance={50}
              />
            </>
          ) : (
            /* 360° Panorama Mode */
            <>
              {/* Lighting */}
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={0.5} />

              {/* Environment for better lighting */}
              <Environment preset="sunset" />

              {/* 360° Panorama */}
              <Suspense fallback={<LoadingScene />}>
                <PanoramaSphere imageUrl={imageUrl} />
              </Suspense>

              {/* Camera Controls - only when NOT in VR */}
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                rotateSpeed={-0.5}
                enableDamping
                dampingFactor={0.05}
              />
            </>
          )}
        </XR>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
          {title}
        </h1>
        <p className="text-sm md:text-base text-gray-300 mt-2">
          마우스를 드래그하거나 터치하여 둘러보세요
        </p>
      </div>

      {/* View Mode Toggle and VR Button */}
      <div className="absolute bottom-6 right-6 flex gap-3">
        {/* View Mode Toggle - only show if 3D scene exists */}
        {scene && (
          <button
            onClick={() => setViewMode(viewMode === '3d' ? 'panorama' : '3d')}
            className="webxr-button flex items-center gap-2 text-white font-semibold"
          >
            {viewMode === '3d' ? '📷 2D 파노라마' : '🎮 3D 탐험'}
          </button>
        )}

        {/* VR Enter Button */}
        <button
          onClick={async () => {
            try {
              await xrStore.enterVR()
            } catch (error) {
              console.error('VR 모드 진입 실패:', error)
              alert('VR 모드를 시작할 수 없습니다. WebXR을 지원하는 브라우저와 기기가 필요합니다.')
              setIsVRSupported(false)
            }
          }}
          className={`webxr-button flex items-center gap-2 text-white font-semibold ${!isVRSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isVRSupported}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {isVRSupported ? 'VR 모드' : 'VR 미지원'}
        </button>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white text-sm max-w-xs pointer-events-none">
        <p className="font-semibold mb-2">조작법</p>
        <ul className="space-y-1 text-xs text-gray-300">
          <li>🖱️ 마우스 드래그: 둘러보기</li>
          <li>📱 터치 드래그: 둘러보기</li>
          <li>⌨️ 마우스 휠: 확대/축소 (비활성화)</li>
        </ul>
      </div>
    </div>
  )
}
