
import { useState, useEffect } from 'react'
import Head from 'next/head'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'

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
        showMessage('Music NFT uploaded and registered successfully!', 'success')
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
    } catch (error) {
      console.error('Error uploading:', error)
      showMessage('Error uploading music', 'error')
    } finally {
      setLoading(false)
    }
  }

  const purchaseLicense = async (musicNFT: MusicNFT) => {
    if (!account) {
      showMessage('Please connect your wallet first', 'error')
      return
    }

    if (!musicNFT.price || parseFloat(musicNFT.price) <= 0) {
      showMessage('This music is available for free use!', 'success')
      return
    }

    setLoading(true)
    
    try {
      // For now, we'll simulate a purchase since the IP registration isn't working yet
      showMessage(`License for "${musicNFT.title}" purchased for ${musicNFT.price} WIP!`, 'success')
      
      // TODO: Implement actual purchase logic with Story Protocol when ready
      // const response = await fetch('/api/purchase-license', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ipId: musicNFT.ipId,
      //     buyer: account,
      //     amount: 1,
      //     price: musicNFT.price
      //   }),
      // })

      // const result = await response.json()

      // if (response.ok) {
      //   showMessage('License purchased successfully!', 'success')
      // } else {
      //   showMessage(result.error || 'Error purchasing license', 'error')
      // }
    } catch (error) {
      console.error('Error purchasing license:', error)
      showMessage('Error purchasing license', 'error')
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
                  <label>License Price (in WIP tokens)</label>
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
                            <p className="price"><strong>License Price:</strong> {music.price} WIP</p>
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
                          <p className="ip-id">
                            <strong>IP ID:</strong> {music.ipId.substring(0, 20)}...
                          </p>
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
