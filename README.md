# KASY Phase 1 - Complete Implementation

This repository contains the complete KASY Phase 1 implementation with both frontend and backend components.

## 🏗️ Architecture

```
kasy-flow-solver/
├── src/                    # Vite React Frontend
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── lib/api/           # API services (now calls backend)
│   ├── stores/            # Zustand state management
│   └── types/             # TypeScript definitions
├── backend/               # Next.js 14 Backend API
│   ├── src/app/api/       # REST API endpoints
│   ├── src/lib/           # Business logic utilities
│   ├── prisma/            # Database schema
│   └── vercel.json        # Cron job configuration
└── README.md              # This file
```

## 🚀 Features Implemented

### 1. Smart OCR Receipt Processing
- **Frontend**: File upload with base64 conversion
- **Backend**: `POST /api/receipts/ocr` using GPT-4o Vision
- **Extracts**: merchant, total, tax, tip, date, confidence score
- **Stores**: pending receipt in DB (5-minute TTL)

### 2. Natural Language Parsing
- **Frontend**: Chat interface with real-time parsing
- **Backend**: `POST /api/expenses/parse` using GPT-4o-mini
- **Parses**: "Dinner $60 split with @alice @bob"
- **Returns**: amount, description, payer, participants, confidence

### 3. Overlapping Splits Calculation
- **Backend**: `POST /api/expenses/overlapping`
- **Detects**: "split into two halves", "Half 1: ... Half 2: ..."
- **Calculates**: per-group shares, overlapping user breakdown
- **Preserves**: exact capitalization of names

### 4. Gentle Collector Reminders (Cron)
- **Backend**: `GET /api/cron/reminders` (hourly via Vercel Cron)
- **Cadence**: T+24h, T+48h, T+7d
- **Features**: quiet hours, snooze, opt-out
- **Security**: CRON_SECRET authentication

### 5. Gamification Badges (Monthly Reset)
- **Backend**: `POST /api/badges/award`, `GET /api/badges/[userId]`
- **Badges**: Table Hero, Pay It Forward, Even Steven
- **Reset**: Monthly using month/year fields
- **Triggers**: Payment completion events

### 6. Payment Integration
- **Backend**: Payment endpoints with Venmo/PayPal deep links
- **Links**: `venmo.com/{handle}?txn=pay&amount={amount}`
- **Profiles**: Store Venmo/PayPal handles
- **Status**: Track payment completion

### 7. Delegation (Settlement Consolidation)
- **Backend**: `GET /api/settlements/[groupId]`
- **Algorithm**: Greedy optimization for minimal payments
- **Filters**: Settlements < $0.01
- **Tracks**: Already-paid settlements

### 8. DM Features (Personal Expense CRUD)
- **Backend**: Full CRUD API for expenses
- **Supports**: Simple splits, overlapping splits, custom shares
- **Stores**: OCR data with expenses
- **Soft Delete**: Audit trail preservation

### 9. PDF Export
- **Backend**: `GET /api/exports/pdf/[groupId]`
- **Includes**: expenses, balances, settlements
- **Status**: Structured data returned (PDF generation TODO)

### 10. Two-Message OCR Flow
- **Backend**: Pending receipt endpoints with DB storage
- **Features**: DB-backed pending receipts, 5-minute TTL
- **Supports**: Follow-up split instructions, amount editing

## 🛠️ Tech Stack

### Frontend (Vite + React)
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** + shadcn/ui components
- **Zustand** for state management
- **React Router** for navigation

### Backend (Next.js 14)
- **Next.js 14** with App Router
- **Prisma ORM** + Supabase PostgreSQL
- **OpenAI** (GPT-4o Vision + GPT-4o-mini)
- **Vercel** deployment with Cron Jobs

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- OpenAI API key

### 1. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp env.example .env.local
# Edit .env.local with your values:
# - DATABASE_URL (Supabase PostgreSQL)
# - OPENAI_API_KEY
# - CRON_SECRET

# Setup database
npm run db:push
npm run db:generate

# Start development server
npm run dev
```

### 2. Setup Frontend

```bash
# In project root
cd ..

# Install dependencies
npm install

# Setup environment
cp env.example .env.local
# Edit .env.local:
# VITE_API_BASE_URL=http://localhost:3000

# Start development server
npm run dev
```

### 3. Test the Integration

1. **Frontend**: Visit `http://localhost:5173`
2. **Backend**: API available at `http://localhost:3000`
3. **Test NLP**: Type "Dinner $60 split with @alice @bob"
4. **Test OCR**: Upload a receipt image
5. **Test Creation**: Click "Confirm & Split" to create expense

## 📊 Database Schema

The backend uses a comprehensive Prisma schema with:

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

## 🔧 API Endpoints

### Receipts
- `POST /api/receipts/ocr` - Process receipt image
- `POST /api/receipts/pending/[userId]` - Store pending receipt
- `POST /api/receipts/confirm` - Confirm pending receipt

### Expenses
- `POST /api/expenses/parse` - Parse natural language
- `POST /api/expenses/overlapping` - Calculate overlapping splits
- `POST /api/expenses` - Create expense
- `GET /api/expenses?groupId=xxx` - List group expenses
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### Payments
- `POST /api/payments/create` - Create payment request
- `POST /api/payments/mark-paid` - Mark payment as paid
- `GET /api/payments/profile/[userId]` - Get payment profile
- `PUT /api/payments/profile/[userId]` - Update payment profile

### Settlements
- `GET /api/settlements/[groupId]` - Get optimized settlements

### Badges
- `POST /api/badges/award` - Award badge
- `GET /api/badges/[userId]` - Get user badges

### Exports
- `GET /api/exports/pdf/[groupId]` - Generate PDF export

### Cron
- `GET /api/cron/reminders` - Process due reminders (hourly)

## 🔑 Environment Variables

### Backend (.env.local)
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/kasy_db"
DIRECT_DATABASE_URL="postgresql://username:password@localhost:5432/kasy_db"
OPENAI_API_KEY="sk-your-openai-api-key"
CRON_SECRET="your-cron-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env.local)
```bash
VITE_API_BASE_URL="http://localhost:3000"
```

## 🚀 Deployment

### Backend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Frontend (Vercel/Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_BASE_URL` to your deployed backend URL

## 🧪 Testing

### Manual Testing
1. **NLP Parsing**: Test various expense formats
2. **OCR Processing**: Upload different receipt types
3. **Overlapping Splits**: Test complex split scenarios
4. **Payment Links**: Verify Venmo/PayPal link generation
5. **Badge System**: Test badge awarding logic
6. **Cron Jobs**: Test reminder processing

### API Testing
```bash
# Test NLP parsing
curl -X POST http://localhost:3000/api/expenses/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "Dinner $60 split with @alice @bob"}'

# Test OCR processing
curl -X POST http://localhost:3000/api/receipts/ocr \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/receipt.jpg", "userId": "user123"}'

# Test settlements
curl http://localhost:3000/api/settlements/group456
```

## 🔄 Business Logic

All business logic is adapted from the working KASY_MVP Telegram bot:

- **OpenAI Integration**: Exact same prompts for consistency
- **Database Operations**: Retry logic for prepared statement conflicts
- **Badge System**: Monthly reset using month/year fields
- **Settlement Algorithm**: Greedy optimization for minimal payments
- **Overlapping Splits**: Preserves exact capitalization
- **Gentle Collector**: Same cadence and templates

## 📈 Next Steps

1. **Authentication**: Implement user authentication flow
2. **Real-time Updates**: Add WebSocket connections
3. **PDF Generation**: Complete PDF export using @react-pdf/renderer
4. **Email Notifications**: Replace console.log with actual email sending
5. **Mobile App**: React Native implementation
6. **Blockchain Integration**: Solana Pay, NFT receipts
7. **Advanced Analytics**: Expense insights and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the KASY platform development.

---

**Built with ❤️ for seamless expense splitting**