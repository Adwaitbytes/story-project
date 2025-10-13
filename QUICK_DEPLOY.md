# 🚀 Quick Deploy Guide

## In 3 Steps:

### 1️⃣ Set Vercel Environment Variable

**Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

```
Name:  BLOB_READ_WRITE_TOKEN
Value: vercel_blob_rw_xlBhdcTC4tbc5fRh_MVDKcXH8bSFfTG2UypSgF0nd3D9DI
Envs:  ✓ Production ✓ Preview ✓ Development
```

### 2️⃣ Deploy

```bash
git add .
git commit -m "Add Vercel Blob storage"
git push
```

### 3️⃣ Test

1. Wait for Vercel deployment ✅
2. Upload a music track on your site
3. Refresh → Track should appear!

---

## 🔍 Verify It's Working

Check Vercel function logs for:
```
📦 Using Vercel Blob storage
✅ Data saved to Vercel Blob
```

NOT this (means token isn't set):
```
📁 Using local file storage
```

---

## ⚠️ If It Doesn't Work

1. **Hard refresh**: `Ctrl + Shift + R`
2. **Check env var**: Is `BLOB_READ_WRITE_TOKEN` set in Vercel?
3. **Redeploy**: Push an empty commit to trigger rebuild
4. **Logs**: Check Vercel function logs for errors

---

## 📚 More Info

- Full guide: `DEPLOYMENT_CHECKLIST.md`
- Setup details: `VERCEL_BLOB_SETUP.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`

---

**That's it!** Your uploads will now persist on Vercel. 🎉
