# KASY Flow Solver - Function Definition Reference Sheet

*A comprehensive guide to all functions, modules, and API endpoints in the codebase*

---

## 📋 Backend API Routes

| Name | Desc | Source | Example Usage |
|------|------|--------|---------------|
| **POST /api/expenses** | Creates a new expense with simple or overlapping splits. Auto-creates users and groups if they don't exist. | `backend/src/app/api/expenses/route.ts` | User submits "dinner $60 split with jack" → NLP parses → frontend calls this to save expense to database |
| **GET /api/expenses** | Retrieves all expenses for a specific group, optionally filtered by userId | `backend/src/app/api/expenses/route.ts` | Dashboard loads → fetches all expenses for "House Group" to display Recent Expenses list |
| **PUT /api/expenses/[id]** | Updates an existing expense (description, amount, participants, split type) | `backend/src/app/api/expenses/[id]/route.ts` | User clicks "Edit" on expense → modifies amount → saves → updates database record |
| **DELETE /api/expenses/[id]** | Soft-deletes an expense (marks as deleted, preserves audit trail) | `backend/src/app/api/expenses/[id]/route.ts` | User clicks "Delete" on expense → confirms → removes from active view but keeps in DB |
| **POST /api/expenses/clear** | Hard-deletes ALL expenses in a group (demo/testing only) | `backend/src/app/api/expenses/clear/route.ts` | "Clear Database" button in UI → wipes all expenses for clean slate during hackathon demo |
| **POST /api/expenses/parse** | Natural language parsing using GPT-4o-mini. Extracts amount, description, beneficiaries, payer | `backend/src/app/api/expenses/parse/route.ts` | User types "lunch $45 split with alice bob" → API returns structured data: {amount: 45, participants: ['alice', 'bob']} |
| **POST /api/expenses/overlapping** | Detects and calculates overlapping split patterns (e.g., "half 1: alice bob, half 2: bob charlie") | `backend/src/app/api/expenses/overlapping/route.ts` | User submits receipt with multiple sub-groups → calculates per-person shares for overlapping participants |
| **GET /api/settlements/[groupId]** | Calculates optimized settlements using greedy algorithm. Returns who owes whom | `backend/src/app/api/settlements/[groupId]/route.ts` | User clicks "Settle Up" → API calculates minimal payments needed to zero out all balances |
| **POST /api/receipts/ocr** | OCR processing using GPT-4o Vision. Extracts merchant, total, tax, tip, date from receipt image | `backend/src/app/api/receipts/ocr/route.ts` | User uploads receipt photo → Vision API extracts "$24.50 at Coffee Shop" → stores as pending receipt |
| **POST /api/receipts/pending/[userId]** | Retrieves the most recent pending receipt for a user (used in two-message OCR flow) | `backend/src/app/api/receipts/pending/[userId]/route.ts` | User uploads receipt → follows up with "split with alice" → fetches pending receipt + amount |
| **POST /api/receipts/confirm** | Confirms a pending receipt and creates expense. Allows amount editing and participant selection | `backend/src/app/api/receipts/confirm/route.ts` | User clicks "Confirm & Split" after OCR → creates expense from pending receipt → deletes pending |
| **POST /api/payments/create** | Creates a payment request/settlement. Generates Venmo and PayPal deep links | `backend/src/app/api/payments/create/route.ts` | Settlement calculated → "Pay $30 to Alice" button → creates payment with venmo.com/alice?amount=30 link |
| **POST /api/payments/mark-paid** | Marks a payment as paid. Triggers badge evaluation (Table Hero, Pay It Forward) | `backend/src/app/api/payments/mark-paid/route.ts` | Alice receives payment → clicks "Mark Paid" → updates status → checks if user earned any badges |
| **GET /api/payments/profile/[userId]** | Gets user's payment profile (Venmo handle, PayPal email, reputation score) | `backend/src/app/api/payments/profile/[userId]/route.ts` | Settlement view loads → fetches Alice's @alice-venmo handle → displays payment buttons |
| **POST /api/users/profile** | Updates user profile (displayName, venmo, paypal, avatarUrl) | `backend/src/app/api/users/profile/route.ts` | Settings page → user updates "Name: Alice" and "Venmo: @alice-venmo" → saves to database |
| **GET /api/badges/[userId]** | Retrieves all badges earned by a user, optionally filtered by group and month | `backend/src/app/api/badges/[userId]/route.ts` | Reputation page loads → shows "Table Hero", "Pay It Forward", "Even Steven" badges for this month |
| **POST /api/badges/award** | Awards a badge to a user. Implements monthly reset logic | `backend/src/app/api/badges/award/route.ts` | Payment marked paid within 24h → auto-awards "Table Hero" badge → stores in DB with month/year |
| **GET /api/cron/reminders** | Cron job for Gentle Collector reminders. Runs hourly, sends reminders at T+24h, T+48h, T+7d | `backend/src/app/api/cron/reminders/route.ts` | Vercel Cron triggers hourly → checks unpaid settlements → sends gentle reminders to debtors |
| **GET /api/exports/pdf/[groupId]** | Exports group expenses, balances, settlements as structured data (PDF generation TODO) | `backend/src/app/api/exports/pdf/[groupId]/route.ts` | User clicks "Export PDF" → returns all group data formatted for PDF generation |

---

## 🧠 Backend Core Libraries

| Name | Desc | Source | Example Usage |
|------|------|--------|---------------|
| **processReceiptOCR()** | GPT-4o Vision API for receipt OCR. Returns merchant, total, tax, tip, confidence score | `backend/src/lib/openai.ts:25` | Called by /api/receipts/ocr → analyzes receipt image → extracts structured data with high accuracy |
| **parseExpenseTextWithAI()** | GPT-4o-mini NLP parser. Converts "dinner $60 split with alice" into structured expense data | `backend/src/lib/openai.ts:146` | Called by /api/expenses/parse → sends text to OpenAI → returns {amount, description, beneficiaries} |
| **parseOverlappingSplits()** | Detects overlapping split patterns like "half 1: alice bob, half 2: bob charlie" | `backend/src/lib/openai.ts:195` | Called by /api/expenses/overlapping → parses complex split text → calculates per-person shares |
| **calculateBalances()** | Calculates group balances from all expenses. Handles both simple and overlapping splits | `backend/src/lib/calculations.ts:21` | Called by settlements API → sums all expenses → returns who is owed/owes money |
| **calculateSettlements()** | Greedy optimization algorithm for minimal payments. Filters out micro-transactions (<$0.01) | `backend/src/lib/calculations.ts:95` | Called after calculateBalances → optimizes payments → returns [{from: 'bob', to: 'alice', amount: 30}] |
| **awardBadge()** | Awards a badge to a user. Checks for duplicates and implements monthly reset | `backend/src/lib/badges.ts:5` | Called after payment marked paid → checks criteria → awards "Table Hero" if paid within 24h |
| **checkTableHeroBadge()** | Checks if user qualifies for Table Hero badge (paid within 24h of expense creation) | `backend/src/lib/badges.ts:54` | Called by payment completion → compares timestamps → awards badge if criteria met |
| **checkPayItForwardBadge()** | Checks if user qualifies for Pay It Forward badge (paid 3+ settlements in current month) | `backend/src/lib/badges.ts:137` | Called by payment completion → counts monthly payments → awards badge at 3rd payment |
| **checkEvenStevenBadge()** | Checks if group members qualify for Even Steven badge (all settled within 1 hour of expense) | `backend/src/lib/badges.ts:160` | Called by payment completion → checks if all group members paid quickly → awards to all |
| **getUserBadges()** | Retrieves all badges for a user, with optional group and month filtering | `backend/src/lib/badges.ts:277` | Called by Reputation page → fetches user's badge collection → displays with icons |
| **retryWithFreshClient()** | Retries database operations with fresh Prisma client on prepared statement conflicts | `backend/src/lib/prisma.ts:28` | Serverless function hits prepared statement error → auto-retries with fresh connection |

---

## 💻 Frontend API Client Functions

| Name | Desc | Source | Example Usage |
|------|------|--------|---------------|
| **createExpense()** | Frontend wrapper for POST /api/expenses. Creates expense in database | `src/lib/api/backend.ts:6` | User clicks "Confirm & Split" → calls this function → sends expense data to backend |
| **getExpenses()** | Frontend wrapper for GET /api/expenses. Fetches expenses for a group | `src/lib/api/backend.ts:28` | Dashboard component mounts → calls this → displays Recent Expenses list |
| **updateExpense()** | Frontend wrapper for PUT /api/expenses/[id]. Updates existing expense | `src/lib/api/backend.ts:44` | User edits expense amount → calls this → updates database record |
| **deleteExpense()** | Frontend wrapper for DELETE /api/expenses/[id]. Soft-deletes expense | `src/lib/api/backend.ts:60` | User clicks delete → confirms → calls this → removes from view |
| **clearAllExpenses()** | Frontend wrapper for POST /api/expenses/clear. Hard-deletes all expenses (demo only) | `src/lib/api/backend.ts:76` | "Clear Database" button → calls this → wipes all expenses for clean demo |
| **getSettlements()** | Frontend wrapper for GET /api/settlements/[groupId]. Fetches optimized settlements | `src/lib/api/backend.ts:85` | Payments page loads → calls this → displays who owes whom |
| **createPayment()** | Frontend wrapper for POST /api/payments/create. Creates payment request | `src/lib/api/backend.ts:102` | User clicks "Pay Now" → calls this → generates Venmo/PayPal links |
| **markPaymentPaid()** | Frontend wrapper for POST /api/payments/mark-paid. Marks payment complete | `src/lib/api/backend.ts:130` | User marks payment received → calls this → updates status + triggers badges |
| **updatePaymentProfile()** | Frontend wrapper for POST /api/users/profile. Updates user's payment methods | `src/lib/api/backend.ts:168` | Settings page → user saves Venmo handle → calls this → updates database |
| **getUserBadges()** | Frontend wrapper for GET /api/badges/[userId]. Fetches user's badge collection | `src/lib/api/backend.ts:191` | Reputation page loads → calls this → displays earned badges |
| **exportGroupPDF()** | Frontend wrapper for GET /api/exports/pdf/[groupId]. Shows success toast | `src/lib/api/backend.ts:212` | User clicks "Export PDF" → calls this → displays success message |
| **parseNaturalLanguage()** | Frontend wrapper for POST /api/expenses/parse. Calls NLP API | `src/lib/api/nlp.ts:6` | User types expense text → calls this → gets structured data back |
| **extractReceiptData()** | Frontend wrapper for POST /api/receipts/ocr. Calls OCR API with image URL | `src/lib/api/ocr.ts:18` | User uploads receipt image → calls this → gets merchant/total extracted |
| **ocrResultToExpense()** | Converts OCR result to expense format. Maps OCR fields to expense schema | `src/lib/api/ocr.ts:65` | OCR completes → calls this → transforms {merchant, total} into expense object |
| **depositToVault()** | Mock function for USDC vault deposits (Web3 integration TODO) | `src/lib/api/vaults.ts:3` | User clicks "Deposit USDC" → currently returns mock success → will call smart contract |
| **runAutoPay()** | Mock function for automatic settlement payments from vault (Web3 TODO) | `src/lib/api/vaults.ts:15` | Scheduled payment rule triggers → currently mock → will execute on-chain transaction |

---

## 🎨 Frontend Store (Zustand State Management)

| Name | Desc | Source | Example Usage |
|------|------|--------|---------------|
| **useStore** | Global Zustand store for app state. Manages users, groups, expenses, payments, vaults, chat | `src/stores/useStore.ts` | Any component → `const expenses = useStore(state => state.expenses)` → accesses global state |
| **setCurrentUser()** | Updates the currently logged-in user | `src/stores/useStore.ts:42` | Login completes → `setCurrentUser(userData)` → updates global user state |
| **setActiveGroupId()** | Switches the active group context | `src/stores/useStore.ts:47` | User clicks "Switch to House Group" → updates active group → all views filter by this group |
| **addGroup()** | Adds a new group to the store | `src/stores/useStore.ts:48` | User creates "Trip to Hawaii" group → adds to store → appears in group switcher |
| **addExpense()** | Adds a new expense to the local store (for mock data mode) | `src/stores/useStore.ts:53` | Demo mode → user creates expense → adds to local state without API call |
| **updateExpense()** | Updates an expense in the local store | `src/stores/useStore.ts:55` | User edits expense → updates local state → re-renders components |
| **updatePayment()** | Updates a payment request in the local store | `src/stores/useStore.ts:64` | Payment marked paid → updates status in store → UI reflects change |
| **updateVault()** | Updates a vault's balance/settings in the local store | `src/stores/useStore.ts:73` | Vault deposit completes → updates balance → dashboard shows new amount |
| **addChatMessage()** | Adds a message to the chat history (for conversational UI) | `src/stores/useStore.ts:80` | User sends "dinner $60" → adds to chat → bot responds with parsed expense |
| **clearChat()** | Clears all chat messages (reset conversation) | `src/stores/useStore.ts:82` | User clicks "New Conversation" → clears history → fresh chat session |

---

## 🧩 Frontend Components (Key Pages)

| Name | Desc | Source | Example Usage |
|------|------|--------|---------------|
| **Dashboard** | Main dashboard page. Shows recent expenses, quick actions, toggle mock/real data | `src/pages/Dashboard.tsx` | User lands on app → sees expense overview, balances, recent activity |
| **Receipts** | OCR receipt upload page. Handles image upload, OCR processing, follow-up splits | `src/pages/Receipts.tsx` | User clicks "Receipts" tab → uploads photo → AI extracts data → confirms split |
| **Payments** | Settlements and payments page. Shows who owes whom, payment links, mark paid | `src/pages/Payments.tsx` | User clicks "Payments" tab → sees optimized settlements → clicks Venmo link to pay |
| **Reputation** | Gamification page. Displays badges, reputation score, leaderboard | `src/pages/Reputation.tsx` | User clicks "Reputation" tab → sees "Table Hero" badge earned → views group leaderboard |
| **Settings** | User settings page. Update profile, payment methods, notification preferences | `src/pages/Settings.tsx` | User clicks "Settings" tab → updates name/Venmo → saves to database |
| **Vaults** | Web3 vault management page. USDC deposits, autopay rules (mock implementation) | `src/pages/Vaults.tsx` | User clicks "Vaults" tab → sees shared wallet balance → configures autopay rules |
| **Dev** | Developer testing page with mock data generators and test utilities | `src/pages/Dev.tsx` | Developer mode → generates test expenses → tests features without real data |
| **ExpenseCard** | Reusable expense card component. Shows expense details, participants, actions | `src/components/ExpenseCard.tsx` | Dashboard/Receipts pages → renders each expense as card with edit/delete buttons |
| **GroupSwitcher** | Group selection dropdown component | `src/components/GroupSwitcher.tsx` | Header → user clicks dropdown → switches between "House", "Trip", etc. |
| **Layout** | Main app layout wrapper with navigation, sidebar, header | `src/components/Layout.tsx` | Wraps all pages → provides consistent navigation and layout structure |

---

## 📊 Data Models (Prisma Schema)

| Name | Desc | Source | Example Usage |
|------|------|--------|---------------|
| **User** | User profile with auth, payment methods (venmo/paypal), reputation score | `backend/prisma/schema.prisma` | Stores user data: id, email, displayName, venmo, paypal, repScore, avatarUrl |
| **Group** | Group/room entity for organizing expenses | `backend/prisma/schema.prisma` | "House Group", "Trip to Hawaii" - containers for expenses and settlements |
| **Expense** | Expense record with split logic (simple or overlapping), OCR data, participants | `backend/prisma/schema.prisma` | Stores expense: amount, description, payer, participants, splitType, ocrData |
| **Payment** | Payment request/settlement with status tracking, payment links | `backend/prisma/schema.prisma` | Tracks "Bob owes Alice $30" with status: pending/paid, includes venmo/paypal links |
| **Vault** | Group shared wallet with USDC balance, autopay rules (Web3 integration) | `backend/prisma/schema.prisma` | Shared wallet for automatic settlements, stores balance and payment rules |
| **Badge** | Achievement/badge record with monthly reset (month/year fields) | `backend/prisma/schema.prisma` | Stores earned badges: "Table Hero", "Pay It Forward" with earn date and metadata |
| **Attestation** | On-chain reputation events (EAS integration for Web3 reputation) | `backend/prisma/schema.prisma` | Records attestations: "paid on time", "disputed" for blockchain reputation |
| **Reminder** | Gentle Collector reminder queue with cadence tracking | `backend/prisma/schema.prisma` | Stores scheduled reminders: T+24h, T+48h, T+7d with delivery status |
| **UserPreferences** | User notification settings, quiet hours, timezone preferences | `backend/prisma/schema.prisma` | Stores: enableReminders, quietHoursStart/End, timezone, snoozedUntil |
| **PendingReceipt** | Temporary storage for OCR receipts (5-minute TTL) in two-message flow | `backend/prisma/schema.prisma` | User uploads receipt → stored here → follow-up "split with alice" → creates expense |

---

## 🎯 Key Workflows

### 1. **Simple Expense Creation (NLP)**
```
User types: "dinner $60 split with alice bob"
  ↓
parseNaturalLanguage() → POST /api/expenses/parse
  ↓
parseExpenseTextWithAI() → GPT-4o-mini
  ↓
Returns: {amount: 60, description: "dinner", beneficiaries: ["alice", "bob"]}
  ↓
createExpense() → POST /api/expenses
  ↓
Expense saved to database
  ↓
Dashboard refreshes → shows new expense
```

### 2. **OCR Receipt Processing (Two-Message Flow)**
```
User uploads receipt image
  ↓
extractReceiptData() → POST /api/receipts/ocr
  ↓
processReceiptOCR() → GPT-4o Vision
  ↓
Returns: {merchant: "Coffee Shop", total: 24.50, confidence: 0.95}
  ↓
Stored as PendingReceipt (5-min TTL)
  ↓
User types: "split with alice"
  ↓
Frontend fetches pending receipt → adds participants
  ↓
POST /api/receipts/confirm → creates expense
  ↓
PendingReceipt deleted → Expense created
```

### 3. **Settlement Calculation & Payment**
```
User clicks "Payments" tab
  ↓
getSettlements() → GET /api/settlements/[groupId]
  ↓
calculateBalances() → sums all expenses per user
  ↓
calculateSettlements() → greedy optimization algorithm
  ↓
Returns: [{from: "bob", to: "alice", amount: 30}]
  ↓
Display "Bob pays Alice $30" with Venmo/PayPal buttons
  ↓
User clicks Venmo link → pays outside app
  ↓
User clicks "Mark Paid"
  ↓
markPaymentPaid() → POST /api/payments/mark-paid
  ↓
Payment status updated → Badge checks triggered
  ↓
checkTableHeroBadge() → awards if paid within 24h
```

### 4. **Badge Award System**
```
Payment marked paid
  ↓
POST /api/payments/mark-paid
  ↓
Triggers badge evaluation:
  - checkTableHeroBadge() → paid within 24h?
  - checkPayItForwardBadge() → 3rd payment this month?
  - checkEvenStevenBadge() → all group members settled quickly?
  ↓
awardBadge() → creates badge record with month/year
  ↓
Reputation page → getUserBadges() → displays new badge
```

---

## 🔐 Environment Variables Required

| Variable | Purpose | Used By |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) | Backend Prisma client |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o/GPT-4o-mini | OCR and NLP processing |
| `CRON_SECRET` | Security token for cron job authentication | Gentle Collector reminders |
| `NEXT_PUBLIC_FRONTEND_URL` | Frontend URL for CORS | Backend API CORS headers |
| `VITE_API_BASE_URL` | Backend API base URL | Frontend API calls |

---

## 📝 Notes

- **Mock vs Real Data**: Dashboard has toggle to switch between mock fixtures and real database data
- **Soft Delete**: Expenses are soft-deleted (marked deleted) to preserve audit trail
- **Monthly Badge Reset**: Badges use month/year fields for automatic monthly reset
- **5-Minute OCR TTL**: Pending receipts auto-expire after 5 minutes
- **Prepared Statement Handling**: Database operations auto-retry on prepared statement conflicts (serverless)
- **Greedy Settlement Algorithm**: Optimizes for minimal number of payments (adapted from KASY_MVP)
- **Web3 Integration**: Vaults and attestations are partially implemented (smart contract integration TODO)

---

*Generated: 2024-10-29*
*Last Updated: Phase 1 - 10 Core Features Implemented*

