'use client'

import { useState, useEffect, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
        <Navigation />
        <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-12 shadow-2xl"
            >
              <h1 className="text-4xl font-bold mb-6 text-white text-glow">🔐 Admin Panel</h1>
              <p className="text-story-text-secondary text-lg mb-8">
                Connect your wallet to access the admin panel
              </p>
              <button onClick={connectWallet} className="btn-primary px-8 py-3 text-lg">
                Connect Wallet
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
        <Navigation />
        <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-12 shadow-2xl border-red-500/20"
            >
              <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-6 text-red-500 text-glow">Access Denied</h1>
              <p className="text-story-text-secondary text-lg mb-4">
                You do not have admin privileges.
              </p>
              <div className="bg-black/20 rounded-xl p-4 mb-8 text-sm font-mono text-story-text-secondary">
                <p>Connected: {account}</p>
                <p className="mt-2 text-xs opacity-50">Required: {ADMIN_WALLET}</p>
              </div>
              <button onClick={() => window.location.href = '/'} className="btn-secondary">
                Return Home
              </button>
            </motion.div>
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
    <div className="min-h-screen relative overflow-hidden bg-story-dark selection:bg-blue-500/30">
      <Navigation />

      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] opacity-20 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[100px] opacity-20 mix-blend-screen" />
      </div>

      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white text-glow mb-2">
                  🛡️ Admin Panel
                </h1>
                <p className="text-story-text-secondary font-mono text-sm">
                  Admin: {account.slice(0, 6)}...{account.slice(-4)}
                </p>
              </div>
              <button
                onClick={fetchAllMusic}
                className="btn-secondary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-story-text-secondary font-medium mb-2 text-sm uppercase tracking-wider">
                  Total Uploads
                </h3>
                <p className="text-3xl font-bold text-blue-400">
                  {stats.total}
                </p>
              </div>
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-story-text-secondary font-medium mb-2 text-sm uppercase tracking-wider">
                  Visible
                </h3>
                <p className="text-3xl font-bold text-green-400">
                  {stats.visible}
                </p>
              </div>
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-story-text-secondary font-medium mb-2 text-sm uppercase tracking-wider">
                  Hidden
                </h3>
                <p className="text-3xl font-bold text-yellow-400">
                  {stats.hidden}
                </p>
              </div>
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-story-text-secondary font-medium mb-2 text-sm uppercase tracking-wider">
                  Unique Users
                </h3>
                <p className="text-3xl font-bold text-purple-400">
                  {stats.uniqueUsers}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by title, artist, owner, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-story-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('visible')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === 'visible'
                      ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                      : 'text-story-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                  >
                    Visible
                  </button>
                  <button
                    onClick={() => setFilter('hidden')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === 'hidden'
                      ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/25'
                      : 'text-story-text-secondary hover:text-white hover:bg-white/5'
                      }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>
            </div>

            {/* Music List */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  All Music Uploads
                  {searchTerm && (
                    <span className="text-sm font-normal text-story-text-secondary bg-white/5 px-3 py-1 rounded-full">
                      {filteredMusic.length} results
                    </span>
                  )}
                </h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : filteredMusic.length === 0 ? (
                <div className="p-12 text-center text-story-text-secondary">
                  No music found matching your criteria
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Preview
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredMusic.map((music) => (
                        <Fragment key={music.id}>
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden group cursor-pointer" onClick={() => setSelectedTrack(music)}>
                                <img
                                  src={music.imageUrl}
                                  alt={music.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-white mb-1">
                                {music.title}
                              </div>
                              <div className="text-sm text-story-text-secondary mb-2">
                                by {music.artist}
                              </div>
                              {music.adminComments && music.adminComments.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                  💬 {music.adminComments.length} comment{music.adminComments.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-story-text-secondary bg-white/5 px-2 py-1 rounded">
                                {music.owner.slice(0, 6)}...{music.owner.slice(-4)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-story-text-secondary">
                              {new Date(music.createdAt).toLocaleDateString()}
                              <div className="text-xs opacity-50 mt-1">
                                {new Date(music.createdAt).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {music.hidden ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                  🔒 Hidden
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                  👁️ Visible
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                              <div className="flex flex-col gap-2">
                                {music.ipId && (
                                  <a
                                    href={`https://aeneid.explorer.story.foundation/ipa/${music.ipId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-xs"
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
                                  className="text-orange-400 hover:text-orange-300 flex items-center gap-1 text-xs"
                                >
                                  💬 Comment
                                </button>
                                <button
                                  onClick={() => handleAdminToggleHide(music.id, music.title, music.owner, music.hidden || false)}
                                  disabled={toggling === music.id}
                                  className="text-yellow-400 hover:text-yellow-300 disabled:text-gray-600 flex items-center gap-1 text-xs"
                                >
                                  {toggling === music.id ? '⏳ ...' : (music.hidden ? '👁️ Unhide' : '🔒 Hide')}
                                </button>
                                <button
                                  onClick={() => handleAdminDelete(music.id, music.title, music.owner)}
                                  disabled={deleting === music.id}
                                  className="text-red-400 hover:text-red-300 disabled:text-gray-600 flex items-center gap-1 text-xs"
                                >
                                  {deleting === music.id ? '⏳ ...' : '🗑️ Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* Comment Input Row */}
                          {commentingOn === music.id && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-orange-500/5 border-t border-b border-orange-500/10">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Type your comment to notify the owner..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !submittingComment) {
                                        handleAddComment(music.id, music.title, music.owner)
                                      }
                                    }}
                                    className="flex-1 px-4 py-2 rounded-lg bg-black/20 border border-orange-500/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleAddComment(music.id, music.title, music.owner)}
                                    disabled={submittingComment || !commentText.trim()}
                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                  >
                                    {submittingComment ? '⏳' : 'Send'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCommentingOn(null)
                                      setCommentText('')
                                    }}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                                {music.adminComments && music.adminComments.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <div className="text-xs font-medium text-story-text-secondary uppercase tracking-wider">
                                      Previous Comments
                                    </div>
                                    {music.adminComments.map((comment) => (
                                      <div key={comment.id} className="bg-black/20 p-3 rounded-lg text-sm border border-white/5">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="text-white">{comment.comment}</div>
                                            <div className="text-xs text-story-text-secondary mt-1 font-mono">
                                              {new Date(comment.timestamp).toLocaleString()} • Admin: {comment.admin.slice(0, 6)}...{comment.admin.slice(-4)}
                                            </div>
                                          </div>
                                          <span className={`text-xs px-2 py-0.5 rounded ${comment.read
                                            ? 'bg-white/10 text-gray-400'
                                            : 'bg-green-500/20 text-green-400'
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
          </motion.div>
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
              <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <div className="text-sm text-story-text-secondary font-mono mb-1">
                      Owner: {selectedTrack.owner}
                    </div>
                    <div className="text-xs text-story-text-secondary opacity-50">
                      Uploaded: {new Date(selectedTrack.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTrack(null)}
                    className="text-white/50 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <MusicPlayer
                  audioUrl={selectedTrack.audioUrl}
                  title={selectedTrack.title}
                  artist={selectedTrack.artist}
                  imageUrl={selectedTrack.imageUrl}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border z-50 ${messageType === 'success'
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
