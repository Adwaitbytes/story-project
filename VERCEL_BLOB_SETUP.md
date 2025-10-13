# Vercel Blob Storage Setup

This project uses Vercel Blob to persist music uploads across serverless deployments.

## How it works

- **Production (Vercel)**: Music data is stored in Vercel Blob storage (JSON file)
- **Local Development**: Music data is stored in `music-storage.json` file
- The storage layer automatically detects which environment it's running in

## Setup for Production

### 1. Add the Vercel Blob token to your project

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your Vercel Blob token (starts with `vercel_blob_rw_...`)
   - **Environments**: Select all (Production, Preview, Development)

### 2. Deploy to Vercel

```bash
git add .
git commit -m "Add Vercel Blob storage"
git push
```

Vercel will automatically deploy the changes.

### 3. Test the deployment

1. Upload a music track on your deployed site
2. Refresh the page or navigate to Explore
3. The uploaded track should now persist and be visible immediately

## How to get a Vercel Blob token

If you don't have a token yet:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link your project: `vercel link`
4. Create a blob store: `vercel blob create`
5. Copy the token that's generated

Or use the Vercel dashboard:
1. Go to your project → Storage tab
2. Create a new Blob store
3. Copy the token from the store settings

## Local Development

For local development, you don't need the Vercel Blob token. The app will automatically use a local JSON file (`music-storage.json`).

```bash
npm run dev
```

## Troubleshooting

### Uploads not persisting on Vercel
- Make sure `BLOB_READ_WRITE_TOKEN` is set in Vercel environment variables
- Check the function logs in Vercel dashboard for any errors
- Verify the token starts with `vercel_blob_rw_`

### "Blob read/write error" in logs
- Your token may have expired or been revoked
- Generate a new token and update the environment variable
- Redeploy the app

### Data not showing up immediately
- The app uses `force-dynamic` and `no-cache` headers to prevent caching
- Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser DevTools Network tab to verify the API is being called

## Storage Structure

The music data is stored as a JSON array in Vercel Blob:

```json
[
  {
    "id": "0x...",
    "title": "Song Title",
    "artist": "Artist Name",
    "description": "...",
    "price": "0",
    "audioUrl": "https://ipfs.io/ipfs/...",
    "imageUrl": "https://ipfs.io/ipfs/...",
    "owner": "0x...",
    "metadataUrl": "https://ipfs.io/ipfs/...",
    "createdAt": "2025-10-14T...",
    "ipId": "0x...",
    "txHash": "0x..."
  }
]
```

## Migration from Local JSON

If you have existing data in `music-storage.json`:

1. Deploy the app with Vercel Blob enabled
2. Copy the content of `music-storage.json`
3. Upload it manually to Vercel Blob, or
4. Use the first upload to initialize the storage, then manually merge the old data

## Security Notes

- The Blob token is sensitive - never commit it to git
- The `.env` file is gitignored - store secrets only in Vercel environment variables
- Rotate your wallet private key and API keys if they've been exposed
