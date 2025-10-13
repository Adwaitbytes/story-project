import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const STABILITY_API_KEY = process.env.STABILITY_API_KEY

if (!PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY is not set')
}

// Initialize Gemini only if key exists
let genAI: GoogleGenerativeAI | null = null
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
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

    // For image generation, we'll use Stability AI first
    if (type === 'image_generation') {
      console.log('Attempting to generate image with prompt:', prompt);
      
      // Truncate prompt if too long (Stability AI has 2000 char limit)
      const truncatedPrompt = prompt.length > 1800 
        ? prompt.substring(0, 1800) + '...' 
        : prompt;
      
      try {
        // Try Stability AI first
        if (STABILITY_API_KEY) {
          try {
            console.log('Trying Stability AI with new key...');
            const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${STABILITY_API_KEY}`,
              },
              body: JSON.stringify({
                text_prompts: [
                  {
                    text: truncatedPrompt,
                    weight: 1
                  }
                ],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                samples: 1,
                steps: 30,
                style_preset: "digital-art"
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => null);
              console.error('Stability API error details:', errorData);
              throw new Error(`Stability API error: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
            }

            const result = await response.json();
            if (result.artifacts?.[0]?.base64) {
              const imageUrl = `data:image/png;base64,${result.artifacts[0].base64}`;
              return NextResponse.json({
                success: true,
                imageUrl: imageUrl
              });
            } else {
              throw new Error('No image data in Stability AI response');
            }
          } catch (error) {
            console.error('Stability AI error:', error);
            // Don't throw here, try other options
          }
        } else {
          console.log('Skipping Stability AI - API key not configured or invalid');
        }

        // Try Gemini - Note: Gemini doesn't generate images directly, skip it
        console.log('Skipping Gemini - text-only model');

        // Try Stable Diffusion as last resort
        if (REPLICATE_API_KEY) {
          try {
            console.log('Trying Replicate Stable Diffusion...');
            const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
              method: 'POST',
              headers: {
                'Authorization': `Token ${REPLICATE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
                input: {
                  prompt: truncatedPrompt.substring(0, 500), // Replicate also has limits
                  negative_prompt: "ugly, blurry, poor quality, distorted, deformed, disfigured, bad anatomy, bad proportions",
                  width: 1024,
                  height: 1024,
                  num_outputs: 1,
                  scheduler: "K_EULER",
                  num_inference_steps: 50,
                  guidance_scale: 7.5,
                }
              })
            });

            if (!replicateResponse.ok) {
              throw new Error('Replicate API request failed');
            }

            const replicateData = await replicateResponse.json();
            
            if (replicateData.status === 'starting' || replicateData.status === 'processing') {
              const result = await pollForResult(replicateData.id);
              if (result?.output?.[0]) {
                return NextResponse.json({
                  success: true,
                  imageUrl: result.output[0]
                });
              }
            } else if (replicateData.output?.[0]) {
              return NextResponse.json({
                success: true,
                imageUrl: replicateData.output[0]
              });
            }
          } catch (error) {
            console.log('Replicate Stable Diffusion failed:', error);
          }
        }
        
        // If we get here, all APIs failed - return a placeholder
        console.log('All image generation APIs failed, using placeholder');
        
        // Create a simple colorful gradient placeholder based on prompt
        const colors = ['4F46E5', 'EC4899', '10B981', 'F59E0B', '8B5CF6', 'EF4444'];
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        
        // Generate SVG placeholder
        const svg = `
          <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#${color1};stop-opacity:1" />
                <stop offset="100%" style="stop-color:#${color2};stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="1024" height="1024" fill="url(#grad)"/>
            <text x="512" y="462" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">🎵</text>
            <text x="512" y="542" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" opacity="0.9">Album Artwork</text>
            <text x="512" y="592" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.7">${truncatedPrompt.substring(0, 50)}...</text>
          </svg>
        `.trim();
        
        const base64 = Buffer.from(svg).toString('base64');
        return NextResponse.json({
          success: true,
          imageUrl: `data:image/svg+xml;base64,${base64}`,
          placeholder: true,
          message: 'Image generation APIs are not available. Using placeholder. Please configure valid API keys for Stability AI or Replicate.'
        });
        
      } catch (error: unknown) {
        console.error('Detailed error in image generation:', error instanceof Error ? error.message : 'Unknown error');
        if (error instanceof Error) {
          throw new Error(`Image generation failed: ${error.message}`);
        }
        throw new Error('Image generation failed with unknown error');
      }
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

async function pollForResult(predictionId: string, maxAttempts = 20): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.status === 'succeeded') {
      return data;
    } else if (data.status === 'failed') {
      throw new Error('Stable Diffusion generation failed');
    }
    
    // Wait 1 second before next attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Stable Diffusion generation timed out');
} 