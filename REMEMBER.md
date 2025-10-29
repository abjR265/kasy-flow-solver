# REMEMBER - DON'T FORGET THIS!

## ✅ Correct Setup (DO NOT CHANGE)

### Frontend Project: `kasy-flow-solver`
- **Branch**: `main` ✅
- **Directory**: `/Users/josh9281/kasy-flow-solver` (ROOT)
- **Vercel Project**: `kasy-flow-solver` 
- **Deployment URL**: Auto-deploys from `main` branch
- **Code**: Frontend React app (Vite, shadcn/ui)

### Backend Project: `kasy-flow-solver-bck`
- **Branch**: `backend` ✅
- **Directory**: `/Users/josh9281/kasy-flow-solver/backend`
- **Vercel Project**: `kasy-flow-solver-bck`
- **Deployment URL**: https://kasy-flow-solver-6hnellsir-kasyai.vercel.app
- **Code**: Backend Next.js API with EXACT KASY_MVP logic

## 🚨 CRITICAL RULES

1. **Frontend changes** → commit to `main` branch → pushes to frontend
2. **Backend changes** → commit to `backend` branch → pushes to backend
3. **NEVER deploy backend to `kasy-flow-solver`** (that's frontend only)
4. **NEVER deploy frontend to `kasy-flow-solver-bck`** (that's backend only)

## 📋 Environment Variables

### Frontend (`kasy-flow-solver`)
```
VITE_API_BASE_URL=https://kasy-flow-solver-6hnellsir-kasyai.vercel.app
```

### Backend (`kasy-flow-solver-bck`)
```
DATABASE_URL=<supabase pooler URL>
DIRECT_DATABASE_URL=<supabase direct URL>
OPENAI_API_KEY=<openai key>
CRON_SECRET=<secret>
```

## 🧪 Latest Fix (2025-10-29)

**Problem**: "dinner 60 split with hames" was failing
**Cause**: Frontend was using mock NLP parser instead of real backend API
**Solution**: Updated `src/lib/api/nlp.ts` to call backend API at `${API_BASE_URL}/api/expenses/parse`
**Status**: Fixed and deployed

## 📝 Current Status

- ✅ Backend has EXACT KASY_MVP logic (NLP, OCR, badges, settlements)
- ✅ Frontend now calls real backend API
- ✅ "Create Group" functionality added
- ✅ Both projects correctly linked to Vercel

## 🎯 Test Cases

**Must pass**: 
```
dinner 60 split with hames
```
Should parse to: amount=$60, description="dinner"

**Create Group**:
Click group dropdown → "Create Group" → Enter name → Works!

