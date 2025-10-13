const { put } = require('@vercel/blob');
const fs = require('fs');

async function restore() {
  try {
    const data = JSON.parse(fs.readFileSync('./music-storage.json', 'utf8'));
    const timestamp = Date.now();
    
    const blob = await put(
      `music-data-${timestamp}.json`,
      JSON.stringify(data, null, 2),
      {
        access: 'public',
        token: 'vercel_blob_rw_xlBhdcTC4tbc5fRh_MVDKcXH8bSFfTG2UypSgF0nd3D9DI'
      }
    );
    
    console.log('✅ Successfully restored', data.length, 'songs to Blob storage');
    console.log('📦 Blob URL:', blob.url);
    console.log('\n🎵 Restored songs:');
    data.forEach((song, i) => {
      console.log(`  ${i + 1}. "${song.title}" by ${song.artist}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

restore();
