
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const JWT = process.env.PINATA_JWT

export async function uploadFileToIPFS(fileBuffer: Buffer): Promise<string> {
    try {
        const formData = new FormData()
        const blob = new Blob([fileBuffer])
        formData.append('file', blob)

        const pinataMetadata = JSON.stringify({
            name: `file-${Date.now()}`,
        })
        formData.append('pinataMetadata', pinataMetadata)

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${JWT}`,
            },
        })

        return response.data.IpfsHash
    } catch (error) {
        console.error('Error uploading file to IPFS:', error)
        throw error
    }
}

export async function uploadJSONToIPFS(jsonData: any): Promise<string> {
    try {
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            jsonData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${JWT}`,
                },
            }
        )

        return response.data.IpfsHash
    } catch (error) {
        console.error('Error uploading JSON to IPFS:', error)
        throw error
    }
}
