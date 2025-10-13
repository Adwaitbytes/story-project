// Migration script: Upload existing music-storage.json data to Vercel Blob
import { writeMusicData, readMusicData, type MusicData } from './utils/storage'
import fs from 'fs'
import path from 'path'

async function migrate() {
  console.log('🚀 Starting migration to Vercel Blob...\n')
  
  try {
    // Read from local file
    const localFile = path.join(process.cwd(), 'music-storage.json')
    
    if (!fs.existsSync(localFile)) {
      console.log('❌ No music-storage.json found. Nothing to migrate.')
      return
    }
    
    const localData = JSON.parse(fs.readFileSync(localFile, 'utf8')) as MusicData[]
    console.log(`📁 Found ${localData.length} tracks in local file`)
    
    if (localData.length === 0) {
      console.log('ℹ️ No data to migrate.')
      return
    }
    
    // Display tracks being migrated
    console.log('\n📋 Tracks to migrate:')
    localData.forEach((track, i) => {
      console.log(`   ${i + 1}. "${track.title}" by ${track.artist}`)
    })
    
    // Write to Vercel Blob (will overwrite if exists)
    console.log('\n📤 Uploading to Vercel Blob...')
    await writeMusicData(localData)
    
    // Verify
    console.log('\n🔍 Verifying upload...')
    const verified = await readMusicData()
    console.log(`✅ Verified ${verified.length} tracks in Vercel Blob`)
    
    if (verified.length === localData.length) {
      console.log('\n🎉 Migration successful!')
      console.log('\nℹ️  Your local music-storage.json is still there for backup.')
      console.log('    You can safely delete it once you verify production works.')
    } else {
      console.warn('\n⚠️  Track count mismatch! Please check manually.')
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()
