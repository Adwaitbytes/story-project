// Quick test script to verify storage utility works
import { readMusicData, writeMusicData } from './utils/storage'

async function testStorage() {
  console.log('🧪 Testing storage utility...\n')
  
  try {
    // Read existing data
    console.log('1️⃣ Reading existing music data...')
    const existing = await readMusicData()
    console.log(`   ✅ Found ${existing.length} tracks\n`)
    
    // Test write (add a dummy entry)
    console.log('2️⃣ Testing write functionality...')
    const testData = {
      id: 'test-' + Date.now(),
      title: 'Test Track',
      artist: 'Test Artist',
      description: 'This is a test',
      price: '0',
      audioUrl: 'https://example.com/audio.mp3',
      imageUrl: 'https://example.com/image.jpg',
      owner: '0x0000000000000000000000000000000000000000',
      metadataUrl: 'https://example.com/metadata.json',
      createdAt: new Date().toISOString(),
    }
    
    const updated = [...existing, testData]
    await writeMusicData(updated)
    console.log('   ✅ Write successful\n')
    
    // Read again to verify
    console.log('3️⃣ Verifying data was saved...')
    const verified = await readMusicData()
    console.log(`   ✅ Now have ${verified.length} tracks\n`)
    
    // Remove test data
    console.log('4️⃣ Cleaning up test data...')
    const cleaned = verified.filter(m => m.id !== testData.id)
    await writeMusicData(cleaned)
    console.log('   ✅ Cleanup complete\n')
    
    console.log('✨ All tests passed! Storage is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testStorage()
