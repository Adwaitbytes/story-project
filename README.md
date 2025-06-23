# Melodex - Decentralized Music NFT Platform

## 🎵 Overview
Melodex is a decentralized platform that revolutionizes music ownership and distribution using blockchain technology. Built on Story Protocol, it enables artists to mint their music as NFTs, manage their intellectual property rights, and connect directly with their audience.

## 🚀 Key Features

### 1. Music NFT Creation & Management
- **Easy Upload**: Upload music files and artwork directly to IPFS
- **Smart Metadata**: Automatic metadata generation for music and NFT assets
- **IP Registration**: Seamless registration of music as IP assets on Story Protocol
- **Royalty Management**: Built-in royalty tracking and distribution system

### 2. AI-Powered Features
- **AI Album Art Generation**: Generate unique album artwork using multiple AI models
- **Smart Descriptions**: AI-assisted metadata and description generation
- **Content Moderation**: AI-powered content verification and moderation

### 3. User Experience
- **Intuitive Interface**: Clean, modern UI for both artists and collectors
- **Music Player**: Built-in player for previewing and playing music NFTs
- **Wallet Integration**: Seamless Web3 wallet connection using RainbowKit
- **Responsive Design**: Mobile-first approach for all devices

### 4. Technical Innovation
- **Decentralized Storage**: IPFS integration for immutable content storage
- **Smart Contracts**: Custom contracts for IP management and licensing
- **Multi-Chain Support**: Built on Story Protocol's infrastructure
- **AI Integration**: Multiple AI models for content generation and moderation

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 15.3.3
- **Styling**: Tailwind CSS
- **Web3 Integration**: RainbowKit, wagmi
- **State Management**: React Context + Local Storage
- **UI Components**: Custom components with Lucide icons

### Backend
- **API Routes**: Next.js API routes
- **Storage**: IPFS (Infura)
- **Blockchain**: Story Protocol
- **AI Services**: 
  - Stability AI (Image Generation)
  - Google Gemini (Content Generation)
  - Replicate (Stable Diffusion)

### Smart Contracts
- **Protocol**: Story Protocol
- **NFT Standard**: ERC-721
- **IP Management**: Custom IP licensing contracts

## 🔑 Key Technical Details

### IPFS Integration
```typescript
// Example of IPFS upload
const uploadToIPFS = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### Story Protocol Integration
```typescript
// Example of IP registration
const registerIP = async (metadata: IPMetadata) => {
  const response = await client.ip.register({
    metadata: metadata,
    licenseTerms: [defaultLicense],
    txOptions: { waitForTransaction: true }
  });
  return response;
};
```

### AI Image Generation
```typescript
// Multi-model approach for image generation
const generateImage = async (prompt: string) => {
  // Try multiple AI services in sequence
  const services = [
    stabilityAI,
    geminiAI,
    stableDiffusion
  ];
  
  for (const service of services) {
    try {
      const image = await service.generate(prompt);
      if (image) return image;
    } catch (error) {
      console.log(`Service failed: ${error}`);
    }
  }
};
```

## 🎯 Hackathon Submission Details

### Problem Statement
The music industry faces significant challenges in:
1. Fair compensation for artists
2. Complex licensing and rights management
3. Limited direct artist-fan connections
4. High barriers to entry for independent artists

### Solution
Melodex addresses these challenges by:
1. **Decentralized Ownership**: Music NFTs provide verifiable ownership and rights
2. **Smart Licensing**: Automated licensing through Story Protocol
3. **Direct Distribution**: Artists can sell directly to fans
4. **AI Assistance**: Lowering barriers to entry with AI tools

### Innovation Points
1. **Multi-Model AI Integration**: Robust image generation using multiple AI services
2. **IPFS + Story Protocol**: Secure, decentralized storage with proper IP management
3. **User-Friendly Interface**: Complex blockchain operations made simple
4. **Scalable Architecture**: Built for future expansion and feature addition

### Future Roadmap
1. **Social Features**: Artist-fan interaction and community building
2. **Advanced Licensing**: More flexible licensing options
3. **Analytics Dashboard**: Detailed insights for artists
4. **Mobile App**: Native mobile experience
5. **Cross-Chain Support**: Additional blockchain networks

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MetaMask or other Web3 wallet
- IPFS node (Infura account)
- API keys for AI services

### Installation
```bash
# Clone the repository
<<<<<<< HEAD
git clone https://github.com/yourusername/melodex.git
=======
git clone with the repository link
>>>>>>> 5d72c6d0281f536af5f2422748a843532d2ea606

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your API keys and configuration

# Run development server
npm run dev
```

### Environment Variables
```env
# Required
NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID=your_infura_project_id
NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET=your_infura_project_secret
STORY_PROTOCOL_API_KEY=your_story_protocol_key

# AI Services (at least one required)
STABILITY_API_KEY=your_stability_key
GEMINI_API_KEY=your_gemini_key
REPLICATE_API_KEY=your_replicate_key
```

## 🤝 Contributing
We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- Story Protocol for the IP management infrastructure
- IPFS for decentralized storage
- All AI service providers
- The Web3 community for inspiration and support
