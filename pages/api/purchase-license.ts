
import { NextApiRequest, NextApiResponse } from 'next'
import { client } from '../../utils/config'
import { Address } from 'viem'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { ipId, buyer, amount = 1 } = req.body

    if (!ipId || !buyer) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // For this example, we'll use license terms ID 1 (you may want to store this with each music NFT)
    const LICENSE_TERMS_ID = '1'

    // Mint license tokens
    const response = await client.license.mintLicenseTokens({
      licenseTermsId: LICENSE_TERMS_ID,
      licensorIpId: ipId as Address,
      amount: parseInt(amount),
      maxMintingFee: BigInt(0), // You might want to set this based on the music's price
      maxRevenueShare: 100,
      txOptions: { waitForTransaction: true },
    })

    res.status(200).json({
      success: true,
      txHash: response.txHash,
      licenseTokenIds: response.licenseTokenIds,
    })

  } catch (error) {
    console.error('License purchase error:', error)
    res.status(500).json({ error: 'Failed to purchase license' })
  }
}
