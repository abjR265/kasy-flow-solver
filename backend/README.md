# KASY Phase 1 - Backend API

This is the Next.js 14 backend API for KASY, implementing 10 core features adapted from the working Telegram bot.

## Features Implemented

### 1. Smart OCR Receipt Processing
- **Endpoint**: `POST /api/receipts/ocr`
- **Uses**: GPT-4o Vision API
- **Extracts**: merchant, total, tax, tip, date, confidence score
- **Stores**: pending receipt in DB (5-minute TTL)

### 2. Natural Language Parsing
- **Endpoint**: `POST /api/expenses/parse`
- **Uses**: GPT-4o-mini
- **Parses**: "Dinner $60 split with @alice @bob"
- **Returns**: amount, description, payer, participants, confidence

### 3. Overlapping Splits Calculation
- **Endpoint**: `POST /api/expenses/overlapping`
- **Detects**: "split into two halves", "Half 1: ... Half 2: ..."
- **Calculates**: per-group shares, overlapping user breakdown
- **Preserves**: exact capitalization of names

### 4. Gentle Collector Reminders (Cron)
- **Endpoint**: `GET /api/cron/reminders`
- **Schedule**: Hourly via Vercel Cron
- **Cadence**: T+24h, T+48h, T+7d
- **Features**: quiet hours, snooze, opt-out
- **Security**: CRON_SECRET authentication

### 5. Gamification Badges (Monthly Reset)
- **Endpoints**: `POST /api/badges/award`, `GET /api/badges/[userId]`
- **Badges**: Table Hero, Pay It Forward, Even Steven
- **Reset**: Monthly using month/year fields
- **Triggers**: Payment completion events

### 6. Payment Integration
- **Endpoints**: `POST /api/payments/create`, `POST /api/payments/mark-paid`, `GET /api/payments/profile/[userId]`
- **Links**: Venmo deep links, PayPal links
- **Profiles**: Store Venmo/PayPal handles
- **Status**: Track payment completion

### 7. Delegation (Settlement Consolidation)
- **Endpoint**: `GET /api/settlements/[groupId]`
- **Algorithm**: Greedy optimization for minimal payments
- **Filters**: Settlements < $0.01
- **Tracks**: Already-paid settlements

### 8. DM Features (Personal Expense CRUD)
- **Endpoints**: `POST /api/expenses`, `PUT /api/expenses/[id]`, `DELETE /api/expenses/[id]`, `GET /api/expenses`
- **Supports**: Simple splits, overlapping splits, custom shares
- **Stores**: OCR data with expenses
- **Soft Delete**: Audit trail preservation

### 9. PDF Export
- **Endpoint**: `GET /api/exports/pdf/[groupId]`
- **Includes**: expenses, balances, settlements
- **Status**: Structured data returned (PDF generation TODO)

### 10. Two-Message OCR Flow
- **Endpoints**: `POST /api/receipts/pending/[userId]`, `POST /api/receipts/confirm`
- **Features**: DB-backed pending receipts, 5-minute TTL
- **Supports**: Follow-up split instructions, amount editing
- **Flows**: Caption-based OR follow-up

## Database Schema

Adapted from KASY_MVP with web-specific modifications:

- **users** - User profiles with auth, payment methods, rep score
- **groups** - Group memberships with vault associations  
- **expenses** - Expense records with split logic (simple + overlapping)
- **payments** - Payment requests/settlements with status tracking
- **vaults** - Group shared wallets with USDC balances, autopay rules
- **badges** - Monthly-reset achievement system
- **attestations** - On-chain reputation events
- **reminders** - Gentle Collector™ reminder queue
- **user_preferences** - Reminder settings, quiet hours, timezone
- **pending_receipts** - Two-message OCR flow storage

## Environment Variables

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/kasy_db"
DIRECT_DATABASE_URL="postgresql://username:password@localhost:5432/kasy_db"
OPENAI_API_KEY="sk-your-openai-api-key"
CRON_SECRET="your-cron-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_FRONTEND_URL="http://localhost:5173"
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your values
   ```

3. **Setup database**:
   ```bash
   npm run db:push
   npm run db:generate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## API Usage Examples

### OCR Receipt Processing
```bash
curl -X POST http://localhost:3000/api/receipts/ocr \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/receipt.jpg",
    "userId": "user123",
    "groupId": "group456"
  }'
```

### Natural Language Parsing
```bash
curl -X POST http://localhost:3000/api/expenses/parse \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Dinner $60 split with @alice @bob"
  }'
```

### Create Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "group456",
    "payerId": "user123",
    "description": "Dinner",
    "amountCents": 6000,
    "participants": ["user123", "user456", "user789"]
  }'
```

### Get Settlements
```bash
curl http://localhost:3000/api/settlements/group456
```

## Business Logic

All business logic is adapted from the working KASY_MVP Telegram bot:

- **OpenAI Integration**: Exact same prompts for consistency
- **Database Operations**: Retry logic for prepared statement conflicts
- **Badge System**: Monthly reset using month/year fields
- **Settlement Algorithm**: Greedy optimization for minimal payments
- **Overlapping Splits**: Preserves exact capitalization
- **Gentle Collector**: Same cadence and templates

## Deployment

Configured for Vercel deployment with:
- **Cron Jobs**: Hourly reminder processing
- **Edge Functions**: Serverless API endpoints
- **Database**: Supabase PostgreSQL with connection pooling

## Next Steps

1. **Frontend Integration**: Update Vite frontend to call new API endpoints
2. **Authentication**: Implement user authentication flow
3. **PDF Generation**: Complete PDF export using @react-pdf/renderer
4. **Email Notifications**: Replace console.log with actual email sending
5. **Testing**: Add comprehensive test suite
6. **Monitoring**: Add logging and error tracking# Trigger deployment
# Test auto-deploy
# Trigger deployment
