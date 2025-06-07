
import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../utils/functions/uploadToIpfs'
import { client } from '../../utils/config'
import { createCommercialRemixTerms, SPGNFTContractAddress } from '../../utils/utils'
import { createHash } from 'crypto'
import { IpMetadata } from '@story-protocol/core-sdk'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Simple in-memory storage (replace with database in production)
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
