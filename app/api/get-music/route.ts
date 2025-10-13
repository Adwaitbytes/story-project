import { NextResponse } from 'next/server'
import { readMusicData } from '../../../utils/storage'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  console.log('📂 Loading music NFTs from storage...')
  
  try {
    // Hint to Next/Vercel that this is dynamic
    headers()
    const musicData = await readMusicData()
    console.log('✅ Loaded', musicData.length, 'music NFTs')
    
    return NextResponse.json({
      success: true,
      music: musicData,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('💥 Error loading music:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load music',
      music: [],
    }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
