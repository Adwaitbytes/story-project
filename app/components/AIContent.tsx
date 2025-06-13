'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface AIContentProps {
  title: string
  artist: string
}

export default function AIContent({ title, artist }: AIContentProps) {
  const [lyrics, setLyrics] = useState<string>('')
  const [imagePrompt, setImagePrompt] = useState<string>('')
  const [loading, setLoading] = useState<'lyrics' | 'image' | null>(null)
  const [error, setError] = useState<string>('')

  const generateContent = async (type: 'lyrics' | 'image') => {
    setLoading(type)
    setError('')

    try {
      const prompt = type === 'lyrics' 
        ? `Generate lyrics for a song titled "${title}" by ${artist}`
        : `Generate an album cover image prompt for a song titled "${title}" by ${artist}`

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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Lyrics Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">AI-Generated Lyrics</h3>
        {!lyrics ? (
          <button
            onClick={() => generateContent('lyrics')}
            disabled={loading === 'lyrics'}
            className="btn-primary w-full"
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
        ) : (
          <div className="space-y-4">
            <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-mono text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              {lyrics}
            </pre>
            <button
              onClick={() => generateContent('lyrics')}
              disabled={loading === 'lyrics'}
              className="btn-secondary w-full"
            >
              Regenerate Lyrics
            </button>
          </div>
        )}
      </div>

      {/* Image Prompt Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">AI Image Prompt</h3>
        {!imagePrompt ? (
          <button
            onClick={() => generateContent('image')}
            disabled={loading === 'image'}
            className="btn-primary w-full"
          >
            {loading === 'image' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Image Prompt...
              </span>
            ) : (
              'Generate Image Prompt'
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">{imagePrompt}</p>
            </div>
            <button
              onClick={() => generateContent('image')}
              disabled={loading === 'image'}
              className="btn-secondary w-full"
            >
              Regenerate Prompt
            </button>
          </div>
        )}
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
    </div>
  )
} 