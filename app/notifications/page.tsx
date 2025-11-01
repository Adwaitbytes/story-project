'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import { useWalletConnection } from '../lib/useWalletConnection'
import Link from 'next/link'

interface Notification {
  id: string
  musicId: string
  musicTitle: string
  musicImage: string
  admin: string
  comment: string
  timestamp: string
  read: boolean
}

export default function NotificationsPage() {
  const { address, isConnected, connectWallet } = useWalletConnection()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const account = address || ''

  const fetchNotifications = async () => {
    if (!account) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/notifications?owner=${account}`)
      const data = await res.json()
      
      if (data.success) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
    setLoading(false)
  }

  const markAsRead = async (commentId: string, musicId: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, musicId, owner: account }),
      })
      
      if (res.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  useEffect(() => {
    if (isConnected && account) {
      fetchNotifications()
    }
  }, [isConnected, account])

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-8">📫 Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Connect your wallet to view your notifications
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  📫 Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button
                onClick={fetchNotifications}
                className="btn-secondary"
              >
                🔄 Refresh
              </button>
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Notifications
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Admin comments on your uploads will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${
                      !notification.read ? 'ring-2 ring-orange-500' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex gap-4">
                        {/* Music Thumbnail */}
                        <Link href={`/`}>
                          <img
                            src={notification.musicImage}
                            alt={notification.musicTitle}
                            className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform"
                          />
                        </Link>

                        {/* Notification Content */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                Admin Comment on "{notification.musicTitle}"
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                From: {notification.admin.slice(0, 6)}...{notification.admin.slice(-4)} • {' '}
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                🔔 New
                              </span>
                            )}
                          </div>

                          {/* Comment */}
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-3">
                            <p className="text-gray-800 dark:text-gray-200">
                              💬 {notification.comment}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id, notification.musicId)}
                                className="text-sm px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                              >
                                ✓ Mark as Read
                              </button>
                            )}
                            <Link
                              href="/"
                              className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                            >
                              📝 View My Music
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
