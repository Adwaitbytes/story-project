'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from './components/Navigation'
import MusicPlayer from './components/MusicPlayer'
import { useWalletConnection } from './lib/useWalletConnection'

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
  hidden?: boolean
}

export default function Home() {
  const { address, isConnected, isMobile, connectWallet } = useWalletConnection()
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [myMusicNFTs, setMyMusicNFTs] = useState<MusicNFT[]>([])
  const [selectedTrack, setSelectedTrack] = useState<MusicNFT | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  // Use address from wagmi hook
  const account = address || ''
  const connected = isConnected

  // Load user's music NFTs only
  const loadMyMusicNFTs = async (userAddress: string) => {
    try {
      console.log('📂 Loading my music NFTs for:', userAddress)
      const response = await fetch('/api/get-music')
      const data = await response.json()
      console.log('📋 All music NFTs loaded:', data)

      if (data.success) {
        // Filter only music owned by the connected user
        const myMusic = (data.music || []).filter(
          (nft: MusicNFT) => nft.owner.toLowerCase() === userAddress.toLowerCase()
        )
        console.log('🎵 My music:', myMusic)
        setMyMusicNFTs(myMusic)
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will remove it from everywhere (home + explore). This action cannot be undone.`)) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/delete-music?id=${id}&owner=${account}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        showMessage(`✅ Successfully deleted "${title}"`, 'success')
        // Refresh the music list
        if (account) {
          await loadMyMusicNFTs(account)
        }
      } else {
        showMessage(`❌ Failed to delete: ${data.error}`, 'error')
      }
    } catch (error) {
      showMessage(`❌ Error deleting music: ${error}`, 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleHide = async (id: string, title: string, currentHiddenState: boolean) => {
    const action = currentHiddenState ? 'show' : 'hide'
    if (!confirm(`Are you sure you want to ${action} "${title}" from the explore page?`)) {
      return
    }

    setToggling(id)
    try {
      const res = await fetch(`/api/toggle-hide?id=${id}&owner=${account}`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        showMessage(
          `✅ ${data.hidden ? 'Hidden from explore page' : 'Now visible on explore page'}: "${title}"`,
          'success'
        )
        // Refresh the music list
        if (account) {
          await loadMyMusicNFTs(account)
        }
      } else {
        showMessage(`❌ Failed to ${action}: ${data.error}`, 'error')
      }
    } catch (error) {
      showMessage(`❌ Error toggling visibility: ${error}`, 'error')
    } finally {
      setToggling(null)
    }
  }

  // Load music when account changes
  useEffect(() => {
    if (connected && account) {
      loadMyMusicNFTs(account)
    } else {
      setMyMusicNFTs([])
    }
  }, [connected, account])

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
                  {isMobile ? '📱' : '🦊'} Connect Wallet to Start
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

      {/* My Music Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">
              My Music
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
              {connected 
                ? 'Your uploaded songs. You can delete them from here.'
                : 'Connect your wallet to see your uploads'}
            </p>

            {!connected ? (
              <div className="text-center py-16">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Connect your wallet to view and manage your uploaded music. You can also explore other artists' music in the Explore section.
                </p>
                <button
                  onClick={connectWallet}
                  className="btn-primary text-lg px-8 py-3 mx-auto"
                >
                  🦊 Connect Wallet
                </button>
                <div className="mt-8">
                  <button
                    onClick={() => window.location.href = '/explore'}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Or explore other artists' music →
                  </button>
                </div>
              </div>
            ) : myMusicNFTs.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  You Haven't Uploaded Any Songs Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Upload your first song to get started! You can also explore and listen to music from other artists.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => window.location.href = '/upload'}
                    className="btn-primary text-lg px-8 py-3"
                  >
                    🎵 Upload Your First Song
                  </button>
                  <button
                    onClick={() => window.location.href = '/explore'}
                    className="btn-secondary text-lg px-8 py-3"
                  >
                    🔍 Explore Songs
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myMusicNFTs.map((nft) => (
                  <motion.div
                    key={nft.id}
                    whileHover={{ y: -5 }}
                    className="card group cursor-pointer relative"
                    onClick={() => setSelectedTrack(nft)}
                  >
                    {/* Action Buttons Container */}
                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                      {/* Hide/Unhide Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleHide(nft.id, nft.title, nft.hidden || false)
                        }}
                        disabled={toggling === nft.id}
                        className={`${
                          nft.hidden
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-yellow-500 hover:bg-yellow-600'
                        } disabled:bg-gray-400 text-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100`}
                        title={nft.hidden ? 'Show on explore page' : 'Hide from explore page'}
                      >
                        {toggling === nft.id ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : nft.hidden ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(nft.id, nft.title)
                        }}
                        disabled={deleting === nft.id}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Delete this music"
                      >
                        {deleting === nft.id ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Hidden Badge */}
                    {nft.hidden && (
                      <div className="absolute top-3 left-3 z-10 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        🔒 Hidden from Explore
                      </div>
                    )}

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
