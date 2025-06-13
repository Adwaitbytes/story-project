'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from './components/Navigation'
import MusicPlayer from './components/MusicPlayer'

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
  const [musicNFTs, setMusicNFTs] = useState<MusicNFT[]>([])
  const [selectedTrack, setSelectedTrack] = useState<MusicNFT | null>(null)

  // Connect wallet
  const connectWallet = async () => {
    try {
      console.log('🔗 Attempting to connect wallet...')
      
      if (typeof window.ethereum !== 'undefined') {
        console.log('✅ MetaMask detected')
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        console.log('📱 Accounts received:', accounts)

        if (accounts.length > 0) {
          setAccount(accounts[0])
          setConnected(true)
          console.log('🎉 Wallet connected successfully:', accounts[0])
          showMessage('Wallet connected successfully!', 'success')
          
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
    const ethereum = typeof window !== 'undefined' ? window.ethereum : undefined;
    
    if (ethereum) {
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

      ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-900/20 dark:to-purple-900/20" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Next Generation Music IP Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Upload, discover, and monetize your music with AI-powered features and blockchain technology
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!connected ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectWallet}
                  className="btn-primary text-lg px-8 py-3"
                >
                  🦊 Connect Wallet to Start
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/upload'}
                  className="btn-primary text-lg px-8 py-3"
                >
                  🎵 Upload Your Music
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/explore'}
                className="btn-secondary text-lg px-8 py-3"
              >
                🔍 Explore Music
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Music Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">
              Featured Music
            </h2>

            {musicNFTs.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No music IP assets registered yet. Be the first to upload!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {musicNFTs.map((nft) => (
                  <motion.div
                    key={nft.id}
                    whileHover={{ y: -5 }}
                    className="card group cursor-pointer"
                    onClick={() => setSelectedTrack(nft)}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                      <img
                        src={nft.imageUrl}
                        alt={nft.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                    </div>

                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {nft.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      by {nft.artist}
                    </p>

                    {nft.description && (
                      <p className="text-gray-500 dark:text-gray-500 text-sm mb-3 line-clamp-2">
                        {nft.description}
                      </p>
                    )}

                    {nft.price && nft.price !== '0' && (
                      <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                        {nft.price} IP
                      </p>
                    )}

                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      <p>Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</p>
                      <p>Created: {new Date(nft.createdAt).toLocaleDateString()}</p>
                      {nft.ipId && (
                        <a
                          href={`https://aeneid.explorer.story.foundation/ipa/${nft.ipId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-2 inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on Story Protocol Explorer ↗
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Music Player Modal */}
      {selectedTrack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTrack(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <MusicPlayer
              audioUrl={selectedTrack.audioUrl}
              title={selectedTrack.title}
              artist={selectedTrack.artist}
              imageUrl={selectedTrack.imageUrl}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Message Toast */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            messageType === 'success' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' 
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
          }`}
        >
          {message}
        </motion.div>
      )}
    </div>
  )
}
