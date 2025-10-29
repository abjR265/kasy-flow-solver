# Current Issue: "Failed to create expense"

## Problem
When clicking "Confirm & Split" button, getting error: "Failed to create expense"

## Root Cause
The backend API (`POST /api/expenses`) is failing because:
1. ✅ Backend endpoint exists
2. ❌ Database schema might not be deployed to Supabase
3. ❌ OR Prisma relations causing foreign key constraint errors

## What I Fixed
- Added auto-creation of User and Group when creating expense (upsert logic)
- This should create the required records if they don't exist

## Current Status
- Backend deployed to: https://kasy-flow-solver-nadz8lhvh-kasyai.vercel.app
- Still showing error (might need database migration)

## Next Steps
1. Need to run `prisma db push` to deploy schema to Supabase
2. OR check Vercel deployment logs for the exact error
3. Verify DATABASE_URL is correctly set in Vercel environment

## To Test Manually
```bash
curl -X POST https://kasy-flow-solver-nadz8lhvh-kasyai.vercel.app/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "groupId":"test-group",
    "payerId":"test-user",
    "description":"dinner",
    "amountCents":6000,
    "currency":"USD",
    "participants":["alice"],
    "splitType":"simple"
  }'
```

Expected: `{"success":true,"expense":{...}}`
Actual: `{"error":"Failed to create expense"}`

## Database Connection
- Supabase project: wfpobybkkjzdpqqdgfpx
- DATABASE_URL is set in Vercel env vars
- Schema file: `backend/prisma/schema.prisma`

**Need to push Prisma schema to Supabase database!**

