import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface DilemmaImagePrompt {
  title: string
  description: string
  optionA?: string
  optionB?: string
  category?: string
}

/**
 * 딜레마에 대한 이미지 프롬프트 생성
 */
function createDilemmaImagePrompt(dilemma: DilemmaImagePrompt): string {
  return `Create a highly realistic, documentary-style photograph depicting this moral dilemma:

"${dilemma.title}"

${dilemma.description}

Visual Style:
- Ultra-realistic photography style, like a documentary or news photo
- Natural lighting with authentic, raw emotional atmosphere
- Capture the actual moment of the real-life situation
- Realistic contemporary setting with genuine people and environments
- Focus on human faces, expressions, and body language showing the weight of the decision
- Gritty, authentic realism - no fantasy or sci-fi elements
- Shot with professional camera, photojournalistic quality
- Contemporary real-world setting (modern clothing, locations, objects)

${dilemma.category ? `Category: ${dilemma.category}` : ''}

The image should look like a real photograph of an actual situation happening right now in the real world. No text, no words, no fantasy elements.`
}

/**
 * Gemini Imagen을 사용하여 딜레마 이미지 생성
 * Nano Banana (Gemini Image Generation) 사용 🍌
 */
export async function generateDilemmaImage(
  dilemma: DilemmaImagePrompt
): Promise<string | null> {
  try {
    // Gemini 2.5 Flash Image - Image Generation Model (Nano Banana 🍌)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image'
    })

    const prompt = createDilemmaImagePrompt(dilemma)

    console.log('🍌 Generating image with Gemini (Nano Banana) for:', dilemma.title)

    const result = await model.generateContent(prompt)
    const response = result.response

    // 이미지 데이터 추출
    const candidates = response.candidates
    if (!candidates || candidates.length === 0) {
      console.warn('⚠️ No candidates in response (possibly content filtered by Gemini)')
      return null
    }

    const candidate = candidates[0]

    // Check if content was blocked by safety filters
    if (candidate.finishReason === 'SAFETY') {
      console.warn('⚠️ Content blocked by Gemini safety filters')
      return null
    }

    if (!candidate.content || !candidate.content.parts) {
      console.warn('⚠️ No content or parts in candidate (possibly content filtered)')
      return null
    }

    const parts = candidate.content.parts
    for (const part of parts) {
      // inlineData에 이미지가 있는지 확인
      if ('inlineData' in part && part.inlineData) {
        const imageData = part.inlineData.data
        const mimeType = part.inlineData.mimeType || 'image/png'

        // Base64 데이터 URL 생성
        const base64Image = `data:${mimeType};base64,${imageData}`
        console.log('✅ Image generated successfully with Nano Banana 🍌')
        return base64Image
      }
    }

    console.log('⚠️ No image data found in response')
    return null
  } catch (error) {
    console.error('Error generating image with Gemini:', error)
    return null
  }
}
