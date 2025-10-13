'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'

export function useWalletConnection() {
  const { address, isConnected } = useAccount()
  const { open } = useWeb3Modal()
  const { disconnect } = useDisconnect()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const connectWallet = async () => {
    try {
      console.log('🔗 Opening wallet connection modal...')
      console.log('📱 Is Mobile:', isMobile)
      await open()
    } catch (error) {
      console.error('❌ Error connecting wallet:', error)
      throw error
    }
  }

  const disconnectWallet = async () => {
    try {
      console.log('🔌 Disconnecting wallet...')
      disconnect()
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error)
      throw error
    }
  }

  return {
    address,
    isConnected,
    isMobile,
    connectWallet,
    disconnectWallet,
  }
}
