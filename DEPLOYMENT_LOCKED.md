# 🔒 DEPLOYMENT SETTINGS LOCKED

## ✅ PROBLEM SOLVED - No More Confusion!

I've added `vercel.json` files to **lock** each project to its correct branch:

### Frontend (Root Directory)
- **File**: `/vercel.json`
- **Locked to**: `main` branch ONLY
- **Vercel Project**: `kasy-flow-solver`
- **Framework**: Vite
- **Backend branch deployments**: DISABLED

### Backend (`/backend` Directory)
- **File**: `/backend/vercel.json`
- **Locked to**: `backend` branch ONLY
- **Vercel Project**: `kasy-flow-solver-bck`
- **Framework**: Next.js
- **Main branch deployments**: DISABLED

## What This Means

✅ **Frontend (`kasy-flow-solver`)** will ONLY deploy when you push to `main` branch
✅ **Backend (`kasy-flow-solver-bck`)** will ONLY deploy when you push to `backend` branch
✅ **No more accidental cross-deployments!**

## How to Deploy

### Frontend Changes:
```bash
cd /Users/josh9281/kasy-flow-solver
git checkout main
# make changes to src/...
git add .
git commit -m "frontend: your changes"
git push origin main
# Vercel auto-deploys to kasy-flow-solver
```

### Backend Changes:
```bash
cd /Users/josh9281/kasy-flow-solver
git checkout backend
# make changes to backend/...
git add .
git commit -m "backend: your changes"
git push origin backend
# Vercel auto-deploys to kasy-flow-solver-bck
```

## Current Status

- ✅ `vercel.json` files committed
- ✅ Branch restrictions in place
- ✅ This mistake won't happen again!

**The deployment confusion is PERMANENTLY FIXED!** 🎉

