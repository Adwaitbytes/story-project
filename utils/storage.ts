// Storage utility: uses Vercel Blob in production, falls back to local file in dev
import { put, del, list } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

export interface MusicData {
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
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const BLOB_FILENAME = 'music-data.json' // Use different name to avoid conflicts

function usingBlob(): boolean {
  return Boolean(BLOB_TOKEN)
}

// Read from Vercel Blob
async function blobRead(): Promise<MusicData[] | null> {
  if (!usingBlob()) return null
  
  try {
    // List all blobs with our prefix and get the latest one
    const { blobs } = await list({ 
      token: BLOB_TOKEN,
      prefix: 'music-data',
    })
    
    if (blobs.length === 0) {
      console.log('📝 No existing blob storage found, will create on first write')
      return []
    }
    
    // Sort by uploaded date and get the most recent
    const latestBlob = blobs.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    
    console.log('� Reading from latest blob:', latestBlob.url)
    
    const response = await fetch(latestBlob.url, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      throw new Error(`Blob fetch failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Loaded data from Vercel Blob:', data.length, 'tracks')
    return data as MusicData[]
  } catch (error) {
    console.error('❌ Error reading from Blob:', error)
    return []
  }
}

// Write to Vercel Blob
async function blobWrite(data: MusicData[]): Promise<void> {
  if (!usingBlob()) return
  
  try {
    // List and delete old blobs with the same prefix
    try {
      const { blobs } = await list({ 
        token: BLOB_TOKEN,
        prefix: 'music-data',
      })
      
      if (blobs.length > 0) {
        console.log(`🗑️ Deleting ${blobs.length} old blob(s)...`)
        await Promise.all(
          blobs.map(blob => del(blob.url, { token: BLOB_TOKEN }))
        )
        // Small delay to ensure deletion propagates
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (delError) {
      console.log('ℹ️ No existing blob to delete or delete failed:', delError)
    }
    
    // Write new blob with timestamp to ensure uniqueness, then we'll use the latest
    const timestamp = Date.now()
    const filename = `music-data-${timestamp}.json`
    
    const blob = await put(filename, JSON.stringify(data, null, 2), {
      access: 'public',
      token: BLOB_TOKEN,
      contentType: 'application/json',
    })
    console.log('✅ Data saved to Vercel Blob:', blob.url)
  } catch (error) {
    console.error('❌ Error writing to Blob:', error)
    throw error
  }
}

// Read from local filesystem
function fsRead(): MusicData[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      return JSON.parse(data) as MusicData[]
    }
    return []
  } catch (error) {
    console.error('❌ FS read error:', error)
    return []
  }
}

// Write to local filesystem
function fsWrite(data: MusicData[]): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2))
    console.log('✅ Data saved to local file')
  } catch (error) {
    console.error('❌ FS write error:', error)
  }
}

// Public API: Read music data
export async function readMusicData(): Promise<MusicData[]> {
  if (usingBlob()) {
    console.log('📦 Using Vercel Blob storage')
    const data = await blobRead()
    return data || []
  } else {
    console.log('📁 Using local file storage')
    return fsRead()
  }
}

// Public API: Write music data
export async function writeMusicData(data: MusicData[]): Promise<void> {
  if (usingBlob()) {
    console.log('📦 Saving to Vercel Blob storage')
    await blobWrite(data)
  } else {
    console.log('📁 Saving to local file storage')
    fsWrite(data)
  }
}
