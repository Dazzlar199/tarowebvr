import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

/**
 * High-quality texture loader with optimizations
 *
 * Features:
 * - Anisotropic filtering (16x) for sharp textures at angles
 * - Linear mipmap filtering for smooth transitions
 * - Automatic mipmap generation
 *
 * @param url - Path to texture file
 * @returns Optimized THREE.Texture
 */
export function useHighQualityTexture(url: string) {
  const texture = useTexture(url)

  // Apply high-quality filtering
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 16  // Maximum anisotropic filtering
  texture.generateMipmaps = true

  // Optimize color space for better color accuracy
  texture.colorSpace = THREE.SRGBColorSpace

  return texture
}

/**
 * Load multiple textures with high quality settings
 *
 * @param urls - Array of texture paths
 * @returns Array of optimized textures
 */
export function useHighQualityTextures(urls: string[]) {
  const textures = useTexture(urls)

  const optimizedTextures = Array.isArray(textures) ? textures : [textures]

  optimizedTextures.forEach(texture => {
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = 16
    texture.generateMipmaps = true
    texture.colorSpace = THREE.SRGBColorSpace
  })

  return textures
}

/**
 * Apply high-quality settings to an existing texture
 *
 * @param texture - THREE.Texture to optimize
 * @returns Optimized texture
 */
export function optimizeTexture(texture: THREE.Texture): THREE.Texture {
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 16
  texture.generateMipmaps = true
  texture.colorSpace = THREE.SRGBColorSpace

  return texture
}

/**
 * Apply optimizations to all textures in a GLTF model
 *
 * @param scene - GLTF scene object
 */
export function optimizeModelTextures(scene: THREE.Object3D): void {
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      const material = mesh.material

      if (Array.isArray(material)) {
        material.forEach(mat => optimizeMaterialTextures(mat))
      } else {
        optimizeMaterialTextures(material as THREE.Material)
      }

      // Enable shadows for better quality
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
  })
}

/**
 * Optimize all textures in a material
 *
 * @param material - THREE.Material to optimize
 */
function optimizeMaterialTextures(material: THREE.Material): void {
  const standardMaterial = material as THREE.MeshStandardMaterial

  // Optimize all common texture maps
  if (standardMaterial.map) optimizeTexture(standardMaterial.map)
  if (standardMaterial.normalMap) optimizeTexture(standardMaterial.normalMap)
  if (standardMaterial.roughnessMap) optimizeTexture(standardMaterial.roughnessMap)
  if (standardMaterial.metalnessMap) optimizeTexture(standardMaterial.metalnessMap)
  if (standardMaterial.aoMap) optimizeTexture(standardMaterial.aoMap)
  if (standardMaterial.emissiveMap) optimizeTexture(standardMaterial.emissiveMap)
}
