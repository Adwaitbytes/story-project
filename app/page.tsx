
'use client'

import React, { useState, useEffect } from 'react'

// Types
interface MusicNFT {
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

export default function Home() {
  const [account, setAccount] = useState<string>('')
  const [connected, setConnected] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // Form states
  const [title, setTitle] = useState<string>('')
  const [artist, setArtist] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Music NFTs
  const [musicNFTs, setMusicNFTs] = useState<MusicNFT[]>([])

  // Connect wallet
  const connectWallet = async () => {
    try {
      console.log('🔗 Attempting to connect wallet...')
      
      if (typeof window.ethereum !== 'undefined') {
        console.log('✅ MetaMask detected')
        
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        console.log('📱 Accounts received:', accounts)

        if (accounts.length > 0) {
          setAccount(accounts[0])
          setConnected(true)
          console.log('🎉 Wallet connected successfully:', accounts[0])
          showMessage('Wallet connected successfully!', 'success')
          
          // Check network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          console.log('🌐 Current chain ID:', chainId)
        }
      } else {
        console.error('❌ MetaMask not detected')
        showMessage('Please install MetaMask!', 'error')
      }
    } catch (error) {
      console.error('💥 Error connecting wallet:', error)
      showMessage('Failed to connect wallet', 'error')
    }
  }

  // Load music NFTs
  const loadMusicNFTs = async () => {
    try {
      console.log('📂 Loading music NFTs...')
      const response = await fetch('/api/get-music')
      const data = await response.json()
      console.log('📋 Music NFTs loaded:', data)

      if (data.success) {
        setMusicNFTs(data.music || [])
      }
    } catch (error) {
      console.error('💥 Error loading music NFTs:', error)
    }
  }

  // Upload music and register IP
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connected) {
      showMessage('Please connect your wallet first', 'error')
      return
    }

    if (!audioFile || !title || !artist) {
      showMessage('Please fill in all required fields', 'error')
      return
    }

    setLoading(true)
    console.log('🚀 Starting upload and IP registration process...')
    console.log('📊 Form data:', { title, artist, description, price, owner: account })

    try {
      // Step 1: Create FormData
      console.log('📦 Step 1: Preparing form data...')
      const formData = new FormData()
      formData.append('title', title)
      formData.append('artist', artist)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('owner', account)
      formData.append('audioFile', audioFile)
      if (imageFile) {
        formData.append('imageFile', imageFile)
        console.log('🖼️ Image file included:', imageFile.name)
      }

      console.log('📤 Step 2: Uploading to IPFS and registering IP...')
      
      // Step 2: Upload and register
      const response = await fetch('/api/upload-music', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      console.log('📨 API Response:', data)

      if (data.success) {
        console.log('🎉 SUCCESS! Music NFT uploaded and IP registered!')
        console.log('🆔 IP ID:', data.ipId)
        console.log('🔗 Transaction Hash:', data.txHash)
        console.log('🌐 Explorer URL:', data.explorerUrl)
        
        showMessage(
          `Music NFT uploaded and IP registered successfully! IP ID: ${data.ipId}`, 
          'success'
        )
        
        // Reset form
        setTitle('')
        setArtist('')
        setDescription('')
        setPrice('')
        setAudioFile(null)
        setImageFile(null)
        
        // Clear file inputs
        const audioInput = document.querySelector('input[type="file"][accept="audio/*"]') as HTMLInputElement
        const imageInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement
        if (audioInput) audioInput.value = ''
        if (imageInput) imageInput.value = ''
        
        // Refresh music list
        loadMusicNFTs()
      } else {
        console.error('❌ Upload failed:', data.error)
        showMessage(data.error || 'Upload failed', 'error')
      }
    } catch (error) {
      console.error('💥 Upload error:', error)
      showMessage('Upload failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 8000)
  }

  // Load music on component mount
  useEffect(() => {
    loadMusicNFTs()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('👤 Account changed:', accounts)
        if (accounts.length === 0) {
          setConnected(false)
          setAccount('')
          console.log('🔌 Wallet disconnected')
        } else {
          setAccount(accounts[0])
          console.log('🔄 Account switched to:', accounts[0])
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">🎵 Story Music dApp</h1>
          <p className="text-center mt-2 text-blue-100">Upload music, register IP on Story Protocol</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Wallet Connection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🦊 MetaMask Connection</h2>
          {!connected ? (
            <div>
              <p className="text-gray-600 mb-4">Connect your MetaMask wallet to start uploading music and registering IP assets</p>
              <button
                onClick={connectWallet}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                🦊 Connect MetaMask
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                ✅ Connected
              </div>
              <div className="text-sm text-gray-600">
                <strong>Address:</strong> {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>
          )}
        </div>

        {/* Upload Form */}
        {connected && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">🎵 Upload Music & Register IP</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter music title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Artist *</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter artist name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter music description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (IP tokens)</label>
                <input
                  type="number"
                  step="0.001"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.0"
                />
                <p className="text-xs text-gray-500 mt-1">Price in native IP tokens</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audio File *</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                {loading ? '⏳ Uploading & Registering IP...' : '🚀 Upload & Register IP on Story'}
              </button>
            </form>
          </div>
        )}

        {/* Music NFTs Gallery */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🎨 Music IP Gallery</h2>

          {musicNFTs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No music IP assets registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {musicNFTs.map((nft) => (
                <div key={nft.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition duration-200">
                  {nft.imageUrl && (
                    <img 
                      src={nft.imageUrl.startsWith('http') ? nft.imageUrl : `https://ipfs.io/ipfs/${nft.imageUrl}`} 
                      alt={nft.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        console.log('Image load error, trying alternative:', nft.imageUrl)
                        const target = e.target as HTMLImageElement
                        if (!target.src.includes('placeholder')) {
                          target.src = 'https://via.placeholder.com/400x400?text=Music+NFT'
                        }
                      }}
                    />
                  )}

                  <h3 className="font-semibold text-lg mb-2">{nft.title}</h3>
                  <p className="text-gray-600 mb-2">by {nft.artist}</p>

                  {nft.description && (
                    <p className="text-gray-500 text-sm mb-3">{nft.description}</p>
                  )}

                  {nft.price && nft.price !== '0' && (
                    <p className="text-blue-600 font-medium mb-3">{nft.price} IP</p>
                  )}

                  <audio controls className="w-full mb-3">
                    <source src={nft.audioUrl.startsWith('http') ? nft.audioUrl : `https://ipfs.io/ipfs/${nft.audioUrl}`} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>

                  <div className="text-xs text-gray-400">
                    <p>Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</p>
                    <p>Created: {new Date(nft.createdAt).toLocaleDateString()}</p>
                    {nft.ipId && (
                      <p className="text-green-600">IP ID: {nft.ipId.slice(0, 10)}...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
