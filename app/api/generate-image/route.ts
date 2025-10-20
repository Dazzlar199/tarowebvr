import { NextRequest, NextResponse } from 'next/server'
import { generateDilemmaImage } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { prompt, title, description } = await request.json()

    if (!prompt && !title) {
      return NextResponse.json(
        { error: 'Prompt or title is required' },
        { status: 400 }
      )
    }

    // Generate image using Gemini (Nano Banana 🍌)
    const imageDataUrl = await generateDilemmaImage({
      title: title || prompt,
      description: description || prompt,
    })

    if (!imageDataUrl) {
      return NextResponse.json(
        {
          error: 'Failed to generate image',
          message: 'Gemini returned no image data',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      imageUrl: imageDataUrl,
      success: true,
    })
  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
