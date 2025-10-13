// Storage utility: uses Vercel KV if configured, falls back to local file in dev
import fs from 'fs'
import path from 'path'

export interface MusicData {
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
}

const STORAGE_FILE = path.join(process.cwd(), 'music-storage.json')
const KV_URL = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN
const KV_KEY = process.env.KV_MUSIC_KEY || 'music:storage'

function usingKV() {
  return Boolean(KV_URL && KV_TOKEN)
}

async function kvGet<T = unknown>(key: string): Promise<T | null> {
  if (!usingKV()) return null
  const url = `${KV_URL!.replace(/\/$/, '')}/get/${encodeURIComponent(key)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const body = (await res.json()) as { result?: string | null }
  if (!body || body.result == null) return null
  try {
    return JSON.parse(body.result) as T
  } catch {
    // if plain string stored
    return (body.result as unknown) as T
  }
}

async function kvSet<T = unknown>(key: string, value: T): Promise<void> {
  if (!usingKV()) return
  const val = encodeURIComponent(JSON.stringify(value))
  const url = `${KV_URL!.replace(/\/$/, '')}/set/${encodeURIComponent(key)}/${val}`
  await fetch(url, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: 'no-store',
  })
}

function fsRead<T = unknown>(fallback: T): T {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      return JSON.parse(data) as T
    }
    return fallback
  } catch (e) {
    console.error('❌ FS read error:', e)
    return fallback
  }
}

function fsWrite<T = unknown>(value: T) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(value, null, 2))
  } catch (e) {
    console.error('❌ FS write error:', e)
  }
}

export async function readMusicData(): Promise<MusicData[]> {
  // Try KV first in production
  const fromKv = await kvGet<MusicData[]>(KV_KEY)
  if (fromKv) return fromKv
  // Fall back to FS locally
  return fsRead<MusicData[]>([])
}

export async function writeMusicData(data: MusicData[]): Promise<void> {
  // Write to KV if available
  if (usingKV()) {
    await kvSet(KV_KEY, data)
  }
  // In local dev (no KV), keep JSON updated
  if (!usingKV()) {
    fsWrite(data)
  }
}
