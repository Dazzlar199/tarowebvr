/**
 * Test script for Nano Banana 🍌 (Gemini Image Generation)
 */

import { generateDilemmaImage } from '../lib/gemini'

async function testGemini() {
  console.log('🍌 Testing Nano Banana (Gemini Image Generation)...\n')
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set')
  console.log()

  try {
    const testDilemma = {
      title: '농장의 선택',
      description: '가뭄으로 인해 물이 부족합니다. 식량 작물과 현금 작물 중 하나만 살릴 수 있습니다.',
      category: 'resource_allocation'
    }

    console.log('📝 Test dilemma:', testDilemma.title)
    console.log('📝 Description:', testDilemma.description)
    console.log('\n🎨 Generating image...\n')

    const imageUrl = await generateDilemmaImage(testDilemma)

    if (imageUrl) {
      console.log('✅ SUCCESS! Nano Banana is working!')
      console.log('🖼️  Image URL length:', imageUrl.length, 'characters')
      console.log('🖼️  Image format:', imageUrl.substring(0, 50) + '...')

      // Check if it's a valid base64 data URL
      if (imageUrl.startsWith('data:image/')) {
        console.log('✅ Valid base64 data URL')
      } else {
        console.log('❌ Invalid image format')
      }
    } else {
      console.log('❌ FAILED! No image generated')
      console.log('⚠️  Possible issues:')
      console.log('   - GEMINI_API_KEY not set or invalid')
      console.log('   - Content filtered by Gemini safety filters')
      console.log('   - API quota exceeded')
    }
  } catch (error) {
    console.error('❌ ERROR:', error)
  }
}

testGemini()
