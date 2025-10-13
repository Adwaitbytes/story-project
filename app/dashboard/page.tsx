'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import Link from 'next/link'
import { useWalletConnection } from '../lib/useWalletConnection'

interface MusicStats {
  totalUploads: number
  totalViews: number
  totalEarnings: number
  recentUploads: Array<{
    id: string
    title: string
    artist: string
    createdAt: string
    ipId: string
    views: number
  }>
}

export default function DashboardPage() {
  const { address, isConnected, connectWallet } = useWalletConnection()
  const [stats, setStats] = useState<MusicStats>({
    totalUploads: 0,
    totalViews: 0,
    totalEarnings: 0,
    recentUploads: []
  })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Use wallet hook values
  const account = address || ''
  const connected = isConnected

  useEffect(() => {
    if (connected && account) {
      loadUserStats(account)
    }
    setLoading(false)
  }, [connected, account])

  const loadUserStats = async (userAddress: string) => {
    try {
      const response = await fetch('/api/get-music')
      const data = await response.json()

      if (data.success) {
        const userMusic = data.music.filter((item: any) => 
          item.owner.toLowerCase() === userAddress.toLowerCase()
        )

        // Calculate stats
        const totalUploads = userMusic.length
        const totalViews = userMusic.reduce((sum: number, item: any) => sum + (item.views || 0), 0)
        const totalEarnings = userMusic.reduce((sum: number, item: any) => 
          sum + (parseFloat(item.price) || 0), 0
        )

        // Get recent uploads
        const recentUploads = userMusic
          .sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            artist: item.artist,
            createdAt: item.createdAt,
            ipId: item.ipId,
            views: item.views || 0
          }))

        setStats({
          totalUploads,
          totalViews,
          totalEarnings,
          recentUploads
        })
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/delete-music?id=${id}&owner=${account}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        alert(`✅ Successfully deleted "${title}"`)
        // Refresh the stats
        loadUserStats(account)
      } else {
        alert(`❌ Failed to delete: ${data.error}`)
      }
    } catch (error) {
      alert(`❌ Error deleting music: ${error}`)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-24">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
                Connect Your Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Connect your wallet to view your music dashboard
              </p>
              <button
                onClick={connectWallet}
                className="btn-primary text-lg px-8 py-3"
              >
                🦊 Connect Wallet
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <Link
                href="/upload"
                className="btn-primary"
              >
                Upload New Music
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Total Uploads
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalUploads}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Total Views
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalViews}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Total Earnings
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalEarnings} IP
                </p>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Uploads
                </h2>
                {stats.recentUploads.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No music uploaded yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Artist
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Upload Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {stats.recentUploads.map((upload) => (
                          <tr key={upload.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {upload.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {upload.artist}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(upload.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {upload.views}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              <a
                                href={`https://aeneid.explorer.story.foundation/ipa/${upload.ipId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-block"
                              >
                                View ↗
                              </a>
                              <button
                                onClick={() => handleDelete(upload.id, upload.title)}
                                disabled={deleting === upload.id}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:text-gray-400 inline-block"
                              >
                                {deleting === upload.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/ai"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  AI Music Assistant
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Generate lyrics and album artwork using AI
                </p>
              </Link>

              <Link
                href="/explore"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Explore Music
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Discover new music from other artists
                </p>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
} 