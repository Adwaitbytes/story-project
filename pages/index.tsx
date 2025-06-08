import { useState, useEffect } from 'react'
import Head from 'next/head'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'
import { createHash } from 'crypto'

interface MusicNFT {
  id: string
  title: string
  artist: string
  description: string
  price: string
  audioUrl: string
  imageUrl: string
  owner: string
  ipId?: string
  licenseTermsIds?: string[]
  createdAt?: string
}

export default function Home() {
  const [account, setAccount] = useState<string>('')
  const [provider, setProvider] = useState<any>(null)
  const [ethereumProvider, setEthereumProvider] = useState<any>(null)
  const [musicNFTs, setMusicNFTs] = useState<MusicNFT[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  // Form state
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMusicNFTs, setFilteredMusicNFTs] = useState<MusicNFT[]>([])

  // Filter music based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMusicNFTs(musicNFTs)
    } else {
      const filtered = musicNFTs.filter(music => 
        music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        music.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        music.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMusicNFTs(filtered)
    }
  }, [musicNFTs, searchTerm])

  useEffect(() => {
    initializeWeb3()
    loadMusicNFTs()
  }, [])

  const initializeWeb3 = async () => {
    try {
      const ethereumProvider = await detectEthereumProvider()

      if (ethereumProvider) {
        const ethersProvider = new ethers.BrowserProvider(ethereumProvider as any)
        setProvider(ethersProvider)
        setEthereumProvider(ethereumProvider)

        // Check if already connected
        const accounts = await ethereumProvider.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAccount(accounts[0])
        }
      } else {
        showMessage('Please install MetaMask!', 'error')
      }
    } catch (error) {
      console.error('Error initializing Web3:', error)
      showMessage('Error initializing Web3', 'error')
    }
  }

  const connectWallet = async () => {
    try {
      if (!ethereumProvider) {
        showMessage('Please install MetaMask!', 'error')
        return
      }

      const accounts = await ethereumProvider.request({
        method: 'eth_requestAccounts',
      })

      setAccount(accounts[0])
      showMessage('Wallet connected successfully!', 'success')
    } catch (error) {
      console.error('Error connecting wallet:', error)
      showMessage('Error connecting wallet', 'error')
    }
  }

  const uploadMusicNFT = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!account) {
      showMessage('Please connect your wallet first', 'error')
      return
    }

    if (!audioFile || !title || !artist) {
      showMessage('Please fill in all required fields', 'error')
      return
    }

    setLoading(true)

    try {
      // Step 1: Upload to IPFS and create NFT metadata
      const formData = new FormData()
      formData.append('audioFile', audioFile)
      if (imageFile) formData.append('imageFile', imageFile)
      formData.append('title', title)
      formData.append('artist', artist)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('owner', account)

      const response = await fetch('/api/upload-music', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        showMessage('Music uploaded to IPFS! Now registering IP Asset...', 'success')

        // Step 2: Register IP Asset with user's wallet
        await registerIPAsset(result.musicNFT)

        showMessage('Music NFT uploaded and IP registered successfully!', 'success')
        // Reset form
        setTitle('')
        setArtist('')
        setDescription('')
        setPrice('')
        setAudioFile(null)
        setImageFile(null)
        // Reload music list
        loadMusicNFTs()
      } else {
        showMessage(result.error || 'Error uploading music', 'error')
      }
    } catch (error: any) {
      console.error('Error uploading:', error)
      if (error.message?.includes('pending request')) {
        showMessage('Please check MetaMask - there might be a pending request. Try again in a moment.', 'error')
      } else if (error.message?.includes('User rejected')) {
        showMessage('Transaction rejected by user', 'error')
      } else {
        showMessage(error.message || 'Error uploading music', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const switchToStoryNetwork = async () => {
    if (!ethereumProvider) {
      throw new Error('Wallet not connected')
    }

    const storyChainId = '0x523' // 1315 in hex

    try {
      // First check current chain
      const currentChain = await ethereumProvider.request({ method: 'eth_chainId' })
      if (currentChain === storyChainId) {
        return // Already on the right network
      }

      // Try to switch to the chain
      await ethereumProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: storyChainId }],
      })
    } catch (switchError: any) {
      // If the chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await ethereumProvider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: storyChainId,
              chainName: 'Story Aeneid Testnet',
              nativeCurrency: {
                name: 'IP',
                symbol: 'IP',
                decimals: 18,
              },
              rpcUrls: ['https://aeneid.storyrpc.io'],
              blockExplorerUrls: ['https://aeneid.storyscan.xyz'],
            }],
          })
        } catch (addError: any) {
          if (addError.code === -32002) {
            throw new Error('Please check MetaMask - there might be a pending request to add the network.')
          }
          throw addError
        }
      } else if (switchError.code === -32002) {
        throw new Error('Please check MetaMask - there might be a pending network request.')
      } else {
        throw switchError
      }
    }
  }

  const registerIPAsset = async (musicNFT: any) => {
    try {
      if (!provider || !ethereumProvider) {
        throw new Error('Wallet not connected')
      }

      showMessage('Please sign the transaction to register your IP Asset...', 'success')

      // Switch to Story Protocol testnet
      await switchToStoryNetwork()

      // Get the signer and their address
      const signer = await provider.getSigner()
      const signerAddress = await signer.getAddress()

      // Create metadata hash
      const metadata = {
        name: musicNFT.title,
        description: musicNFT.description,
        image: musicNFT.imageUrl,
        audio: musicNFT.audioUrl,
        attributes: [
          { trait_type: 'Artist', value: musicNFT.artist },
          { trait_type: 'Title', value: musicNFT.title },
          { trait_type: 'License Price', value: musicNFT.price || '0' }
        ]
      }

      // Create a wallet client for viem
      const { createWalletClient, custom, http } = await import('viem')
      const { aeneid } = await import('@story-protocol/core-sdk')

      const walletClient = createWalletClient({
        account: signerAddress as `0x${string}`,
        chain: aeneid,
        transport: custom(ethereumProvider)
      })

      // Create Story Protocol client with the wallet client
      const { StoryClient } = await import('@story-protocol/core-sdk')

      const clientConfig = {
        account: walletClient.account,
        transport: http('https://aeneid.storyrpc.io'),
        chainId: 'aeneid' as const
      }

      const storyClient = StoryClient.newClient(clientConfig)

      const licensePrice = musicNFT.price ? parseFloat(musicNFT.price) * 1e18 : 0

      const ipResponse = await storyClient.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc',
        licenseTermsData: [
          {
            terms: {
              transferable: true,
              royaltyPolicy: '0x0000000000000000000000000000000000000000' as `0x${string}`,
              defaultMintingFee: BigInt(licensePrice),
              expiration: BigInt(0),
              commercialUse: true,
              commercialAttribution: false,
              commercializerChecker: '0x0000000000000000000000000000000000000000' as `0x${string}`,
              commercializerCheckerData: '0x' as `0x${string}`,
              commercialRevShare: 500, // 5%
              derivativesAllowed: true,
              derivativesAttribution: true,
              derivativesApproval: false,
              derivativesReciprocal: true,
              territory: [],
              distributionChannels: [],
              contentRestrictions: []
            }
          }
        ],
        ipMetadata: {
          ipMetadataURI: `https://ipfs.io/ipfs/${musicNFT.metadataUrl}`,
          ipMetadataHash: `0x${createHash('sha256').update(JSON.stringify(metadata)).digest('hex')}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${musicNFT.metadataUrl}`,
          nftMetadataHash: `0x${createHash('sha256').update(JSON.stringify(metadata)).digest('hex')}`
        },
        txOptions: { waitForTransaction: true }
      })

      console.log('IP Asset registered:', ipResponse)

      // Update stored music with IP information
      musicNFT.ipId = ipResponse.ipId
      musicNFT.licenseTermsIds = ipResponse.licenseTermsIds

      return ipResponse
    } catch (error: any) {
      console.error('IP registration error:', error)
      if (error.message?.includes('pending request')) {
        showMessage('Please check MetaMask - there might be a pending request. Music uploaded but IP registration failed.', 'error')
      } else if (error.message?.includes('User rejected')) {
        showMessage('Transaction rejected by user. Music uploaded but IP registration failed.', 'error')
      } else {
        showMessage(`Failed to register IP Asset: ${error.message || 'Unknown error'}. Music uploaded but not registered.`, 'error')
      }
      throw error
    }
  }

  const purchaseLicense = async (musicNFT: MusicNFT) => {
    if (!account) {
      showMessage('Please connect your wallet first', 'error')
      return
    }

    if (!musicNFT.ipId) {
      showMessage('This music is not registered as an IP Asset yet', 'error')
      return
    }

    if (!musicNFT.price || parseFloat(musicNFT.price) <= 0) {
      showMessage('This music is available for free use!', 'success')
      return
    }

    setLoading(true)

    try {
      if (!provider || !ethereumProvider) {
        throw new Error('Wallet not connected')
      }

      showMessage('Please sign the transaction to purchase the license...', 'success')

      // Switch to Story Protocol testnet
      await switchToStoryNetwork()

      // Get the signer and their address
      const signer = await provider.getSigner()
      const signerAddress = await signer.getAddress()

      // Create a wallet client for viem
      const { createWalletClient, custom, http } = await import('viem')
      const { aeneid } = await import('@story-protocol/core-sdk')

      const walletClient = createWalletClient({
        account: signerAddress as `0x${string}`,
        chain: aeneid,
        transport: custom(ethereumProvider)
      })

      // Create Story Protocol client with the wallet client
      const { StoryClient } = await import('@story-protocol/core-sdk')

      const clientConfig = {
        account: walletClient.account,
        transport: http('https://aeneid.storyrpc.io'),
        chainId: 'aeneid' as const
      }

      const storyClient = StoryClient.newClient(clientConfig)

      // Mint license token
      const licensePrice = BigInt(parseFloat(musicNFT.price) * 1e18)

      const mintResponse = await storyClient.license.mintLicenseTokens({
        licenseTermsId: musicNFT.licenseTermsIds?.[0] || '1',
        licensorIpId: musicNFT.ipId!,
        amount: 1,
        maxMintingFee: licensePrice,
        maxRevenueShare: 100,
        txOptions: { waitForTransaction: true }
      })

      console.log('License purchased:', mintResponse)
      showMessage(`License for "${musicNFT.title}" purchased successfully for ${musicNFT.price} IP tokens!`, 'success')

    } catch (error: any) {
      console.error('Error purchasing license:', error)
      if (error.message?.includes('insufficient funds')) {
        showMessage(`Insufficient IP tokens. You need ${musicNFT.price} IP tokens to purchase this license.`, 'error')
      } else {
        showMessage('Error purchasing license. Please try again.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMusicNFTs = async () => {
    try {
      const response = await fetch('/api/get-music')
      const data = await response.json()

      if (response.ok) {
        setMusicNFTs(data.music || [])
      }
    } catch (error) {
      console.error('Error loading music:', error)
    }
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 5000)
  }

  return (
    <>
      <Head>
        <title>Story Music dApp</title>
        <meta name="description" content="Music NFT platform using Story Protocol" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="header">
        <div className="container">
          <h1>🎵 Story Music dApp</h1>
        </div>
      </div>

      <div className="container">
        {message && (
          <div className={messageType === 'success' ? 'success' : 'error'}>
            {message}
          </div>
        )}

        {!account ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Connect Your Wallet</h2>
            <p>Connect your MetaMask wallet to upload and license music NFTs</p>
            <button onClick={connectWallet} className="btn">
              Connect MetaMask
            </button>
          </div>
        ) : (
          <>
            <div className="wallet-info">
              <strong>Connected Wallet:</strong> {account}
            </div>

            <div className="upload-form">
              <h2>Upload Music NFT</h2>
              <form onSubmit={uploadMusicNFT}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Artist *</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>License Price (in IP tokens)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1.0"
                  />
                </div>

                <div className="form-group">
                  <label>Audio File *</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </div>

                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload & Register NFT'}
                </button>
              </form>
            </div>

            <div>
              <h2>Music Library ({musicNFTs.length} tracks)</h2>

              {musicNFTs.length > 0 && (
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search by title, artist, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              )}

              {musicNFTs.length === 0 ? (
                <p>No music NFTs available yet. Upload the first one!</p>
              ) : filteredMusicNFTs.length === 0 ? (
                <p>No music found matching your search.</p>
              ) : (
                <div className="music-grid">
                  {filteredMusicNFTs.map((music) => (
                    <div key={music.id} className="music-card">
                      {music.imageUrl && (
                        <img 
                          src={`https://gateway.pinata.cloud/ipfs/${music.imageUrl}`} 
                          alt={music.title}
                          className="music-image"
                        />
                      )}

                      <div className="music-info">
                        <h3>{music.title}</h3>
                        <p className="artist-name"><strong>Artist:</strong> {music.artist}</p>
                        <p className="owner-info"><strong>Owner:</strong> {music.owner.substring(0, 10)}...</p>
                        {music.description && <p className="description">{music.description}</p>}

                        {music.audioUrl && (
                          <div className="audio-player">
                            <audio controls>
                              <source src={`https://gateway.pinata.cloud/ipfs/${music.audioUrl}`} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}

                        <div className="price-and-actions">
                          {music.price && parseFloat(music.price) > 0 && (
                            <p className="price"><strong>License Price:</strong> {music.price} IP</p>
                          )}

                          <div className="action-buttons">
                            {music.owner.toLowerCase() !== account.toLowerCase() ? (
                              <button 
                                onClick={() => purchaseLicense(music)}
                                className="btn btn-primary"
                                disabled={loading}
                              >
                                {loading ? 'Processing...' : 'Purchase License'}
                              </button>
                            ) : (
                              <span className="owner-badge">You own this</span>
                            )}
                          </div>
                        </div>

                        {music.ipId && (
                          <div className="blockchain-info">
                            <p className="ip-id">
                              <strong>IP ID:</strong> 
                              <span className="address">{music.ipId}</span>
                            </p>
                            {music.licenseTermsIds && music.licenseTermsIds.length > 0 && (
                              <p className="license-terms">
                                <strong>License Terms ID:</strong> {music.licenseTermsIds[0]}
                              </p>
                            )}
                          </div>
                        )}

                        <p className="upload-date">
                          <strong>Created:</strong> {new Date(music.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}