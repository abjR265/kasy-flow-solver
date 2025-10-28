# KASY - AI-Assisted Expense Coordinator

KASY is a modern, AI-powered expense splitting and coordination platform with integrated Solana blockchain features. This is a **frontend-only implementation** with comprehensive mock data and services, ready for backend integration.

## 🚀 Project Overview

KASY enables groups to:
- **Split expenses** using natural language or receipt OCR
- **Process payments** via Venmo, PayPal, or Solana Pay
- **Manage group vaults** with programmable autopay rules
- **Mint NFT receipts** as on-chain proof of expenses
- **Track reputation** with on-chain attestations and badges
- **Earn yield** on vault balances via DeFi protocols

## 📁 Complete File Structure

```
kasy/
├── public/
│   ├── robots.txt
│   ├── favicon.ico
│   └── placeholder.svg
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── use-toast.ts
│   │   ├── ExpenseCard.tsx      # Reusable expense display
│   │   ├── GroupSwitcher.tsx    # Group selection dropdown
│   │   └── Layout.tsx           # Main app layout with navigation
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── api/                 # Mock API services (ready for backend)
│   │   │   ├── nlp.ts          # Natural language expense parsing
│   │   │   ├── ocr.ts          # Receipt OCR extraction
│   │   │   ├── payments.ts     # Payment link generation
│   │   │   ├── receipts.ts     # NFT minting & PDF export
│   │   │   └── vaults.ts       # Vault operations & yield
│   │   ├── fixtures/           # Mock data generators
│   │   │   ├── expenses.ts     # Sample expenses
│   │   │   ├── groups.ts       # Sample groups
│   │   │   ├── payments.ts     # Sample payment requests
│   │   │   ├── users.ts        # Sample users
│   │   │   └── vaults.ts       # Sample vaults
│   │   └── utils.ts            # Utility functions
│   ├── pages/
│   │   ├── Dashboard.tsx       # Chat interface for expense splitting
│   │   ├── Payments.tsx        # Payment requests management
│   │   ├── Vaults.tsx          # Group vault management
│   │   ├── Receipts.tsx        # Expense ledger & NFT receipts
│   │   ├── Reputation.tsx      # User reputation & badges
│   │   ├── Dev.tsx             # Developer portal & SDK docs
│   │   ├── Settings.tsx        # User settings & payment profiles
│   │   └── NotFound.tsx        # 404 page
│   ├── stores/
│   │   └── useStore.ts         # Zustand global state management
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Main app router
│   ├── index.css               # Global styles & design tokens
│   ├── main.tsx                # React entry point
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Design System

### Color Palette (HSL-based)
- **Primary**: Purple (`262 83% 58%`) - Main brand color
- **Secondary**: Teal (`173 80% 40%`) - Accent color
- **Gradients**: Purple-to-teal (`gradient-primary`, `gradient-text`)
- **Dark Mode**: Default theme with deep backgrounds

### Key Design Tokens
```css
--primary: 262 83% 58%
--secondary: 173 80% 40%
--gradient-from: 262 83% 58%
--gradient-to: 173 80% 40%
```

### Tailwind Utilities
- `.gradient-primary` - Purple-to-teal background gradient
- `.gradient-text` - Gradient text effect
- `.card-glow` - Elevated card with glow effect

## 🏗️ Architecture

### State Management (Zustand)
Global store manages:
- **User**: Current user profile and authentication state
- **Groups**: Group memberships and active group selection
- **Expenses**: All expenses across groups
- **Payments**: Payment requests and their statuses
- **Vaults**: Group vaults with balances and rules
- **Chat**: Conversation history for AI assistant

### Mock API Layer
All services in `src/lib/api/` return Promises with artificial delays to simulate network requests. Each function is marked with `// TODO(wire backend)` for easy identification of integration points.

#### API Services
1. **NLP Service** (`nlp.ts`)
   - Parses natural language: "Dinner $60 split with @alice @bob"
   - Returns structured expense data

2. **OCR Service** (`ocr.ts`)
   - Extracts data from receipt images
   - Returns merchant, amount, date, participants

3. **Payments Service** (`payments.ts`)
   - Generates Venmo/PayPal deep links
   - Creates Solana Pay URLs
   - Processes payment confirmations

4. **Receipts Service** (`receipts.ts`)
   - Mints compressed NFTs for expenses
   - Exports expense history to PDF

5. **Vaults Service** (`vaults.ts`)
   - Manages deposits and withdrawals
   - Handles autopay rule execution
   - Suggests and applies yield strategies

## 📱 Pages & Features

### 1. Dashboard (`/`)
**Chat-based expense coordinator**
- Natural language expense parsing
- Receipt image upload with OCR
- Inline split confirmation
- Payment method selection (Venmo/PayPal/Solana)
- Real-time expense status updates

### 2. Payments (`/payments`)
**Payment request management**
- Summary of amounts due and owed
- Payment method filtering
- One-click payment links
- Status tracking (unpaid/processing/paid)
- Payment profile setup prompts

### 3. Vaults (`/vaults`)
**Programmable group wallets**
- Shared USDC balances
- Autopay rules for recurring expenses
- DeFi yield strategies (Kamino, Jito)
- Transaction history
- Member management

### 4. Receipts (`/receipts`)
**Expense ledger**
- Chronological expense history
- NFT receipt minting
- On-chain transaction links
- PDF export functionality
- Filter by status and group

### 5. Reputation (`/reputation`)
**Social credit system**
- Reputation score (0-100)
- Achievement badges
- On-chain payment attestations
- Payment history statistics

### 6. Dev Portal (`/dev`)
**Developer resources**
- SDK documentation
- REST API endpoints
- Webhook event samples
- API key management
- Code examples

### 7. Settings (`/settings`)
**User configuration**
- Profile management
- Payment method setup (Venmo, PayPal)
- Wallet connection (Phantom)
- Notification preferences
- Gentle collector settings

## 🔧 Technologies

### Core Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

### Key Libraries
- **react-router-dom** - Client-side routing
- **zustand** - State management
- **@tanstack/react-query** - Server state management (ready for backend)
- **lucide-react** - Icons
- **date-fns** - Date utilities
- **sonner** - Toast notifications

### Planned Integrations
- **@solana/wallet-adapter-react** - Phantom wallet connection
- **@solana/web3.js** - Solana blockchain interactions

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project
cd kasy

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development
The app runs at `http://localhost:5173` with hot module replacement.

## 🧪 Mock Data

All mock data is located in `src/lib/fixtures/`:
- **4 users**: Alice, Bob, Carol, Angela (with varying rep scores)
- **2 groups**: "Room 4A" (roommates), "Sushi Night Oct 25 2025"
- **5 expenses**: Mix of USD/USDC, various statuses
- **3 payment requests**: Different payment methods
- **1 vault**: With balance, autopay rules, and yield strategy

## 🔌 Backend Integration Guide

### Integration Points (marked with `// TODO(wire backend)`)

1. **Authentication**
   - Replace mock user in `useStore` with real auth
   - Connect to Supabase Auth or custom solution

2. **Database**
   - Replace Zustand fixtures with API calls
   - Implement CRUD operations for expenses, payments, vaults
   - Add real-time subscriptions

3. **AI Services**
   - Wire NLP service to OpenAI/Anthropic
   - Connect OCR to AWS Textract or Google Vision

4. **Blockchain**
   - Implement Solana Pay URL generation
   - Add wallet signing for transactions
   - Connect to Metaplex for compressed NFT minting
   - Integrate DeFi protocols (Kamino, Jito)

5. **Payment Processing**
   - Add webhook handlers for Venmo/PayPal
   - Implement payment verification

6. **Notifications**
   - Set up email/SMS for payment reminders
   - Implement "Gentle Collector" scheduling

## 📊 Type System

Complete TypeScript definitions in `src/types/index.ts`:
- `User` - User profiles with payment methods
- `Group` - Group memberships
- `Expense` - Expense records with participants
- `PaymentRequest` - Payment obligations
- `Vault` - Shared wallet with rules
- `AutoPayRule` - Recurring payment automation
- `YieldStrategy` - DeFi yield configuration
- `Badge` - Achievement system
- `Attestation` - On-chain reputation records

## 🎯 Key Features Implemented

✅ Natural language expense parsing  
✅ Receipt OCR extraction  
✅ Multi-currency support (USD/USDC)  
✅ Three payment methods (Venmo/PayPal/Solana)  
✅ Group vault management  
✅ Autopay rules for recurring expenses  
✅ DeFi yield suggestions  
✅ Compressed NFT receipt minting  
✅ Reputation scoring with badges  
✅ Developer SDK documentation  
✅ Responsive dark mode design  

## 🔮 Future Enhancements

- Real-time collaboration
- Multi-group expense splitting
- Currency conversion
- Expense categories and budgets
- Export to accounting software
- Mobile app (React Native)
- Telegram/Discord bot integration

## 📝 Project Info

**Lovable Project URL**: https://lovable.dev/projects/208fa893-fd10-4acd-ae31-6ef84f3ecfdf

## 🤝 Contributing

This is a Lovable-generated project. Changes can be made via:
1. **Lovable Editor** - Prompt-based development
2. **Local IDE** - Clone and push changes
3. **GitHub Codespaces** - Cloud development environment

## 📄 License

This project is part of the Lovable platform.

---

**Built with ❤️ using [Lovable](https://lovable.dev)**
# Trigger deployment from main branch
