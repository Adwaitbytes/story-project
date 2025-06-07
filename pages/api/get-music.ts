
import { NextApiRequest, NextApiResponse } from 'next'
import { musicStorage } from './upload-music'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    res.status(200).json({
      success: true,
      music: musicStorage || [],
    })
  } catch (error) {
    console.error('Error getting music:', error)
    res.status(500).json({ error: 'Failed to get music NFTs' })
  }
}
