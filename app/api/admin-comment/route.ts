import { NextRequest, NextResponse } from 'next/server'
import { readMusicData, writeMusicData, MusicData } from '../../../utils/storage'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const adminWallet = searchParams.get('admin')
    const body = await request.json()
    const { comment } = body

    if (!id || !adminWallet || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing id, admin, or comment' },
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

    const music = musicData[musicIndex]

    // Add comment to the music
    if (!music.adminComments) {
      music.adminComments = []
    }

    const newComment = {
      id: `comment-${Date.now()}`,
      admin: adminWallet,
      comment: comment,
      timestamp: new Date().toISOString(),
      read: false,
    }

    music.adminComments.push(newComment)
    musicData[musicIndex] = music

    // Save updated data
    await writeMusicData(musicData)

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment,
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// GET - Get comments for a music
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id' },
        { status: 400 }
      )
    }

    const musicData = await readMusicData()
    const music = musicData.find((m: MusicData) => m.id === id)

    if (!music) {
      return NextResponse.json(
        { success: false, error: 'Music not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      comments: music.adminComments || [],
    })
  } catch (error) {
    console.error('Error getting comments:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
