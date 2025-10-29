# Frontend E2E Test Cases

**Backend API**: https://kasy-flow-solver-6hnellsir-kasyai.vercel.app
**Status**: ✅ Live and working

---

## Test 1: Simple NLP Parsing (The Original Issue)

### Input:
```
dinner 60 split with jack
```

### Expected Result:
- Amount: **$60.00**
- Description: **dinner**
- Participants: Should detect "jack" from the text

### What to check:
✅ Amount is parsed correctly as 60
✅ Description is "dinner"
✅ No errors or AI explanations

---

## Test 2: Simple Amount with Description

### Input:
```
lunch 25
```

### Expected Result:
- Amount: **$25.00**
- Description: **lunch**

---

## Test 3: Amount with Dollar Sign

### Input:
```
coffee $8.50
```

### Expected Result:
- Amount: **$8.50**
- Description: **coffee**

---

## Test 4: With Merchant Name

### Input:
```
starbucks coffee 12
```

### Expected Result:
- Amount: **$12.00**
- Description: **coffee** (or "starbucks coffee")

---

## Test 5: Multiple Participants

### Input:
```
uber ride 45 split with alice and bob
```

### Expected Result:
- Amount: **$45.00**
- Description: **uber** (or "uber ride")
- Should mention alice and bob as participants

---

## Test 6: Decimal Amounts

### Input:
```
groceries 127.43
```

### Expected Result:
- Amount: **$127.43**
- Description: **groceries**

---

## Test 7: Three Ways Split

### Input:
```
pizza 60 split 3 ways
```

### Expected Result:
- Amount: **$60.00**
- Description: **pizza**
- Should indicate 3-way split (each person pays $20)

---

## Test 8: Larger Amount

### Input:
```
hotel room 350 split with sarah
```

### Expected Result:
- Amount: **$350.00**
- Description: **hotel** (or "hotel room")
- Participants: sarah

---

## Test 9: Short Format

### Input:
```
drinks 40
```

### Expected Result:
- Amount: **$40.00**
- Description: **drinks**

---

## Test 10: With "for"

### Input:
```
breakfast 30 for me and tom
```

### Expected Result:
- Amount: **$30.00**
- Description: **breakfast**
- Participants: tom

---

## Test 11: Overlapping Splits (Complex)

### Input:
```
dinner 120 - Half 1: Alice Bob Charlie. Half 2: Alice David Emma
```

### Expected Result:
- Amount: **$120.00**
- Description: Should parse as overlapping split
- **Half 1**: Alice, Bob, Charlie (each pays $20)
- **Half 2**: Alice, David, Emma (each pays $20)
- **Alice appears in both**: pays $40 total

### What to check:
✅ Shows overlapping split breakdown
✅ Alice is charged $40 (appears in both halves)
✅ Others are charged $20 each

---

## Test 12: Another Overlapping Pattern

### Input:
```
uber 60 split in half - first half: me jack, second half: me emma
```

### Expected Result:
- Amount: **$60.00**
- **Group 1**: $30 split between you and jack
- **Group 2**: $30 split between you and emma
- **You pay**: $30 total (in both groups)

---

## Test 13: Group A/B Pattern

### Input:
```
groceries 90 - Group A: Tom Jerry. Group B: Tom Ann
```

### Expected Result:
- **Group A**: Tom, Jerry (each pays $22.50)
- **Group B**: Tom, Ann (each pays $22.50)
- **Tom pays**: $45 total

---

## Test 14: Very Simple

### Input:
```
20
```

### Expected Result:
- Amount: **$20.00**
- Description: **Expense** (generic)

---

## Test 15: With "between"

### Input:
```
taxi 35 between alice bob charlie
```

### Expected Result:
- Amount: **$35.00**
- Description: **taxi**
- 3 people: each pays ~$11.67

---

## ❌ Edge Cases That Should Handle Gracefully

### Test 16: Missing Amount
```
dinner with friends
```
**Expected**: Error or prompt to enter amount

### Test 17: Zero Amount
```
free coffee 0
```
**Expected**: Might reject or warn about $0

### Test 18: Negative Amount
```
refund -20
```
**Expected**: Might reject negative

### Test 19: Very Large Amount
```
rent 5000
```
**Expected**: Should work fine, $5000.00

---

## 🎯 OCR Receipt Test (If Available)

### Test 20: Upload Receipt Image
1. Upload a receipt photo/screenshot
2. Should extract:
   - **Merchant name**
   - **Total amount**
   - **Individual items** (if visible)
   - **Date**

---

## 🏆 Badge Testing (After Creating Expenses)

### Test 21: Table Hero Badge
**How to earn**:
1. Create an expense where someone paid
2. Have 90% of debts paid within 7 days
3. Payer should get **Table Hero 🏅** badge

### Test 22: Pay It Forward Badge
**How to earn**:
1. Mark 3 payments as paid quickly (within 24h each)
2. Should get **Pay It Forward ⚡** badge

### Test 23: Even Steven Badge
**How to earn**:
1. Create expenses in a group
2. Have ALL balances settled within 3 days
3. Everyone gets **Even Steven 💫** badge

---

## 💰 Settlement Testing

### Test 24: Simple Settlement
1. Create expense: "dinner 60" paid by Alice, split with Bob, Charlie
2. Go to settlements view
3. **Expected**:
   - Bob owes Alice $20
   - Charlie owes Alice $20
   - Should show Venmo/PayPal links

### Test 25: Complex Balances
1. Create multiple expenses:
   - Alice pays 60 (split with Bob, Charlie)
   - Bob pays 30 (split with Alice, Charlie)  
   - Charlie pays 90 (split with Alice, Bob)
2. **Expected**: Should show MINIMAL settlements (not all combinations)

---

## 📊 Quick Smoke Test Checklist

Do these in order on your deployed frontend:

1. ✅ Parse "dinner 60 split with jack" → Shows $60, description "dinner"
2. ✅ Parse "lunch 25" → Shows $25
3. ✅ Parse overlapping split → Shows correct breakdown
4. ✅ Create expense → Saves to database
5. ✅ View settlements → Shows who owes whom
6. ✅ Mark payment → Updates balance
7. ✅ Check badges → Shows any earned badges

---

## 🐛 Common Issues to Watch For

### Issue: "Amount is undefined" or NaN
**Cause**: NLP parsing failed
**Check**: Backend logs, OpenAI API key

### Issue: "Beneficiaries" showing as empty
**Expected**: This is normal - frontend extracts participants from text

### Issue: Overlapping splits not detected
**Check**: Text must include "half 1", "group a", "h1", etc.

### Issue: Settlements show too many transactions
**Check**: Greedy algorithm should minimize count

---

## 🎉 Success Criteria

Your backend is working correctly if:
✅ "dinner 60 split with jack" parses to $60 + "dinner"
✅ All simple test cases (1-10) work
✅ Overlapping splits (11-13) show correct breakdown
✅ Settlements minimize transaction count
✅ Badges can be earned
✅ No console errors or "AI explanation" responses

**Your backend with EXACT KASY_MVP logic is live and ready to test!** 🚀

