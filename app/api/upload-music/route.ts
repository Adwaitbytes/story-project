
import { NextRequest, NextResponse } from 'next/server'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../../utils/functions/uploadToIpfs'
import { createHash } from 'crypto'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Persistent file storage
const STORAGE_FILE = path.join(process.cwd(), 'music-storage.json')

function loadMusicStorage(): any[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading music storage:', error)
  }
  return []
}

function saveMusicStorage(music: any[]): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(music, null, 2))
  } catch (error) {
    console.error('Error saving music storage:', error)
  }
}

export function getMusicStorage(): any[] {
  return loadMusicStorage()
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const title = formData.get('title') as string
    const artist = formData.get('artist') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const owner = formData.get('owner') as string
    const audioFile = formData.get('audioFile') as File
    const imageFile = formData.get('imageFile') as File | null

    if (!audioFile || !title || !artist || !owner) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload files to IPFS
    let audioUrl = ''
    let imageUrl = ''

    try {
      // Convert File to Buffer for IPFS upload
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
      audioUrl = await uploadFileToIPFS(audioBuffer, audioFile.name)
      console.log('Audio uploaded to IPFS:', audioUrl)

      if (imageFile) {
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
        imageUrl = await uploadFileToIPFS(imageBuffer, imageFile.name)
        console.log('Image uploaded to IPFS:', imageUrl)
      }
    } catch (ipfsError) {
      console.error('IPFS upload error:', ipfsError)
      return NextResponse.json({ error: 'Failed to upload files to IPFS' }, { status: 500 })
    }

    // Create metadata
    const metadata = {
      name: title,
      description: description || '',
      image: imageUrl ? `https://gateway.pinata.cloud/ipfs/${imageUrl}` : '',
      audio: `https://gateway.pinata.cloud/ipfs/${audioUrl}`,
      attributes: [
        { trait_type: 'Artist', value: artist },
        { trait_type: 'Title', value: title },
        { trait_type: 'License Price', value: price || '0' }
      ]
    }

    // Upload metadata to IPFS
    let metadataUrl = ''
    try {
      metadataUrl = await uploadJSONToIPFS(metadata)
      console.log('Metadata uploaded to IPFS:', metadataUrl)
    } catch (metadataError) {
      console.error('Metadata upload error:', metadataError)
      return NextResponse.json({ error: 'Failed to upload metadata to IPFS' }, { status: 500 })
    }

    // Create music NFT object
    const musicNFT = {
      id: createHash('md5').update(`${title}${artist}${Date.now()}`).digest('hex').substring(0, 16),
      title,
      artist,
      description: description || '',
      price: price || '0',
      audioUrl,
      imageUrl,
      owner: owner.toLowerCase(),
      metadataUrl,
      createdAt: new Date().toISOString()
    }

    // Save to storage
    const currentMusic = loadMusicStorage()
    currentMusic.push(musicNFT)
    saveMusicStorage(currentMusic)

    console.log('Music NFT stored:', musicNFT)

    return NextResponse.json({
      success: true,
      musicNFT,
      message: 'Music NFT uploaded successfully!'
    })

  } catch (error) {
    console.error('Error processing upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
