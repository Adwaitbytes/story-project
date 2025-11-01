import { NextRequest, NextResponse } from 'next/server'
import { readMusicData, writeMusicData, MusicData } from '../../../utils/storage'

// GET - Get all notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')

    if (!owner) {
      return NextResponse.json(
        { success: false, error: 'Missing owner' },
        { status: 400 }
      )
    }

    const musicData = await readMusicData()
    
    // Get all music owned by this user
    const userMusic = musicData.filter(
      (m: MusicData) => m.owner.toLowerCase() === owner.toLowerCase()
    )

    // Collect all comments from user's music
    const notifications: any[] = []
    
    userMusic.forEach((music) => {
      if (music.adminComments && music.adminComments.length > 0) {
        music.adminComments.forEach((comment) => {
          notifications.push({
            id: comment.id,
            musicId: music.id,
            musicTitle: music.title,
            musicImage: music.imageUrl,
            admin: comment.admin,
            comment: comment.comment,
            timestamp: comment.timestamp,
            read: comment.read,
          })
        })
      }
    })

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    })
  } catch (error) {
    console.error('Error getting notifications:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

// POST - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commentId, musicId, owner } = body

    if (!commentId || !musicId || !owner) {
      return NextResponse.json(
        { success: false, error: 'Missing commentId, musicId, or owner' },
        { status: 400 }
      )
    }

    const musicData = await readMusicData()
    const musicIndex = musicData.findIndex((m: MusicData) => m.id === musicId)

    if (musicIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Music not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (musicData[musicIndex].owner.toLowerCase() !== owner.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Mark comment as read
    if (musicData[musicIndex].adminComments) {
      const commentIndex = musicData[musicIndex].adminComments!.findIndex(
        (c) => c.id === commentId
      )
      if (commentIndex !== -1) {
        musicData[musicIndex].adminComments![commentIndex].read = true
      }
    }

    await writeMusicData(musicData)

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
