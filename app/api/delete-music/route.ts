import { NextRequest, NextResponse } from 'next/server'
import { readMusicData, writeMusicData, MusicData } from '../../../utils/storage'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const musicId = searchParams.get('id')
    const ownerAddress = searchParams.get('owner')

    if (!musicId) {
      return NextResponse.json(
        { error: 'Music ID is required' },
        { status: 400 }
      )
    }

    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'Owner address is required for verification' },
        { status: 400 }
      )
    }

    console.log('🗑️ Deleting music with ID:', musicId)
    console.log('👤 Requester address:', ownerAddress)

    // Read current data
    const musicData = await readMusicData()

    // Find the music to delete
    const musicToDelete = musicData.find((m: MusicData) => m.id === musicId)
    if (!musicToDelete) {
      return NextResponse.json(
        { error: 'Music not found' },
        { status: 404 }
      )
    }

    // Verify ownership - case insensitive comparison
    if (musicToDelete.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
      console.log('❌ Ownership verification failed')
      console.log('   Music owner:', musicToDelete.owner)
      console.log('   Requester:', ownerAddress)
      return NextResponse.json(
        { error: 'You can only delete your own music. Ownership verification failed.' },
        { status: 403 }
      )
    }

    console.log('✅ Ownership verified')

    // Filter out the deleted music
    const updatedData = musicData.filter((m: MusicData) => m.id !== musicId)

    // Save updated data
    await writeMusicData(updatedData)

    console.log('✅ Successfully deleted:', musicToDelete.title)
    console.log(`📊 Remaining tracks: ${updatedData.length}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Music deleted successfully',
        deleted: {
          id: musicToDelete.id,
          title: musicToDelete.title,
          artist: musicToDelete.artist,
        },
        remaining: updatedData.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('❌ Error deleting music:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete music',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
