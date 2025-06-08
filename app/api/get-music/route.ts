
import { NextResponse } from 'next/server'
import { getMusicStorage } from '../upload-music/route'

export async function GET() {
  try {
    const musicStorage = getMusicStorage()
    return NextResponse.json({
      success: true,
      music: musicStorage || [],
    })
  } catch (error) {
    console.error('Error getting music:', error)
    return NextResponse.json({ error: 'Failed to get music NFTs' }, { status: 500 })
  }
}
