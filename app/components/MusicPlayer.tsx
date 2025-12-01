'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'

interface MusicPlayerProps {
  audioUrl: string
  title: string
  artist: string
  imageUrl: string
  onPlay?: () => void
  onPause?: () => void
}

export default function MusicPlayer({
  audioUrl,
  title,
  artist,
  imageUrl,
  onPlay,
  onPause
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const { theme } = useTheme()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0)
      })
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
        onPause?.()
      })
    }

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [audioUrl, onPause])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        onPause?.()
      } else {
        audioRef.current.play()
        onPlay?.()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 space-y-6"
    >
      <div className="flex items-center space-x-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg"
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <motion.div
            initial={false}
            animate={{ opacity: isPlaying ? 1 : 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
          >
            <div className="w-8 h-8 border-2 border-white rounded-full animate-spin border-t-transparent" />
          </motion.div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate mb-1">
            {title}
          </h3>
          <p className="text-gray-400 truncate">{artist}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          style={{
            background: `linear-gradient(to right, #3B82F6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%)`
          }}
        />

        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          style={{
            background: `linear-gradient(to right, #3B82F6 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`
          }}
        />
      </div>
    </motion.div>
  )
}