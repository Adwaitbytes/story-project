'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import MusicPlayer from '../components/MusicPlayer'

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

export default function ExplorePage() {
  const [musicNFTs, setMusicNFTs] = useState<MusicNFT[]>([])
  const [selectedTrack, setSelectedTrack] = useState<MusicNFT | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMusic = async () => {
      setLoading(true)
      const res = await fetch('/api/get-music')
      const data = await res.json()
      if (data.success) setMusicNFTs(data.music)
      setLoading(false)
    }
    fetchMusic()
  }, [])

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Explore Music NFTs
          </motion.h1>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : musicNFTs.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No music NFTs found. Be the first to upload!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {musicNFTs.map((nft) => (
                <motion.div
                  key={nft.id}
                  whileHover={{ y: -5, scale: 1.03 }}
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
        </div>
      </main>
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
    </div>
  )
} 