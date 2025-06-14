import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIza****************yLP2B05QXURAmMFKzU'
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || 'sk-...' // You'll need to get this from stability.ai

if (!PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY is not set')
}

if (!OPENAI_API_KEY && !REPLICATE_API_KEY && !GEMINI_API_KEY) {
  throw new Error('No image generation API keys are set')
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

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
      console.log('Attempting to generate image with prompt:', prompt);
      
      try {
        // Try Stability AI first (free tier available)
        try {
          console.log('Trying Stability AI...');
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
                  text: prompt,
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
            throw new Error(`Stability API error: ${response.statusText}`);
          }

          const result = await response.json();
          if (result.artifacts?.[0]?.base64) {
            const imageUrl = `data:image/png;base64,${result.artifacts[0].base64}`;
            return NextResponse.json({
              success: true,
              imageUrl: imageUrl
            });
          }
        } catch (error) {
          console.log('Stability AI failed, trying next option...', error);
        }

        // Try Gemini with the correct model
        try {
          console.log('Trying Gemini...');
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          
          const result = await model.generateContent({
            contents: [{
              role: "user",
              parts: [{
                text: `Create a detailed album cover image based on this description: ${prompt}. The image should be high quality, artistic, and suitable for a music album. Focus on creating a visually striking composition that captures the mood and theme of the music.`
              }]
            }],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
            safetySettings: [
              {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
              },
            ],
          });

          const response = await result.response;
          if (!response.candidates || response.candidates.length === 0) {
            throw new Error('No response from Gemini API');
          }
          
          const imageData = response.candidates[0]?.content?.parts[0]?.inlineData?.data;
          
          if (imageData) {
            const imageUrl = `data:image/png;base64,${imageData}`;
            return NextResponse.json({
              success: true,
              imageUrl: imageUrl
            });
          }
        } catch (error: unknown) {
          console.error('Detailed error in image generation:', error instanceof Error ? error.message : 'Unknown error');
          if (error instanceof Error) {
            throw new Error(`Image generation failed: ${error.message}`);
          }
          throw new Error('Image generation failed with unknown error');
        }

        // Try Stable Diffusion as last resort
        if (REPLICATE_API_KEY) {
          try {
            console.log('Trying Stable Diffusion...');
            const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
              method: 'POST',
              headers: {
                'Authorization': `Token ${REPLICATE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
                input: {
                  prompt: prompt,
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

            const replicateData = await replicateResponse.json();
            
            if (replicateData.status === 'starting' || replicateData.status === 'processing') {
              const result = await pollForResult(replicateData.id);
              if (result?.output?.[0]) {
                return NextResponse.json({
                  success: true,
                  imageUrl: result.output[0]
                });
              }
            }
          } catch (error) {
            console.log('Stable Diffusion failed:', error);
          }
        }
        
        // If we get here, all APIs failed
        throw new Error('All image generation APIs failed. Please try a different prompt or check API keys.');
        
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