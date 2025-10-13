import { NextResponse } from 'next/server'
import { readMusicData } from '../../../utils/storage'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

export async function GET() {
  console.log('📂 Loading music NFTs from storage...')
  
  try {
    const musicData = await readMusicData()
    console.log('✅ Loaded', musicData.length, 'music NFTs')
    
    return NextResponse.json({
      success: true,
      music: musicData,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error) {
    console.error('💥 Error loading music:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load music',
      music: [],
    }, { status: 500 })
  }
}
