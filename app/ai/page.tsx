'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import Image from 'next/image'

export default function AIPage() {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [loading, setLoading] = useState<'lyrics' | 'image' | null>(null)
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  const generateContent = async (type: 'lyrics' | 'image') => {
    if (!title || !artist) {
      setError('Please enter both title and artist')
      return
    }

    setLoading(type)
    setError('')

    try {
      const prompt = type === 'lyrics'
        ? `Generate lyrics for a song titled "${title}" by ${artist}`
        : `Generate a detailed prompt for creating an album cover artwork for a song titled "${title}" by ${artist}. The prompt should be descriptive and suitable for image generation.`

      const response = await fetch('/api/perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, prompt })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate content')
      }

      if (type === 'lyrics') {
        setLyrics(data.content)
      } else {
        setImagePrompt(data.content)
        // Generate image using the prompt
        const imageResponse = await fetch('/api/perplexity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'image_generation',
            prompt: data.content
          })
        })

        const imageData = await imageResponse.json()
        if (imageData.success) {
          setGeneratedImage(imageData.imageUrl)
        } else {
          throw new Error('Failed to generate image')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setLoading(null)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(lyrics)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      setError('Failed to copy lyrics')
    }
  }

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `${title}-${artist}-album-art.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
      <Navigation />

      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
      </div>

      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-glow">
                AI Music Assistant
              </h1>
              <p className="text-story-text-secondary text-lg">
                Generate lyrics and album artwork for your music using AI
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-8 shadow-2xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 ml-1">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="Enter song title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 ml-1">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="Enter artist name"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => generateContent('lyrics')}
                  disabled={loading === 'lyrics'}
                  className="btn-primary flex-1 py-4 text-lg font-medium shadow-lg shadow-blue-500/20"
                >
                  {loading === 'lyrics' ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Lyrics...
                    </span>
                  ) : (
                    '✨ Generate Lyrics'
                  )}
                </button>
                <button
                  onClick={() => generateContent('image')}
                  disabled={loading === 'image'}
                  className="btn-secondary flex-1 py-4 text-lg font-medium"
                >
                  {loading === 'image' ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Artwork...
                    </span>
                  ) : (
                    '🎨 Generate Artwork'
                  )}
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}

              {lyrics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/20 rounded-xl p-6 border border-white/5"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Generated Lyrics</h3>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={copyToClipboard}
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center transition-colors"
                      >
                        {copySuccess ? (
                          <>
                            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copy Lyrics
                          </>
                        )}
                      </button>
                      <a
                        href="https://suno.com/create"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-400 hover:text-green-300 flex items-center transition-colors"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        Create with Suno AI
                      </a>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap text-story-text-secondary font-mono text-sm leading-relaxed">
                    {lyrics}
                  </pre>
                </motion.div>
              )}

              {imagePrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4">Image Generation Prompt</h3>
                    <p className="text-story-text-secondary leading-relaxed">{imagePrompt}</p>
                  </div>

                  {generatedImage && (
                    <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                      <h3 className="text-xl font-bold text-white mb-6">Generated Album Artwork</h3>
                      <div className="relative aspect-square max-w-md mx-auto mb-6 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                        <Image
                          src={generatedImage}
                          alt="Generated album artwork"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        onClick={downloadImage}
                        className="btn-primary w-full py-3"
                      >
                        Download Image
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}