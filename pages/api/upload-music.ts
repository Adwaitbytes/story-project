import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../utils/functions/uploadToIpfs'
import { client } from '../../utils/config'
import { createCommercialRemixTerms, SPGNFTContractAddress } from '../../utils/utils'
import { createHash } from 'crypto'
import { IpMetadata } from '@story-protocol/core-sdk'
import { Address } from 'viem'

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
    })

    const [fields, files] = await form.parse(req)

    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title
    const artist = Array.isArray(fields.artist) ? fields.artist[0] : fields.artist
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description
    const price = Array.isArray(fields.price) ? fields.price[0] : fields.price
    const owner = Array.isArray(fields.owner) ? fields.owner[0] : fields.owner

    const audioFile = Array.isArray(files.audioFile) ? files.audioFile[0] : files.audioFile
    const imageFile = Array.isArray(files.imageFile) ? files.imageFile[0] : files.imageFile

    if (!audioFile || !title || !artist || !owner) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Upload files to IPFS
    let audioUrl = ''
    let imageUrl = ''

    try {
      const audioBuffer = await fs.promises.readFile(audioFile.filepath)
      audioUrl = await uploadFileToIPFS(audioBuffer)
      console.log('Audio uploaded to IPFS:', audioUrl)

      if (imageFile) {
        const imageBuffer = await fs.promises.readFile(imageFile.filepath)
        imageUrl = await uploadFileToIPFS(imageBuffer)
        console.log('Image uploaded to IPFS:', imageUrl)
      }
    } catch (ipfsError) {
      console.error('IPFS upload error:', ipfsError)
      // Continue without IPFS for now
      audioUrl = 'placeholder-audio-url'
      imageUrl = 'placeholder-image-url'
    }

    // Create metadata for NFT
    const metadata = {
      name: title,
      description: description || `${title} by ${artist}`,
      image: imageUrl,
      audio: audioUrl,
      attributes: [
        { trait_type: 'Artist', value: artist },
        { trait_type: 'Title', value: title },
        { trait_type: 'License Price', value: price || '0' }
      ]
    }

    let metadataUrl = ''
    try {
      metadataUrl = await uploadJSONToIPFS(metadata)
      console.log('Metadata uploaded to IPFS:', metadataUrl)
    } catch (metadataError) {
      console.error('Metadata upload error:', metadataError)
      metadataUrl = 'placeholder-metadata-url'
    }

    // Create unique ID for the music NFT
    const musicId = createHash('sha256').update(`${title}-${artist}-${Date.now()}`).digest('hex').slice(0, 16)

    // Create music NFT object
    const musicNFT = {
      id: musicId,
      title: title,
      artist: artist,
      description: description || '',
      price: price || '0',
      audioUrl: audioUrl,
      imageUrl: imageUrl,
      owner: owner,
      metadataUrl: metadataUrl,
      createdAt: new Date().toISOString()
    }

    // Store the NFT data persistently
    const currentMusic = loadMusicStorage()
    currentMusic.push(musicNFT)
    saveMusicStorage(currentMusic)
    console.log('Music NFT stored:', musicNFT)

    // Clean up temporary files
    try {
      if (audioFile.filepath) await fs.promises.unlink(audioFile.filepath)
      if (imageFile?.filepath) await fs.promises.unlink(imageFile.filepath)
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError)
    }

    // Register IP Asset
    let ipId = ''
    let licenseTermsIds: string[] = []
    try {
      console.log('Registering IP Asset...')

      const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: SPGNFTContractAddress,
        licenseTermsData: [
          {
            terms: createCommercialRemixTerms({ 
              defaultMintingFee: BigInt(price ? parseFloat(price) * 1e18 : 0), 
              commercialRevShare: 5 
            }),
          },
        ],
        ipMetadata: {
          ipMetadataURI: `https://ipfs.io/ipfs/${metadataUrl}`,
          ipMetadataHash: `0x${createHash('sha256').update(JSON.stringify(metadata)).digest('hex')}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${metadataUrl}`,
          nftMetadataHash: `0x${createHash('sha256').update(JSON.stringify(metadata)).digest('hex')}`,
        },
        txOptions: { waitForTransaction: true },
      })

      ipId = response.ipId!
      licenseTermsIds = response.licenseTermsIds || []

      console.log('IP Asset registered successfully!')
      console.log('IP ID:', ipId)
      console.log('License Terms IDs:', licenseTermsIds)
      console.log('Transaction Hash:', response.txHash)
    } catch (ipError) {
      console.error('IP registration error:', ipError)
      console.log('Continuing without IP registration...')
    }

    res.status(200).json({
      success: true,
      musicNFT: musicNFT,
      message: 'Music NFT uploaded successfully',
      ipId: ipId,
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: 'Failed to upload music NFT',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}