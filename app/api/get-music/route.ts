export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface MusicData {
  id: string
  title: string
  artist: string
  description: string
  price: string
  audioUrl: string
  imageUrl: string
  owner: string
  metadataUrl: string
  createdAt: string
  ipId?: string
  txHash?: string
}

const STORAGE_FILE = path.join(process.cwd(), 'music-storage.json')

function readStorage(): MusicData[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('❌ Error reading storage:', error)
    return []
  }
}

export async function GET() {
  console.log('📂 Loading music NFTs from storage...')
  
  try {
    const musicData = readStorage()
    console.log('✅ Loaded', musicData.length, 'music NFTs')
    
    return NextResponse.json({
      success: true,
      music: musicData,
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
