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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Music Assistant
              </h1>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Generate lyrics and album artwork for your music using AI
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-primary w-full"
                    placeholder="Enter song title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="input-primary w-full"
                    placeholder="Enter artist name"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => generateContent('lyrics')}
                  disabled={loading === 'lyrics'}
                  className="btn-primary flex-1"
                >
                  {loading === 'lyrics' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Lyrics...
                    </span>
                  ) : (
                    'Generate Lyrics'
                  )}
                </button>
                <button
                  onClick={() => generateContent('image')}
                  disabled={loading === 'image'}
                  className="btn-secondary flex-1"
                >
                  {loading === 'image' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Artwork...
                    </span>
                  ) : (
                    'Generate Album Artwork'
                  )}
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              {lyrics && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Generated Lyrics</h3>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={copyToClipboard}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
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
                        className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        Create with Suno AI
                      </a>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {lyrics}
                  </pre>
                </div>
              )}

              {imagePrompt && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Image Generation Prompt</h3>
                    <p className="text-gray-700 dark:text-gray-300">{imagePrompt}</p>
                  </div>

                  {generatedImage && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">Generated Album Artwork</h3>
                      <div className="relative aspect-square max-w-md mx-auto mb-4">
                        <Image
                          src={generatedImage}
                          alt="Generated album artwork"
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <button
                        onClick={downloadImage}
                        className="btn-primary w-full"
                      >
                        Download Image
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
} 