import { NextRequest, NextResponse } from 'next/server'

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY is not set')
}

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

export async function POST(req: Request) {
  if (!PERPLEXITY_API_KEY) {
    return NextResponse.json(
      { error: 'Perplexity API is not configured. Please add PERPLEXITY_API_KEY to your environment variables.' },
      { status: 501 }
    )
  }

  try {
    const { prompt, type } = await req.json()

    if (!prompt || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: prompt and type' },
        { status: 400 }
      )
    }

    // For image generation, we'll use OpenAI's DALL-E 3
    if (type === 'image_generation') {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('OpenAI API error:', error)
        throw new Error(error.error?.message || 'Failed to generate image')
      }

      const data = await response.json()
      return NextResponse.json({
        success: true,
        imageUrl: data.data[0].url
      })
    }

    // For text generation (lyrics and image prompts), use Perplexity API
    const model = 'sonar'
    const systemPrompt = type === 'lyrics' 
      ? 'You are a professional songwriter. Generate original, creative lyrics that are suitable for professional release. The lyrics should be well-structured, meaningful, and engaging. Format the output with clear verse and chorus sections.'
      : 'You are an expert at creating detailed image generation prompts. Create a vivid, descriptive prompt that will generate a high-quality album cover artwork. Include specific details about style, mood, colors, and visual elements. The prompt should be optimized for AI image generation.'

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Perplexity API error:', error)
      throw new Error(error.error?.message || 'Failed to generate content')
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    return NextResponse.json({
      success: true,
      content: content.trim()
    })

  } catch (error) {
    console.error('Error in Perplexity API:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 