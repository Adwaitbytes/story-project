'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navigation from '../components/Navigation'
import { useWalletConnection } from '../lib/useWalletConnection'

export default function UploadPage() {
  const router = useRouter()
  const { address, isConnected, connectWallet } = useWalletConnection()
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // Use wallet hook values
  const account = address || ''
  const connected = isConnected

  // Form states
  const [title, setTitle] = useState<string>('')
  const [artist, setArtist] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [price, setPrice] = useState<string>('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string>('')
  const [imagePreview, setImagePreview] = useState<string>('')

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet()
      showMessage('Wallet connected successfully!', 'success')
    } catch (error) {
      showMessage('Failed to connect wallet', 'error')
    }
  }

  // Handle file changes
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setAudioPreview(URL.createObjectURL(file))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
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

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('artist', artist)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('owner', account)
      formData.append('audioFile', audioFile)
      if (imageFile) {
        formData.append('imageFile', imageFile)
      }

      const response = await fetch('/api/upload-music', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
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
        setAudioPreview('')
        setImagePreview('')

        // Redirect to explore page after 2 seconds
        setTimeout(() => {
          router.push('/explore')
        }, 2000)
      } else {
        showMessage(data.error || 'Upload failed', 'error')
      }
    } catch (error) {
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
      <Navigation />

      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
      </div>

      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white text-glow">
                Upload Your Music
              </h1>
              <p className="text-story-text-secondary">
                Create an IP asset on Story Protocol and share your music with the world.
              </p>
            </div>

            {!connected ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.59-4.18" />
                  </svg>
                </div>
                <p className="text-gray-300 mb-8 max-w-md mx-auto">
                  Connect your wallet to start uploading music and registering IP assets on the blockchain.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConnectWallet}
                  className="btn-primary px-8 py-3"
                >
                  Connect Wallet
                </motion.button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleUpload}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 ml-1">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      placeholder="Enter track title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 ml-1">
                      Artist <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      placeholder="Enter artist name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 ml-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                    placeholder="Tell us about your music..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 ml-1">
                    Price (IP Tokens)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      placeholder="0.00"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                      IP
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 ml-1">
                      Audio File <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer"
                      />
                      {audioPreview && (
                        <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/5">
                          <audio
                            controls
                            className="w-full h-8"
                            src={audioPreview}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 ml-1">
                      Cover Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition-all cursor-pointer"
                      />
                      {imagePreview && (
                        <div className="mt-4 relative aspect-square w-32 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                          <img
                            src={imagePreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-4 text-lg font-semibold shadow-lg shadow-blue-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading & Registering IP...
                      </span>
                    ) : (
                      '🚀 Upload & Register IP Asset'
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </motion.div>
        </div>
      </main>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border ${messageType === 'success'
              ? 'bg-green-500/20 border-green-500/30 text-green-200'
              : 'bg-red-500/20 border-red-500/30 text-red-200'
              }`}
          >
            <div className="flex items-center gap-3">
              {messageType === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 