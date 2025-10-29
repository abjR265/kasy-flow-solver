# E2E Testing Guide for KASY Flow Solver

## 🚀 Latest Deployment

**Backend URL**: https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app
**Status**: ✅ Ready (deployed just now)
**Commit**: `26ca7fe` - All KASY_MVP logic included

⚠️ **Note**: Deployment has Vercel Authentication enabled. You'll need to:
1. Visit the URL in your browser to authenticate via Vercel SSO, OR
2. Disable protection at: https://vercel.com/kasyai/kasy-flow-solver-bck/settings/deployment-protection

---

## 🧪 E2E Test Scenarios

### Test 1: NLP Parsing (The "dinner 60 split with jack" Fix)

**What it tests**: Natural language expense parsing using EXACT KASY_MVP prompt

```bash
# Test the exact case you mentioned
curl -X POST https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/expenses/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"dinner 60 split with jack"}'
```

**Expected response**:
```json
{
  "success": true,
  "parsed": {
    "amount": 60,
    "description": "dinner",
    "confidence": 0.95,
    "beneficiaries": [],
    "payer": null
  }
}
```

**Other test cases**:
```bash
# Test 1: Simple amount
curl -X POST https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/expenses/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"lunch $25"}'

# Test 2: With merchant
curl -X POST https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/expenses/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"starbucks coffee 8.50"}'

# Test 3: Complex split
curl -X POST https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/expenses/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"uber ride 45 split 3 ways with alice and bob"}'
```

---

### Test 2: OCR Receipt Processing

**What it tests**: Receipt image OCR using EXACT KASY_MVP prompt with high accuracy

```bash
# Mock OCR test (you'll need a real receipt URL)
curl -X POST https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/receipts/ocr \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/receipt.jpg"
  }'
```

**Expected response**:
```json
{
  "success": true,
  "ocrResult": {
    "merchant": "Whole Foods",
    "totalAmount": 127.43,
    "confidence": 0.95,
    "items": [...],
    "date": "2025-10-29"
  }
}
```

---

### Test 3: Overlapping Splits

**What it tests**: Complex split logic (EXACT KASY_MVP logic)

```bash
# Test overlapping split pattern
curl -X POST https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/expenses/overlapping \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Half 1: Alice Bob Charlie. Half 2: Alice David Emma",
    "totalCents": 12000
  }'
```

**Expected response**:
```json
{
  "success": true,
  "isOverlapping": true,
  "splitGroups": [
    {
      "groupName": "Half 1",
      "participants": ["split_alice_...", "split_bob_...", "split_charlie_..."],
      "participantNames": {...},
      "totalCents": 6000,
      "perPersonCents": 2000
    },
    {
      "groupName": "Half 2",
      "participants": ["split_alice_...", "split_david_...", "split_emma_..."],
      "participantNames": {...},
      "totalCents": 6000,
      "perPersonCents": 2000
    }
  ],
  "overlappingUsers": {
    "split_alice_...": {
      "groups": ["Half 1", "Half 2"],
      "totalCents": 4000
    }
  }
}
```

---

### Test 4: Settlement Calculation

**What it tests**: Greedy algorithm for minimal transactions

```bash
# First, you need to create some expenses and a group
# Then calculate settlements
curl https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/settlements/GROUP_ID_HERE
```

**Expected response**:
```json
{
  "success": true,
  "settlements": [
    {
      "from": "user1",
      "fromName": "Alice",
      "to": "user2",
      "toName": "Bob",
      "amountCents": 2500,
      "venmoLink": "https://venmo.com/...",
      "paypalLink": "https://paypal.me/...",
      "isPaid": false
    }
  ],
  "balances": [...]
}
```

---

## 🎯 Full E2E Flow Test

Here's a complete user journey test:

### Step 1: Create Test Data (via Frontend)
1. Open: http://localhost:5173 (or your frontend URL)
2. Create a test group: "Dinner Party"
3. Add test users: Alice, Bob, Charlie

### Step 2: Test NLP Expense Creation
```bash
# Parse expense
curl -X POST https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/expenses/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"dinner 60 split with alice bob"}'

# Create expense (you'll need a groupId and payerId from Step 1)
curl -X POST https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "YOUR_GROUP_ID",
    "payerId": "YOUR_USER_ID",
    "description": "dinner",
    "amountCents": 6000,
    "participants": ["alice_id", "bob_id"],
    "splitType": "simple"
  }'
```

### Step 3: View Settlements
```bash
curl https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/settlements/YOUR_GROUP_ID
```

### Step 4: Mark Payment
```bash
curl -X POST https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/payments/mark-paid \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "PAYMENT_ID_FROM_STEP_3"
  }'
```

### Step 5: Check Badges
```bash
curl https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app/api/badges/YOUR_USER_ID
```

---

## 🐛 Testing with Frontend

### Option 1: Update Frontend API URL
```bash
# In the frontend project root
cd /Users/josh9281/kasy-flow-solver

# Update the API URL in your frontend
# Edit src/lib/api/backend.ts and change API_BASE_URL to:
# const API_BASE_URL = 'https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app'

# Or set environment variable
echo "VITE_API_BASE_URL=https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app" > .env.local

# Restart frontend
npm run dev
```

### Option 2: Deploy Frontend and Set Env Var
```bash
# Deploy frontend
vercel --prod

# Add environment variable in Vercel dashboard:
# VITE_API_BASE_URL = https://kasy-flow-solver-3v3g65qgt-kasyai.vercel.app
```

---

## ✅ Verification Checklist

- [ ] NLP parsing works for "dinner 60 split with jack"
- [ ] OCR extracts receipt data accurately
- [ ] Overlapping splits calculate correctly
- [ ] Settlements minimize transaction count
- [ ] Badges are awarded (Table Hero, Pay It Forward, Even Steven)
- [ ] Reminders are scheduled (check `/api/cron/reminders`)
- [ ] Payment profiles work (Venmo/PayPal links)
- [ ] Frontend connects to backend successfully

---

## 🔧 Troubleshooting

### Issue: "Authentication Required"
**Solution**: Either:
1. Visit URL in browser and log in with Vercel SSO
2. Disable deployment protection in Vercel dashboard
3. Use curl with `-L` flag to follow redirects: `curl -L https://...`

### Issue: "CORS Error" from Frontend
**Solution**: Check that backend has CORS enabled for your frontend domain

### Issue: "Database Error"
**Solution**: Verify `DATABASE_URL` environment variable is set in Vercel

---

## 📊 Expected Results

If everything is working correctly:
✅ NLP parsing should match KASY_MVP Telegram bot exactly
✅ "dinner 60 split with jack" should parse to `{amount: 60, description: "dinner"}`
✅ All 10 features should behave identically to KASY_MVP

**Your backend is LIVE and ready to test!** 🎉

