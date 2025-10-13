# Deployment Checklist for Vercel

## ✅ Pre-Deployment Steps Completed

- [x] Installed `@vercel/blob` package
- [x] Created storage utility (`utils/storage.ts`)
- [x] Updated API routes to use Vercel Blob
- [x] Added `BLOB_READ_WRITE_TOKEN` to `.env`
- [x] Disabled caching on API routes
- [x] Tested storage locally

## 🚀 Deployment Steps

### 1. Set Environment Variable in Vercel

**Option A: Using Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: `vercel_blob_rw_xlBhdcTC4tbc5fRh_MVDKcXH8bSFfTG2UypSgF0nd3D9DI`
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**

**Option B: Using Vercel CLI**
```bash
vercel env add BLOB_READ_WRITE_TOKEN
# Paste the token when prompted: vercel_blob_rw_xlBhdcTC4tbc5fRh_MVDKcXH8bSFfTG2UypSgF0nd3D9DI
# Select: Production, Preview, Development
```

### 2. Deploy to Vercel

```bash
git add .
git commit -m "Add Vercel Blob storage for persistent uploads"
git push
```

Vercel will automatically deploy when you push to your main branch.

### 3. Verify Deployment

After deployment completes:

1. **Test Upload**
   - Go to your deployed site
   - Navigate to `/upload`
   - Upload a test music track
   - Wait for success message

2. **Verify Persistence**
   - Go to home page or `/explore`
   - Verify the uploaded track appears
   - Refresh the page - track should still be there

3. **Check Logs**
   - Go to Vercel Dashboard → your project → Functions
   - Click on the latest deployment
   - Check logs for:
     - `📦 Using Vercel Blob storage` (production)
     - `✅ Data saved to Vercel Blob`
     - No errors about storage

## 🔍 Troubleshooting

### If uploads don't persist:

1. **Check Environment Variable**
   ```bash
   vercel env ls
   ```
   Verify `BLOB_READ_WRITE_TOKEN` is set

2. **Check Function Logs**
   - Look for errors in Vercel dashboard
   - Common issues:
     - Token not set: "📁 Using local file storage" in production
     - Invalid token: Error writing to Blob
     - Network issues: Timeout errors

3. **Force Redeploy**
   ```bash
   vercel --prod --force
   ```

### If you see caching issues:

- The API routes use `force-dynamic` and `Cache-Control: no-store`
- Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check Network tab in DevTools - should see fresh requests

## 📊 Monitoring

After deployment, monitor:

- **Storage Usage**: Vercel dashboard → Storage → Blob
- **Function Logs**: Check for any errors in real-time
- **API Response Times**: Should be fast (<1s typically)

## 🔄 Rolling Back

If something goes wrong:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click the three dots → "Promote to Production"

## 📝 Next Steps

Once deployed and verified:

- [ ] Test uploading multiple tracks
- [ ] Verify all tracks appear on explore page
- [ ] Test on different devices/browsers
- [ ] Monitor storage usage over time
- [ ] Consider adding pagination if you get many tracks

## 🔐 Security Reminder

- ⚠️ **URGENT**: Rotate your wallet private key and API keys that were shown in this chat
- Never commit `.env` file (already gitignored)
- Use Vercel environment variables for all secrets
- Consider adding authentication to the upload endpoint
