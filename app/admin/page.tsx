'use client'

import { useState, useEffect, Fragment } from 'react'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import MusicPlayer from '../components/MusicPlayer'
import { useWalletConnection } from '../lib/useWalletConnection'

interface AdminComment {
  id: string
  admin: string
  comment: string
  timestamp: string
  read: boolean
}

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
  adminComments?: AdminComment[]
}

// ADMIN WALLET ADDRESS - Change this to your wallet address
const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase() || '0xYourAdminWalletAddress'.toLowerCase()

export default function AdminPage() {
  const { address, isConnected, connectWallet } = useWalletConnection()
  const [allMusic, setAllMusic] = useState<MusicNFT[]>([])
  const [filteredMusic, setFilteredMusic] = useState<MusicNFT[]>([])
  const [selectedTrack, setSelectedTrack] = useState<MusicNFT | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [commentingOn, setCommentingOn] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const account = address || ''
  const isAdmin = account.toLowerCase() === ADMIN_WALLET

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const fetchAllMusic = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/get-music')
      const data = await res.json()
      if (data.success) {
        const sortedMusic = (data.music || []).sort((a: MusicNFT, b: MusicNFT) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setAllMusic(sortedMusic)
        setFilteredMusic(sortedMusic)
      }
    } catch (error) {
      console.error('Error fetching music:', error)
      showMessage('Failed to load music', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isConnected && isAdmin) {
      fetchAllMusic()
    }
  }, [isConnected, isAdmin])

  useEffect(() => {
    let filtered = allMusic

    // Apply visibility filter
    if (filter === 'visible') {
      filtered = filtered.filter(m => !m.hidden)
    } else if (filter === 'hidden') {
      filtered = filtered.filter(m => m.hidden)
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(search) ||
        m.artist.toLowerCase().includes(search) ||
        m.owner.toLowerCase().includes(search) ||
        m.description?.toLowerCase().includes(search)
      )
    }

    setFilteredMusic(filtered)
  }, [filter, searchTerm, allMusic])

  const handleAdminDelete = async (id: string, title: string, owner: string) => {
    if (!confirm(`🛑 ADMIN ACTION\n\nAre you sure you want to PERMANENTLY DELETE "${title}"?\n\nOwner: ${owner}\n\nThis action CANNOT be undone!`)) {
      return
    }

    setDeleting(id)
    try {
      // Admin can delete any music by passing the owner's address
      const res = await fetch(`/api/delete-music?id=${id}&owner=${owner}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        showMessage(`✅ Successfully deleted "${title}"`, 'success')
        await fetchAllMusic()
      } else {
        showMessage(`❌ Failed to delete: ${data.error}`, 'error')
      }
    } catch (error) {
      showMessage(`❌ Error deleting music: ${error}`, 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleAdminToggleHide = async (id: string, title: string, owner: string, currentHidden: boolean) => {
    const action = currentHidden ? 'UNHIDE' : 'HIDE'
    if (!confirm(`🛑 ADMIN ACTION\n\nAre you sure you want to ${action} "${title}"?\n\nOwner: ${owner}\n\nThis will ${currentHidden ? 'show it on' : 'hide it from'} the explore page.`)) {
      return
    }

    setToggling(id)
    try {
      // Admin can toggle any music by passing the owner's address
      const res = await fetch(`/api/toggle-hide?id=${id}&owner=${owner}`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        showMessage(
          `✅ ${data.hidden ? 'Hidden' : 'Unhidden'} "${title}"`,
          'success'
        )
        await fetchAllMusic()
      } else {
        showMessage(`❌ Failed to toggle: ${data.error}`, 'error')
      }
    } catch (error) {
      showMessage(`❌ Error toggling visibility: ${error}`, 'error')
    } finally {
      setToggling(null)
    }
  }

  const handleAddComment = async (musicId: string, musicTitle: string, owner: string) => {
    if (!commentText.trim()) {
      showMessage('❌ Comment cannot be empty', 'error')
      return
    }

    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/admin-comment?id=${musicId}&admin=${account}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentText }),
      })
      const data = await res.json()

      if (data.success) {
        showMessage(`✅ Comment added to "${musicTitle}"`, 'success')
        setCommentText('')
        setCommentingOn(null)
        await fetchAllMusic()
      } else {
        showMessage(`❌ Failed to add comment: ${data.error}`, 'error')
      }
    } catch (error) {
      showMessage(`❌ Error adding comment: ${error}`, 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  // Check if user is admin
  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-8">🔐 Admin Panel</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Connect your wallet to access the admin panel
              </p>
              <button onClick={connectWallet} className="btn-primary">
                Connect Wallet
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-8 text-red-600">🚫 Access Denied</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You do not have admin privileges.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Connected Wallet: {account}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                Admin Wallet: {ADMIN_WALLET}
              </p>
              <button onClick={() => window.location.href = '/'} className="btn-secondary">
                Go to Home
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const stats = {
    total: allMusic.length,
    visible: allMusic.filter(m => !m.hidden).length,
    hidden: allMusic.filter(m => m.hidden).length,
    uniqueUsers: new Set(allMusic.map(m => m.owner.toLowerCase())).size,
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
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  🛡️ Admin Panel
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Admin: {account.slice(0, 6)}...{account.slice(-4)}
                </p>
              </div>
              <button
                onClick={fetchAllMusic}
                className="btn-secondary"
              >
                🔄 Refresh
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Total Uploads
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Visible
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.visible}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Hidden
                </h3>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.hidden}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Unique Users
                </h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.uniqueUsers}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Search by title, artist, owner, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    All ({stats.total})
                  </button>
                  <button
                    onClick={() => setFilter('visible')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === 'visible'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Visible ({stats.visible})
                  </button>
                  <button
                    onClick={() => setFilter('hidden')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === 'hidden'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Hidden ({stats.hidden})
                  </button>
                </div>
              </div>
            </div>

            {/* Music List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  All Music Uploads
                  {searchTerm && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({filteredMusic.length} results)
                    </span>
                  )}
                </h2>
                {loading ? (
                  <div className="flex justify-center items-center py-16">
                    <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : filteredMusic.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No music found
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Preview
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Owner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Upload Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredMusic.map((music) => (
                          <Fragment key={music.id}>
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src={music.imageUrl}
                                alt={music.title}
                                className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => setSelectedTrack(music)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {music.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                by {music.artist}
                              </div>
                              {music.description && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-sm">
                                  {music.description.length > 100 
                                    ? `${music.description.substring(0, 100)}...` 
                                    : music.description}
                                </div>
                              )}
                              {music.adminComments && music.adminComments.length > 0 && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                    💬 {music.adminComments.length} comment{music.adminComments.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white font-mono">
                                {music.owner.slice(0, 6)}...{music.owner.slice(-4)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(music.createdAt).toLocaleDateString()}
                              <br />
                              <span className="text-xs">
                                {new Date(music.createdAt).toLocaleTimeString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {music.hidden ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  🔒 Hidden
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  👁️ Visible
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-y-1">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => setSelectedTrack(music)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-left"
                                >
                                  ▶️ Play
                                </button>
                                {music.ipId && (
                                  <a
                                    href={`https://aeneid.explorer.story.foundation/ipa/${music.ipId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                                  >
                                    🔗 Story IP
                                  </a>
                                )}
                                <button
                                  onClick={() => {
                                    if (commentingOn === music.id) {
                                      setCommentingOn(null)
                                      setCommentText('')
                                    } else {
                                      setCommentingOn(music.id)
                                    }
                                  }}
                                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-left"
                                >
                                  💬 Comment
                                </button>
                                <button
                                  onClick={() => handleAdminToggleHide(music.id, music.title, music.owner, music.hidden || false)}
                                  disabled={toggling === music.id}
                                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 disabled:text-gray-400 text-left"
                                >
                                  {toggling === music.id ? '⏳ Processing...' : (music.hidden ? '👁️ Unhide' : '🔒 Hide')}
                                </button>
                                <button
                                  onClick={() => handleAdminDelete(music.id, music.title, music.owner)}
                                  disabled={deleting === music.id}
                                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:text-gray-400 text-left"
                                >
                                  {deleting === music.id ? '⏳ Deleting...' : '🗑️ Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* Comment Input Row */}
                          {commentingOn === music.id && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-orange-50 dark:bg-orange-900/20">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="💬 Type your comment to notify the owner..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !submittingComment) {
                                        handleAddComment(music.id, music.title, music.owner)
                                      }
                                    }}
                                    className="flex-1 px-4 py-2 rounded-lg border border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleAddComment(music.id, music.title, music.owner)}
                                    disabled={submittingComment || !commentText.trim()}
                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                  >
                                    {submittingComment ? '⏳ Sending...' : '📤 Send'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCommentingOn(null)
                                      setCommentText('')
                                    }}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded-lg font-medium transition-colors"
                                  >
                                    ✕ Cancel
                                  </button>
                                </div>
                                {music.adminComments && music.adminComments.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Previous Comments:
                                    </div>
                                    {music.adminComments.map((comment) => (
                                      <div key={comment.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg text-sm">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="text-gray-900 dark:text-white">{comment.comment}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {new Date(comment.timestamp).toLocaleString()} • Admin: {comment.admin.slice(0, 6)}...{comment.admin.slice(-4)}
                                            </div>
                                          </div>
                                          <span className={`text-xs px-2 py-0.5 rounded ${
                                            comment.read 
                                              ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400' 
                                              : 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200'
                                          }`}>
                                            {comment.read ? '✓ Read' : '📫 Unread'}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
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
            <div className="mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Owner: {selectedTrack.owner.slice(0, 6)}...{selectedTrack.owner.slice(-4)}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Uploaded: {new Date(selectedTrack.createdAt).toLocaleString()}
              </div>
            </div>
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
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
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
