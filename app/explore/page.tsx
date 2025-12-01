'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  hidden?: boolean
}

export default function ExplorePage() {
  const [musicNFTs, setMusicNFTs] = useState<MusicNFT[]>([])
  const [selectedTrack, setSelectedTrack] = useState<MusicNFT | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMusic = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/get-music')
      const data = await res.json()
      if (data.success) {
        // Filter out hidden tracks from explore page
        const visibleMusic = (data.music || []).filter((nft: MusicNFT) => !nft.hidden)
        setMusicNFTs(visibleMusic)
      }
    } catch (error) {
      console.error('Error fetching music:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMusic()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
      <Navigation />

      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-1/2 translate-x-1/2 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
      </div>

      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white text-glow">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Music NFTs</span>
            </h1>
            <p className="text-story-text-secondary text-lg max-w-2xl mx-auto">
              Discover unique music IP assets registered on Story Protocol.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : musicNFTs.length === 0 ? (
            <div className="glass-panel rounded-3xl p-16 text-center max-w-2xl mx-auto">
              <p className="text-story-text-secondary text-lg">
                No music NFTs found. Be the first to upload!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {musicNFTs.map((nft) => (
                <motion.div
                  key={nft.id}
                  whileHover={{ y: -8 }}
                  className="card group cursor-pointer relative overflow-hidden"
                  onClick={() => setSelectedTrack(nft)}
                >
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative aspect-square rounded-xl overflow-hidden mb-5">
                    <img
                      src={nft.imageUrl}
                      alt={nft.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />

                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {nft.title}
                    </h3>
                    <p className="text-sm text-story-text-secondary">
                      by {nft.artist}
                    </p>

                    {nft.description && (
                      <p className="text-sm text-story-text-secondary/80 line-clamp-2">
                        {nft.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                      <span className="text-blue-400 font-medium">
                        {nft.price && nft.price !== '0' ? `${nft.price} IP` : 'Free'}
                      </span>
                      {nft.ipId && (
                        <a
                          href={`https://aeneid.explorer.story.foundation/ipa/${nft.ipId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-story-text-secondary hover:text-white transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View IP Asset ↗
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Music Player Modal */}
      <AnimatePresence>
        {selectedTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTrack(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
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
      </AnimatePresence>
    </div>
  )
}