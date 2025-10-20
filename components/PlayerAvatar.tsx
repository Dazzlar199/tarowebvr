"use client"

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface PlayerAvatarProps {
  playerId: string
  username: string
  position: [number, number, number]
  rotation?: [number, number, number]
  choice?: 'A' | 'B' | null
  isLocalPlayer?: boolean
}

export default function PlayerAvatar({
  playerId,
  username,
  position,
  rotation,
  choice,
  isLocalPlayer = false
}: PlayerAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const nameRef = useRef<any>(null)

  // Gentle floating animation
  useFrame(({ clock }) => {
    if (meshRef.current && !isLocalPlayer) {
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() + parseFloat(playerId.slice(0, 8))) * 0.1
    }

    // Make nametag always face camera
    if (nameRef.current) {
      nameRef.current.quaternion.copy(nameRef.current.parent.quaternion)
    }
  })

  // Color based on choice
  const avatarColor = choice === 'A'
    ? '#00FFFF'  // Cyan for choice A
    : choice === 'B'
    ? '#FF0055'  // Red for choice B
    : isLocalPlayer
    ? '#FFFF00'  // Yellow for local player (no choice yet)
    : '#00FF41'  // Green for other players (no choice yet)

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Avatar body - capsule shape */}
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial
          color={avatarColor}
          emissive={avatarColor}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={avatarColor}
          emissive={avatarColor}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Glow effect */}
      <pointLight
        position={[0, 0.5, 0]}
        color={avatarColor}
        intensity={isLocalPlayer ? 2 : 1}
        distance={3}
      />

      {/* Username label */}
      <Text
        ref={nameRef}
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color={isLocalPlayer ? '#FFFF00' : '#FFFFFF'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {isLocalPlayer ? `${username} (YOU)` : username}
      </Text>

      {/* Choice indicator */}
      {choice && (
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.15}
          color={choice === 'A' ? '#00FFFF' : '#FF0055'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          CHOICE {choice}
        </Text>
      )}
    </group>
  )
}
