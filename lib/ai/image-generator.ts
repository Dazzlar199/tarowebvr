import OpenAI from 'openai'
import { CONSTANTS } from '../constants'

// Replicate import (will install later)
// import Replicate from 'replicate'

export const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

// export const replicate = process.env.REPLICATE_API_TOKEN ? new Replicate({
//   auth: process.env.REPLICATE_API_TOKEN,
// }) : null

/**
 * Generate 360° panorama image for WebXR world using OpenAI DALL-E
 */
export async function generate360Image(prompt: string, style?: string): Promise<string | null> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    // Enhance prompt for 360° panoramic view
    const enhancedPrompt = `360 degree panoramic view, equirectangular projection: ${prompt}.
    Style: ${style || 'photorealistic, immersive, high detail, seamless horizon, ambient lighting'}.
    Wide field of view, suitable for VR environment. NO text or UI elements.`

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: CONSTANTS.PANORAMA_IMAGE_SIZE,
      quality: "hd",
    })

    return response.data?.[0]?.url || null
  } catch (error) {
    console.error('Error generating 360° image with DALL-E:', error)
    return null
  }
}

/**
 * Generate standard image for world thumbnail
 */
export async function generateThumbnail(prompt: string): Promise<string | null> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt}. High quality thumbnail, cinematic composition, detailed.`,
      n: 1,
      size: CONSTANTS.DEFAULT_IMAGE_SIZE,
      quality: "standard",
    })

    return response.data?.[0]?.url || null
  } catch (error) {
    console.error('Error generating thumbnail:', error)
    return null
  }
}

/**
 * Generate with Replicate (Stable Diffusion) - fallback option
 * Uncomment when replicate package is installed
 */
/*
export async function generate360ImageReplicate(prompt: string): Promise<string | null> {
  if (!replicate) {
    throw new Error('Replicate API token not configured')
  }

  try {
    const output = await replicate.run(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      {
        input: {
          prompt: `360 degree panoramic equirectangular view: ${prompt}`,
          width: 1792,
          height: 1024,
        }
      }
    ) as string[]

    return output?.[0] || null
  } catch (error) {
    console.error('Error generating with Replicate:', error)
    return null
  }
}
*/
