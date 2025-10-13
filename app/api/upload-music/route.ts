import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../../utils/functions/uploadToIpfs'
import { createHash } from 'crypto'
import { client, networkInfo } from '../../../utils/config'
import { createCommercialRemixTerms, SPGNFTContractAddress } from '../../../utils/utils'
import { IpMetadata } from '@story-protocol/core-sdk'
import { readMusicData, writeMusicData, type MusicData } from '../../../utils/storage'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  console.log('🚀 Starting music upload and IP registration process...')
  
  try {
    // Parse form data
    console.log('📦 Step 1: Parsing form data...')
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const artist = formData.get('artist') as string
    const description = formData.get('description') as string || ''
    const price = formData.get('price') as string || '0'
    const owner = formData.get('owner') as string
    // Ensure owner address is properly formatted as hex
    if (!owner.startsWith('0x')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid owner address format' 
      }, { status: 400 })
    }
    const audioFile = formData.get('audioFile') as File
    const imageFile = formData.get('imageFile') as File | null

    console.log('📋 Form data received:', { title, artist, description, price, owner })
    console.log('🎵 Audio file:', audioFile?.name, audioFile?.size, 'bytes')
    console.log('🖼️ Image file:', imageFile?.name, imageFile?.size, 'bytes')

    if (!title || !artist || !audioFile || !owner) {
      console.error('❌ Missing required fields')
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Step 2: Upload audio file to IPFS
    console.log('🌐 Step 2: Uploading audio file to IPFS...')
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    const audioIpfsHash = await uploadFileToIPFS(audioBuffer)
    const audioUrl = `https://ipfs.io/ipfs/${audioIpfsHash}`
    console.log('✅ Audio uploaded to IPFS:', audioUrl)

    // Step 3: Upload image file to IPFS (if provided)
    let imageUrl = ''
    let imageHash = ''
    if (imageFile) {
      console.log('🖼️ Step 3: Uploading image file to IPFS...')
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
      const imageIpfsHash = await uploadFileToIPFS(imageBuffer)
      imageUrl = `https://ipfs.io/ipfs/${imageIpfsHash}`
      imageHash = createHash('sha256').update(imageBuffer).digest('hex')
      console.log('✅ Image uploaded to IPFS:', imageUrl)
    } else {
      console.log('ℹ️ No image file provided, using default')
      imageUrl = 'https://via.placeholder.com/400x400?text=Music+NFT'
    }

    // Step 4: Create IP metadata
    console.log('📝 Step 4: Creating IP metadata...')
    const audioHash = createHash('sha256').update(audioBuffer).digest('hex')
    
    const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
      title: title,
      description: description || `A music track by ${artist}`,
      createdAt: Math.floor(Date.now() / 1000).toString(),
      creators: [
        {
          name: artist,
          address: owner as `0x${string}`, // Type assertion to ensure proper hex format
          contributionPercent: 100,
        },
      ],
      image: imageUrl,
      imageHash: imageHash ? `0x${imageHash}` : undefined,
      mediaUrl: audioUrl,
      mediaHash: `0x${audioHash}`,
      mediaType: audioFile.type || 'audio/mpeg',
    })
    console.log('✅ IP metadata created:', ipMetadata)

    // Step 5: Create NFT metadata
    console.log('🎨 Step 5: Creating NFT metadata...')
    const nftMetadata = {
      name: title,
      description: `${description || `A music track by ${artist}`} This NFT represents ownership of the IP Asset.`,
      image: imageUrl,
      animation_url: audioUrl,
      attributes: [
        {
          trait_type: 'Artist',
          value: artist,
        },
        {
          trait_type: 'Price',
          value: price === '0' ? 'Free' : `${price} IP`,
        },
        {
          trait_type: 'Owner',
          value: owner,
        },
        {
          trait_type: 'Created',
          value: new Date().toISOString(),
        },
      ],
    }
    console.log('✅ NFT metadata created:', nftMetadata)

    // Step 6: Upload metadata to IPFS
    console.log('📤 Step 6: Uploading metadata to IPFS...')
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')
    
    console.log('✅ IP metadata uploaded to IPFS:', `https://ipfs.io/ipfs/${ipIpfsHash}`)
    console.log('✅ NFT metadata uploaded to IPFS:', `https://ipfs.io/ipfs/${nftIpfsHash}`)

    // Step 7: Register IP Asset on Story Protocol
    console.log('🔗 Step 7: Registering IP Asset on Story Protocol...')
    console.log('📊 Registration parameters:', {
      spgNftContract: SPGNFTContractAddress,
      ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
      ipMetadataHash: `0x${ipHash}`,
      nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
      nftMetadataHash: `0x${nftHash}`,
    })

    const response = await client.ipAsset.mintAndRegisterIpAssetWithPilTerms({
      spgNftContract: SPGNFTContractAddress,
      licenseTermsData: [
        {
          terms: createCommercialRemixTerms({ 
            defaultMintingFee: parseFloat(price) || 1, 
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

    console.log('🎉 IP Asset registered successfully!')
    console.log('📋 Registration response:', {
      txHash: response.txHash,
      ipId: response.ipId,
      licenseTermsIds: response.licenseTermsIds,
    })

    const explorerUrl = `${networkInfo.protocolExplorer}/ipa/${response.ipId}`
    console.log('🌐 View on explorer:', explorerUrl)

    // Step 8: Save to local storage
    console.log('💾 Step 8: Saving to local storage...')
    const musicData: MusicData = {
      id: response.ipId || Date.now().toString(),
      title,
      artist,
      description,
      price,
      audioUrl,
      imageUrl,
      owner,
      metadataUrl: `https://ipfs.io/ipfs/${nftIpfsHash}`,
      createdAt: new Date().toISOString(),
      ipId: response.ipId,
      txHash: response.txHash,
    }

    const existingData = await readMusicData()
    existingData.push(musicData)
    await writeMusicData(existingData)
    console.log('✅ Data saved to storage')

    // Step 9: Return success response
    console.log('🚀 Process completed successfully!')
    return NextResponse.json({
      success: true,
      message: 'Music uploaded and IP registered successfully',
      data: musicData,
      ipId: response.ipId,
      txHash: response.txHash,
      explorerUrl,
      audioUrl,
      imageUrl,
      metadataUrl: `https://ipfs.io/ipfs/${nftIpfsHash}`,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })

  } catch (error) {
    console.error('💥 Error in upload process:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('💥 Error message:', error.message)
      console.error('💥 Error stack:', error.stack)
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }, { status: 500 })
  }
}
