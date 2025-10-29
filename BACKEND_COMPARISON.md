# Backend Feature Comparison: Current vs KASY_MVP

## Current Status

The backend was **built from README spec**, NOT copied from KASY_MVP code.
This means prompts and logic may differ from your finely-tuned KASY_MVP version.

## Feature-by-Feature Comparison

### ✅ 1. Smart OCR Receipt Processing
- **Current**: Uses basic OCR prompt in `backend/src/lib/openai.ts` (lines 25-101)
- **KASY_MVP**: Lines 867-987 in telegram route
- **Status**: ⚠️ NEEDS UPDATE - prompt may differ from your tuned version
- **Action**: Copy EXACT OCR prompt from KASY_MVP lines 892-945

### ✅ 2. Natural Language Parsing  
- **Current**: Just updated to match KASY_MVP (lines 570-626)
- **KASY_MVP**: Lines 571-626 in telegram route
- **Status**: ✅ FIXED - now uses exact KASY_MVP prompt
- **Action**: None - already copied

### ✅ 3. Overlapping Splits
- **Current**: Has logic in `backend/src/lib/openai.ts` (lines 159-271)
- **KASY_MVP**: Lines 629-808 in telegram route
- **Status**: ⚠️ NEEDS REVIEW - logic may differ
- **Action**: Compare and copy EXACT logic from KASY_MVP

### ✅ 4. Gentle Collector Reminders
- **Current**: `backend/src/app/api/cron/reminders/route.ts`
- **KASY_MVP**: Has reminder system
- **Status**: ⚠️ NEEDS REVIEW
- **Action**: Need to find and copy KASY_MVP reminder logic

### ✅ 5. Gamification Badges
- **Current**: `backend/src/app/api/badges/award/route.ts` + `badges/[userId]/route.ts`
- **KASY_MVP**: Lines 1078-1300+ in telegram route
- **Status**: ⚠️ NEEDS UPDATE - logic may differ
- **Action**: Copy badge award logic from KASY_MVP

### ✅ 6. Payment Integration
- **Current**: `backend/src/app/api/payments/` endpoints
- **KASY_MVP**: Payment profile functions (lines 1034-1066)
- **Status**: ⚠️ NEEDS REVIEW
- **Action**: Compare payment link generation logic

### ✅ 7. Delegation (Settlements)
- **Current**: `backend/src/lib/calculations.ts` + `backend/src/app/api/settlements/[groupId]/route.ts`
- **KASY_MVP**: Settlement calculation logic
- **Status**: ⚠️ NEEDS REVIEW - algorithm may differ
- **Action**: Copy EXACT greedy optimization algorithm

### ✅ 8. DM Features (CRUD)
- **Current**: `backend/src/app/api/expenses/route.ts`
- **KASY_MVP**: Expense creation logic
- **Status**: ⚠️ NEEDS REVIEW
- **Action**: Compare expense creation/update logic

### ✅ 9. PDF Export
- **Current**: `backend/src/app/api/exports/pdf/[groupId]/route.ts`
- **KASY_MVP**: Uses `generateGroupLedgerPDF` (imported line 3)
- **Status**: ⚠️ NEEDS UPDATE - likely missing PDF generation
- **Action**: Copy PDF generation logic

### ✅ 10. Two-Message OCR Flow
- **Current**: `backend/src/app/api/receipts/pending/` + `confirm/route.ts`
- **KASY_MVP**: Pending receipt flow in telegram route
- **Status**: ⚠️ NEEDS REVIEW
- **Action**: Compare two-message flow logic

---

## Key Files to Copy From KASY_MVP

### Primary Source
- `/Users/josh9281/KASY_MVP/app/api/webhooks/telegram/route.ts` (7535 lines)

### Functions That Need Exact Copying
1. **OCR Prompt** (lines 892-945) → `backend/src/lib/openai.ts`
2. **Overlapping Splits** (lines 629-808) → `backend/src/lib/openai.ts`
3. **Badge Award Logic** (lines 1078-1300+) → `backend/src/app/api/badges/`
4. **Settlement Calculation** → `backend/src/lib/calculations.ts`
5. **PDF Generation** → Need to find `@/app/lib/pdfGenerator.ts`

---

## What I Need From You

Please tell me which specific features you want me to copy the EXACT logic for:

**Option A**: Copy ALL 10 features exactly from KASY_MVP
**Option B**: Tell me which specific ones need updating

For each one, I'll:
1. Read the EXACT code from KASY_MVP
2. Replace/update the current backend code
3. Test that it matches the Telegram behavior

---

**The main issue**: The current backend was built from your README description, not from copying your actual finely-tuned code. That's why "dinner 60 split with jack" doesn't work - the prompts and logic are different!

