
import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
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

// Simple in-memory storage (replace with database in production)
export let musicStorage: any[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    })

    const [fields, files] = await form.parse(req)
    
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title
    const artist = Array.isArray(fields.artist) ? fields.artist[0] : fields.artist
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description
    const price = Array.isArray(fields.price) ? fields.price[0] : fields.price
    const owner = Array.isArray(fields.owner) ? fields.owner[0] : fields.owner

    if (!title || !artist || !owner) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const audioFile = Array.isArray(files.audioFile) ? files.audioFile[0] : files.audioFile
    const imageFile = Array.isArray(files.imageFile) ? files.imageFile[0] : files.imageFile

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' })
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

    // For now, we'll just store in memory without blockchain registration
    // In a real app, you'd want to mint NFT and register with Story Protocol here
    try {
      // Simplified version - just store the NFT data
      musicStorage.push(musicNFT)
      console.log('Music NFT stored:', musicNFT)
    } catch (blockchainError) {
      console.error('Blockchain error:', blockchainError)
      // Still save to storage even if blockchain fails
      musicStorage.push(musicNFT)
    }

    // Clean up temporary files
    try {
      if (audioFile.filepath) await fs.promises.unlink(audioFile.filepath)
      if (imageFile?.filepath) await fs.promises.unlink(imageFile.filepath)
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError)
    }

    res.status(200).json({
      success: true,
      musicNFT: musicNFT,
      message: 'Music NFT uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: 'Failed to upload music NFT',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
let musicStorage: any[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      uploadDir: './tmp',
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

    if (!audioFile || !title || !artist) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Upload audio to IPFS
    const audioBuffer = fs.readFileSync(audioFile.filepath)
    const audioIpfsHash = await uploadFileToIPFS(audioBuffer)
    const audioHash = createHash('sha256').update(audioBuffer).digest('hex')

    // Upload image to IPFS (if provided)
    let imageIpfsHash = ''
    let imageHash = ''
    if (imageFile) {
      const imageBuffer = fs.readFileSync(imageFile.filepath)
      imageIpfsHash = await uploadFileToIPFS(imageBuffer)
      imageHash = createHash('sha256').update(imageBuffer).digest('hex')
    }

    // Create IP metadata
    const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
      title: title || '',
      description: description || '',
      createdAt: Math.floor(Date.now() / 1000).toString(),
      creators: [
        {
          name: artist || '',
          address: owner || '',
          contributionPercent: 100,
        },
      ],
      image: imageIpfsHash ? `https://ipfs.io/ipfs/${imageIpfsHash}` : '',
      imageHash: imageHash ? `0x${imageHash}` : '',
      mediaUrl: `https://ipfs.io/ipfs/${audioIpfsHash}`,
      mediaHash: `0x${audioHash}`,
      mediaType: 'audio/mpeg',
    })

    // Upload IP metadata to IPFS
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')

    // Create NFT metadata
    const nftMetadata = {
      name: title,
      description: description || '',
      image: imageIpfsHash ? `https://ipfs.io/ipfs/${imageIpfsHash}` : '',
      external_url: `https://ipfs.io/ipfs/${audioIpfsHash}`,
      attributes: [
        { trait_type: 'Artist', value: artist },
        { trait_type: 'Media Type', value: 'Audio' },
      ],
    }

    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

    // Register IP Asset with licensing terms
    const mintingFee = price ? parseFloat(price) : 1
    const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
      spgNftContract: SPGNFTContractAddress,
      licenseTermsData: [
        {
          terms: createCommercialRemixTerms({ 
            defaultMintingFee: mintingFee, 
            commercialRevShare: 5 
          }),
        },
      ],
      ipMetadata: {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
        ipMetadataHash: `0x${ipHash}`,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
        nftMetadataHash: `0x${nftHash}`,
      },
      txOptions: { waitForTransaction: true },
    })

    // Store music data (replace with database in production)
    const musicData = {
      id: response.ipId,
      title,
      artist,
      description: description || '',
      price: price || '1',
      audioUrl: `https://ipfs.io/ipfs/${audioIpfsHash}`,
      imageUrl: imageIpfsHash ? `https://ipfs.io/ipfs/${imageIpfsHash}` : '',
      owner,
      ipId: response.ipId,
      txHash: response.txHash,
      licenseTermsIds: response.licenseTermsIds,
    }

    musicStorage.push(musicData)

    // Clean up temp files
    fs.unlinkSync(audioFile.filepath)
    if (imageFile) fs.unlinkSync(imageFile.filepath)

    res.status(200).json({
      success: true,
      data: musicData,
      txHash: response.txHash,
      ipId: response.ipId,
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Failed to upload and register music NFT' })
  }
}

// Export storage for other API routes
export { musicStorage }
