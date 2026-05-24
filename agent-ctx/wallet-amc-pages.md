# Task: Build Client Wallet and AMC Pages

## Summary
Built two comprehensive React components for the BookYourService app:

### 1. Client Wallet Page (`client-wallet-page.tsx`)
- **Wallet Balance Card**: Large gradient card showing total balance, cashback balance, promo balance, and total credited
- **Quick Actions**: 4 action buttons (Add Money, Withdraw, Pay for Service, Promos) with gradient styling
- **Transaction History**: Filterable list (All/Credit/Debit) with category icons, type badges, amounts, and dates; "Show All" pagination
- **Withdrawal Dialog**: Full-featured form with:
  - Available balance display
  - Amount input with quick-select buttons (₹100, ₹500, ₹1000, ₹2000)
  - Withdrawal method selection (BANK/UPI) with visual cards
  - Conditional UPI ID field
  - Live summary panel
  - Success state with animation

API endpoints: `GET /api/wallet`, `GET /api/wallet/transactions`, `POST /api/wallet/withdraw`

### 2. Client AMC Page (`client-amc-page.tsx`)
- **AMC Banner**: Gradient hero with active subscription count
- **Active Subscriptions**: Cards with plan name, category icon, visit progress bar, expiry date, and "expiring soon" warning
- **Past Subscriptions**: Compact list with status badges (Expired/Cancelled/Pending)
- **Available Plans**: Grid of plan cards with:
  - Category icon and gradient bar
  - Price and duration
  - Visit count highlight
  - Features list with checkmarks
  - "Popular" badge for featured plans
  - Subscribe/Already Subscribed button states
- **Subscribe Dialog**: Confirmation with plan summary, features preview, and wallet deduction warning

API endpoints: `GET /api/amc/subscriptions`, `GET /api/amc/plans`, `POST /api/amc/subscribe`

## Technical Details
- Both components use `'use client'` directive
- Follow existing project patterns (useApi, useApiMutation, useAuth, useApp, navigate)
- Emerald/teal gradient color scheme throughout
- Mobile responsive with sm/lg breakpoints
- Framer Motion animations (fadeUp, stagger, spring transitions)
- shadcn/ui components (Card, Button, Badge, Dialog, Input, Progress, Separator, Skeleton)
- TypeScript interfaces for all data types
- No unused imports
