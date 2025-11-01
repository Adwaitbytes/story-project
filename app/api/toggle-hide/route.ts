import { NextRequest, NextResponse } from 'next/server'
import { readMusicData, writeMusicData, MusicData } from '../../../utils/storage'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const owner = searchParams.get('owner')

    if (!id || !owner) {
      return NextResponse.json(
        { success: false, error: 'Missing id or owner' },
        { status: 400 }
      )
    }

    // Read current music data
    const musicData = await readMusicData()

    // Find the music by id
    const musicIndex = musicData.findIndex((m: MusicData) => m.id === id)

    if (musicIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Music not found' },
        { status: 404 }
      )
    }

    // Verify ownership (case-insensitive)
    if (musicData[musicIndex].owner.toLowerCase() !== owner.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Not authorized - you do not own this music' },
        { status: 403 }
      )
    }

    // Toggle hidden state
    const currentHiddenState = musicData[musicIndex].hidden || false
    musicData[musicIndex].hidden = !currentHiddenState

    // Save updated data
    await writeMusicData(musicData)

    return NextResponse.json({
      success: true,
      message: musicData[musicIndex].hidden ? 'Music hidden from explore page' : 'Music visible on explore page',
      hidden: musicData[musicIndex].hidden,
    })
  } catch (error) {
    console.error('Error toggling hide:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
