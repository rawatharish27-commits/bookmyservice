# BookYourService

**India's Trusted Home Services Marketplace**

A full-stack service marketplace platform connecting homeowners with verified service professionals for **Plumbing**, **Electrical**, and **HVAC** services. Built with Next.js 16, TypeScript, Prisma, and real-time WebSocket infrastructure.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How the System Works](#how-the-system-works)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [Cloudflare Deployment](#cloudflare-deployment)
- [Default Accounts](#default-accounts)
- [Legal Compliance](#legal-compliance)

---

## Overview

**BookYourService** (`bookyourservice.co.in`) is a legally-compliant Indian home services marketplace that enables:

- **Clients** to browse, book, and review home maintenance services
- **Providers** to list services, manage bookings, and track earnings
- **Admins** to oversee the platform, manage users, and resolve disputes

All service pricing is constrained to **₹199 – ₹499**, making home maintenance affordable and transparent.

---

## Features

### Public Pages
- **Landing Page** — Hero section with real-time visitor/user/provider counters, animated stats, service category showcase
- **Categories** — Browse all service categories (Plumbing, Electrical, HVAC)
- **Service Detail** — Full service info with provider profile, pricing, reviews, availability
- **Search** — Full-text search across services, categories, and providers
- **About** — Company info, mission, values
- **How It Works** — Step-by-step guide for clients and providers
- **FAQ** — Frequently asked questions with expandable answers
- **Contact** — Contact form with subject categories

### Authentication
- **Login** — Email + password authentication with JWT tokens
- **Register** — Role-based registration (Client / Provider) with terms acceptance
- **Token Management** — Access token (15 min) + Refresh token (7 days) via `jose`
- **Persistent Sessions** — localStorage-based session persistence

### Client Dashboard
- **Dashboard** — Booking overview, recent activity, quick actions
- **My Bookings** — List all bookings with status filters (Pending, In Progress, Completed, Cancelled)
- **Booking Detail** — Full booking info with timeline, status tracking
- **Favorites** — Save services for later
- **Notifications** — Real-time notification feed
- **Reviews** — View and manage submitted reviews
- **Profile** — Edit personal information, change password

### Provider Dashboard
- **Dashboard** — Earnings summary, booking overview, service stats
- **My Services** — List, create, and manage service listings
- **Create Service** — Add new service with pricing (₹199–₹499), description, availability
- **Bookings** — Accept, reject, start, and complete bookings
- **Earnings** — Revenue breakdown, payment history
- **KYC Verification** — Submit identity documents (Aadhaar, PAN, Driving License, Passport)
- **Reviews** — View client reviews and ratings
- **Profile** — Manage professional profile and service areas

### Admin Dashboard
- **Dashboard** — Platform-wide analytics, user/service/booking counts, revenue overview
- **User Management** — View, block, suspend users; view detailed user profiles
- **Service Management** — Approve/reject service listings, manage service quality
- **Booking Management** — Monitor all bookings, resolve issues
- **Dispute Resolution** — Handle disputes with messaging system
- **Category Management** — Add/edit service categories and subcategories
- **FAQ Management** — Create and organize FAQ entries
- **Revenue Analytics** — Revenue streams, commission tracking, charts
- **Audit Logs** — Complete admin action audit trail

### Real-Time Features
- **Live Visitor Counter** — Socket.IO-based real-time active visitor count
- **Platform Stats** — Real-time user, provider, service, and booking counts
- **Connection Events** — Visitor join/leave notifications

### Legal & Compliance
- **7 Legal Pages** — Terms of Service, Privacy Policy, Refund Policy, Cookie Policy, Acceptable Use Policy, Provider Agreement, Community Guidelines
- **Terms Acceptance** — Registration requires checkbox acceptance of relevant legal documents
- **Role-Specific Terms** — Clients accept Terms + AUP + Privacy; Providers accept Terms + Provider Agreement + Privacy

### Booking Workflow
1. Client browses services → Selects service → Views details
2. Client books service → Selects date, time, address
3. Provider receives booking → Accepts or Rejects
4. Provider starts service → Status changes to In Progress
5. Provider completes service → Status changes to Completed
6. Client leaves review → Rating and feedback

### Payment System
- **Deferred Payment** — Payment gateway integration prepared (Razorpay/Stripe)
- **Price Negotiation** — Clients can negotiate service prices
- **Refund Processing** — Cancellation and refund workflow
- **Pricing Range** — All services priced between ₹199 – ₹499

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.x |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui (New York) | Latest |
| **Icons** | Lucide React | 0.525+ |
| **Animations** | Framer Motion | 12.x |
| **Database** | SQLite via Prisma ORM | 6.x |
| **Authentication** | JWT (jose) + bcryptjs | — |
| **Real-Time** | Socket.IO | 4.x |
| **State Management** | Zustand + React Context | 5.x |
| **Server State** | TanStack React Query | 5.x |
| **Forms** | React Hook Form + Zod | 7.x / 4.x |
| **Charts** | Recharts | 2.x |
| **Deployment** | Cloudflare Pages (@opennextjs/cloudflare) | 1.x |
| **Runtime** | Bun (dev/seed) / Node.js (prod) | — |
| **Reverse Proxy** | Caddy | — |

---

## Project Structure

```
bookmyservice/
├── prisma/
│   ├── schema.prisma              # Database schema (22 models)
│   └── seed.ts                    # Comprehensive seed data
│
├── src/
│   ├── app/
│   │   ├── api/                   # REST API routes (58 route files)
│   │   │   ├── admin/             # Admin endpoints (analytics, bookings, categories, dashboard, faq, logs, revenue, services, users)
│   │   │   ├── auth/              # Authentication (login, register, profile, change-password)
│   │   │   ├── bookings/          # Booking CRUD + actions (accept, reject, start, complete, cancel)
│   │   │   ├── categories/        # Category CRUD
│   │   │   ├── contact/           # Contact form
│   │   │   ├── disputes/          # Dispute management + messages
│   │   │   ├── faq/               # FAQ listing
│   │   │   ├── favorites/         # User favorites
│   │   │   ├── kyc/               # KYC submit, approve, reject, status
│   │   │   ├── legal/             # Legal page content
│   │   │   ├── negotiations/      # Price negotiation
│   │   │   ├── notifications/     # User notifications
│   │   │   ├── payments/          # Payment create-order, verify, details
│   │   │   ├── reviews/           # Review CRUD
│   │   │   ├── services/          # Service CRUD, approve, availability, search, reviews
│   │   │   ├── stats/             # Platform stats, visitor tracking, cleanup
│   │   │   └── subcategories/     # Subcategory CRUD
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # SPA router (single-page app entry)
│   │
│   ├── components/
│   │   ├── bys/                   # BookYourService page components (43 files)
│   │   │   ├── header.tsx         # Navigation header
│   │   │   ├── footer.tsx         # Footer with legal links
│   │   │   ├── home-page.tsx      # Landing page
│   │   │   ├── login-page.tsx     # Login form
│   │   │   ├── register-page.tsx  # Registration form
│   │   │   ├── categories-page.tsx
│   │   │   ├── category-detail-page.tsx
│   │   │   ├── service-detail-page.tsx
│   │   │   ├── booking-page.tsx
│   │   │   ├── booking-confirmation-page.tsx
│   │   │   ├── search-page.tsx
│   │   │   ├── about-page.tsx
│   │   │   ├── how-it-works-page.tsx
│   │   │   ├── faq-page.tsx
│   │   │   ├── contact-page.tsx
│   │   │   ├── legal-page.tsx     # All 7 legal pages rendered by type
│   │   │   ├── client-*.tsx       # 7 client dashboard pages
│   │   │   ├── provider-*.tsx     # 9 provider dashboard pages
│   │   │   └── admin-*.tsx        # 10 admin dashboard pages
│   │   └── ui/                    # shadcn/ui components (47 files)
│   │
│   ├── contexts/
│   │   ├── app-context.tsx        # Navigation state + SPA routing
│   │   └── auth-context.tsx       # Authentication state + JWT management
│   │
│   ├── hooks/
│   │   ├── use-api.ts             # API request helper
│   │   ├── use-mobile.ts          # Mobile detection
│   │   └── use-toast.ts           # Toast notifications
│   │
│   └── lib/
│       ├── auth.ts                # JWT sign/verify (jose, HS256)
│       ├── db.ts                  # Prisma client singleton
│       ├── middleware.ts          # Auth middleware helpers
│       └── utils.ts               # Utility functions (cn, formatters)
│
├── mini-services/
│   └── stats-service/             # Standalone Socket.IO server
│       ├── index.ts               # WebSocket server (port 3003)
│       ├── package.json
│       └── bun.lock
│
├── db/
│   └── custom.db                  # SQLite database file
│
├── public/
│   ├── hero-illustration.png      # Landing page illustration
│   ├── logo.svg                   # Brand logo
│   └── robots.txt                 # SEO robots file
│
├── next.config.ts                 # Next.js configuration
├── open-next.config.ts            # Cloudflare OpenNext config
├── Caddyfile                      # Reverse proxy configuration
├── package.json
├── bun.lock
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── components.json                # shadcn/ui config
```

---

## How the System Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (SPA)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  React    │  │  Zustand │  │  Socket  │  │  React    │  │
│  │  Pages    │  │  Context │  │  Client  │  │  Query    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│       │              │              │               │        │
└───────┼──────────────┼──────────────┼───────────────┼────────┘
        │              │              │               │
   HTTP │              │         WS   │          HTTP │
        │              │              │               │
┌───────▼──────────────▼──────────────▼───────────────▼────────┐
│                      CADDY REVERSE PROXY (:81)               │
│                                                               │
│  /api/*?XTransformPort=3003  ──►  Stats Service (port 3003) │
│  /*                          ──►  Next.js App (port 3000)    │
└──────────────────────────────────────────────────────────────┘
        │                                     │
        ▼                                     ▼
┌───────────────────┐              ┌───────────────────────────┐
│  Stats Service    │              │     Next.js App            │
│  (Bun + Socket.IO)│              │     (Port 3000)            │
│  Port 3003        │              │                             │
│                   │              │  ┌───────────────────────┐ │
│  • Real-time      │              │  │  Route Handlers (58)  │ │
│    visitor count  │              │  │  /api/auth/*          │ │
│  • Platform stats │              │  │  /api/bookings/*      │ │
│  • 5s broadcast   │              │  │  /api/services/*      │ │
│                   │              │  │  /api/admin/*         │ │
│  Reads SQLite DB  │◄────────────┤  │  /api/payments/*      │ │
│  (read-only)      │              │  │  ...and more          │ │
│                   │              │  └───────────┬───────────┘ │
└───────────────────┘              │              │             │
                                   │  ┌───────────▼───────────┐ │
                                   │  │  Prisma ORM           │ │
                                   │  │  (SQLite Client)      │ │
                                   │  └───────────┬───────────┘ │
                                   │              │             │
                                   │  ┌───────────▼───────────┐ │
                                   │  │  SQLite Database      │ │
                                   │  │  db/custom.db         │ │
                                   │  └───────────────────────┘ │
                                   └─────────────────────────────┘
```

### SPA Routing

The application uses a **single-page architecture** — `src/app/page.tsx` is the only route. All navigation happens through the `AppContext`:

1. **AppContext** manages `page` state and `params` (e.g., `{ page: 'service-detail', params: { id: '123' } }`)
2. **AppRouter** renders the matching component via a `switch` statement
3. **`navigate(page, params)`** pushes current state to history stack, updates page
4. **`goBack()`** pops from history stack for back navigation
5. All components call `useApp().navigate()` for page transitions

### Authentication Flow

```
Register                    Login                     API Request
────────                    _____                     ___________

[Register Form]            [Login Form]              [Component]
     │                          │                         │
     ▼                          ▼                         │
POST /api/auth/register    POST /api/auth/login          │
     │                          │                         │
     ▼                          ▼                         │
Validate + Hash password   Verify password               │
(bcryptjs)                (bcryptjs)                     │
     │                          │                         │
     ▼                          ▼                         │
Create User in DB          Generate JWT                  │
                           (jose, HS256)                 │
     │                          │                         │
     ▼                          ▼                         │
Return accessToken         Return accessToken            │
+ user data                + user data                   │
     │                          │                         │
     ▼                          ▼                         │
AuthContext stores in      AuthContext stores in         │
localStorage              localStorage                  │
(bys_token, bys_user)     (bys_token, bys_user)         │
                                                        │
                                           Attach token  │
                                           to header     │
                                           Authorization: Bearer <token>
                                                        │
                                                        ▼
                                                  API Route Handler
                                                        │
                                                        ▼
                                                  verifyToken()
                                                  (jose, HS256)
                                                        │
                                                        ▼
                                                  Extract userId,
                                                  role from JWT
                                                        │
                                                        ▼
                                                  Process request
```

### Booking Lifecycle

```
Client Books ──► PENDING
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
    Provider Accepts      Provider Rejects
           │                     │
           ▼                     ▼
       ACCEPTED             REJECTED (terminal)
           │
           ▼
    Provider Starts Service
           │
           ▼
      IN_PROGRESS
           │
       ┌───┴───┐
       ▼       ▼
   Complete  Cancel
       │       │
       ▼       ▼
   COMPLETED  CANCELLED (refund)
       │
       ▼
   Client Reviews
       │
       ▼
   Review Created (rating 1-5)
```

### Real-Time Stats Flow

```
Browser                        Stats Service (port 3003)
───────                        ─────────────────────────

[Connect Socket.IO] ──────►  io.on('connection')
                                   │
                              socket.emit('stats:update', initialStats)
                              ◄─────── [Receive stats]
                                   │
                              Every 5 seconds:
                              io.emit('stats:update', freshStats)
                              ◄─────── [Update counters]
                                   │
[Disconnect] ──────────────►  io.emit('visitor:leave')
```

- Frontend connects via: `io("/?XTransformPort=3003")`
- Caddy routes `XTransformPort=3003` to the stats service
- Stats service reads SQLite DB with prepared statements (read-only)
- Active visitor count = connected Socket.IO sockets count

### Data Flow Summary

| Action | Frontend | API Endpoint | Database Operation |
|---|---|---|---|
| Browse services | `categories-page.tsx` | `GET /api/services?categoryId=X` | Prisma `findMany` |
| View service | `service-detail-page.tsx` | `GET /api/services/[id]` | Prisma `findUnique` + includes |
| Book service | `booking-page.tsx` | `POST /api/bookings` | Prisma `create` |
| Accept booking | `provider-bookings-page.tsx` | `POST /api/bookings/[id]/accept` | Prisma `update` status |
| Submit review | `client-reviews-page.tsx` | `POST /api/reviews` | Prisma `create` |
| Admin approve | `admin-services-page.tsx` | `POST /api/services/[id]/approve` | Prisma `update` status |
| KYC submit | `provider-kyc-page.tsx` | `POST /api/kyc/submit` | Prisma `create` |
| Contact form | `contact-page.tsx` | `POST /api/contact` | Prisma `create` |

---

## Database Schema

22 Prisma models with relationships:

```
Role ──1:N──► User
User ──1:N──► Booking (as client)
User ──1:N──► Booking (as provider)
User ──1:N──► Service (as provider)
User ──1:N──► Review
User ──1:N──► Notification
User ──1:N──► Favorite
User ──1:1──► ProviderKyc

ServiceCategory ──1:N──► ServiceSubcategory
ServiceSubcategory ──1:N──► Service
Service ──1:N──► ServiceAvailability
Service ──1:N──► Booking
Service ──1:N──► Review
Service ──1:N──► Favorite

Booking ──1:N──► Payment
Booking ──1:1──► Review
Booking ──1:N──► Dispute
Booking ──1:N──► Negotiation

Dispute ──1:N──► DisputeMessage
```

### Key Enums (via String + Check Constraints)

| Model | Field | Values |
|---|---|---|
| User | status | `PENDING`, `ACTIVE`, `BLOCKED`, `SUSPENDED` |
| Service | approvalStatus | `PENDING`, `APPROVED`, `REJECTED` |
| Booking | status | `PENDING`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REFUNDED` |
| Payment | status | `CREATED`, `PROCESSING`, `SUCCESS`, `FAILED`, `REFUNDED` |
| ProviderKyc | verificationStatus | `PENDING`, `APPROVED`, `REJECTED` |
| Negotiation | status | `PENDING`, `ACCEPTED`, `REJECTED`, `COUNTER` |
| Dispute | status | `OPEN`, `UNDER_REVIEW`, `RESOLVED`, `CLOSED` |

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user (Client/Provider) |
| `POST` | `/api/auth/login` | Login with email + password |
| `PATCH` | `/api/auth/profile` | Update user profile (auth required) |
| `POST` | `/api/auth/change-password` | Change password (auth required) |

### Services
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/services` | List services (filter by category, search) |
| `GET` | `/api/services/[id]` | Get service details |
| `POST` | `/api/services` | Create service (Provider only) |
| `PATCH` | `/api/services/[id]` | Update service |
| `POST` | `/api/services/[id]/approve` | Approve service (Admin) |
| `GET` | `/api/services/[id]/availability` | Get service availability |
| `GET` | `/api/services/[id]/reviews` | Get service reviews |
| `GET` | `/api/services/search` | Search services |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bookings` | List bookings (role-filtered) |
| `POST` | `/api/bookings` | Create booking |
| `GET` | `/api/bookings/[id]` | Get booking details |
| `POST` | `/api/bookings/[id]/accept` | Accept booking (Provider) |
| `POST` | `/api/bookings/[id]/reject` | Reject booking (Provider) |
| `POST` | `/api/bookings/[id]/start` | Start service (Provider) |
| `POST` | `/api/bookings/[id]/complete` | Complete service (Provider) |
| `POST` | `/api/bookings/[id]/cancel` | Cancel booking |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payments/create-order` | Create payment order |
| `POST` | `/api/payments/verify` | Verify payment |
| `GET` | `/api/payments/[id]` | Get payment details |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Dashboard statistics |
| `GET` | `/api/admin/analytics` | Platform analytics |
| `GET` | `/api/admin/users` | List all users |
| `PATCH` | `/api/admin/users/[id]` | Update user status |
| `GET` | `/api/admin/services` | List all services |
| `GET` | `/api/admin/bookings` | List all bookings |
| `GET` | `/api/admin/revenue` | Revenue analytics |
| `GET` | `/api/admin/logs` | Audit logs |
| `GET`/`POST` | `/api/admin/faq` | List/Create FAQs |
| `PATCH`/`DELETE` | `/api/admin/faq/[id]` | Update/Delete FAQ |
| `GET`/`POST` | `/api/admin/categories` | List/Create categories |

### Other
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | List categories |
| `GET` | `/api/categories/[id]` | Category with subcategories |
| `GET` | `/api/subcategories` | List subcategories |
| `GET` | `/api/reviews` | List reviews |
| `GET`/`POST` | `/api/disputes` | List/Create disputes |
| `POST` | `/api/disputes/[id]/messages` | Send dispute message |
| `POST` | `/api/contact` | Submit contact form |
| `POST` | `/api/kyc/submit` | Submit KYC documents |
| `GET` | `/api/stats/platform` | Platform statistics |
| `POST` | `/api/stats/visitor` | Track visitor session |
| `GET` | `/api/legal` | List legal pages |
| `GET` | `/api/legal/[type]` | Get legal page content |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (or Bun runtime)
- **Bun** (for seed script and stats service)

### Installation

```bash
# Clone the repository
git clone https://github.com/rawatharish27-commits/bookmyservice.git
cd bookmyservice

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Push database schema
bun run db:push

# Seed the database with demo data
bun run db:seed

# Start the stats service (Socket.IO on port 3003)
cd mini-services/stats-service && bun run dev &

# Start the Next.js development server (port 3000)
bun run dev
```

### Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start Next.js dev server (port 3000) |
| `bun run build` | Build for production |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:seed` | Seed database with demo data |
| `npm run pages:build` | Build for Cloudflare Pages |
| `npm run pages:preview` | Preview Cloudflare Pages locally |
| `npm run pages:deploy` | Deploy to Cloudflare Pages |

---

## Environment Variables

```env
# Database
DATABASE_URL=file:./db/custom.db

# JWT Authentication
JWT_SECRET=your-production-secret-key-change-this

# Payment Gateway (future)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# App
NEXT_PUBLIC_APP_URL=https://bookyourservice.co.in
```

---

## Seeding the Database

The seed script (`prisma/seed.ts`) creates:

| Entity | Count | Details |
|---|---|---|
| **Roles** | 3 | CLIENT, PROVIDER, ADMIN |
| **Categories** | 3 | Plumbing, Electrical, AC & HVAC |
| **Subcategories** | 30 | 10 per category |
| **Admin** | 1 | admin@bookyourservice.co.in |
| **Providers** | 5 | Across 5 Indian cities with KYC |
| **Clients** | 8 | Various statuses (Active, Pending, Blocked, Suspended) |
| **Services** | 14 | All priced ₹199–₹499 |
| **Bookings** | 12 | All statuses represented |
| **Payments** | 12 | Razorpay gateway records |
| **Reviews** | 8 | Ratings 4–5 for completed bookings |
| **FAQs** | 10+ | Platform-related questions |
| **Legal Pages** | 7 | All policy documents |
| **Revenue Streams** | 5 | Commission, subscription, advertising models |
| **SEO Metadata** | 7 | For key pages |

---

## Cloudflare Deployment

The application is configured for **Cloudflare Pages** deployment using `@opennextjs/cloudflare`.

### Configuration Files

**`next.config.ts`** — Cloudflare-compatible settings:
```typescript
const nextConfig: NextConfig = {
  images: { unoptimized: true },  // Cloudflare compatible
  reactStrictMode: false,
};
```

**`wrangler.toml`** — Cloudflare Pages configuration:
```toml
name = "bookyourservice"
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".open-next/assets"

[vars]
DATABASE_URL = "file:./db/custom.db"
```

**`open-next.config.ts`** — OpenNext adapter configuration:
```typescript
const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};
```

### Build for Cloudflare

```bash
# Build with OpenNext for Cloudflare Pages
npx @opennextjs/cloudflare build

# Or using the npm script
npm run pages:build
```

### Cloudflare Pages Deployment Steps

1. **Connect Repository** — Go to Cloudflare Dashboard → Pages → Create project → Connect `bookmyservice` repo
2. **Build Settings** (configure in Cloudflare dashboard):
   - Framework preset: `Next.js (Static HTML Export)` or leave blank
   - Build command: `npx @opennextjs/cloudflare build`
   - Build output directory: `.open-next/assets`
   - Root directory: `/` (default)
   - Node.js version: `22`
3. **Environment Variables** — Set in Cloudflare dashboard:
   - `DATABASE_URL` — Your production database connection string
   - `JWT_SECRET` — Strong random secret key (min 32 chars)
4. **Deploy** — Click "Save and Deploy". Cloudflare will auto-deploy on every push to `main`

### Local Cloudflare Preview

```bash
# Build first
npx @opennextjs/cloudflare build

# Preview locally with Wrangler
npx wrangler pages dev .open-next/assets
```

### Important Notes for Cloudflare

- **SQLite Limitation**: Cloudflare Workers don't support filesystem SQLite. For production, migrate to **Cloudflare D1** (SQLite-compatible) or **Turso** (libSQL)
- **Images**: Set to `unoptimized: true` since Cloudflare has its own image optimization
- **WebSocket**: Socket.IO stats service needs a separate deployment (Cloudflare Durable Objects or external server)
- **Environment**: Update `DATABASE_URL` to point to your production database (D1/Turso)
- **`wrangler.jsonc` vs `wrangler.toml`**: Cloudflare Pages requires `wrangler.toml` with `pages_build_output_dir`. Do NOT use `wrangler.jsonc` as it will cause build failures

---

## Default Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@bookyourservice.co.in | admin123 |
| **Provider** | rajesh.kumar@gmail.com | provider123 |
| **Provider** | priya.sharma@gmail.com | provider123 |
| **Client** | anita.desai@gmail.com | client123 |
| **Client** | vikram.singh@gmail.com | client123 |

> **Important**: Change all default passwords before production deployment.

---

## Legal Compliance

The platform includes 7 comprehensive legal pages, each with full Indian legal compliance:

| Page | Route | Key Provisions |
|---|---|---|
| **Terms of Service** | `/terms` | 14 sections — IT Act 2000, Consumer Protection 2019, arbitration |
| **Privacy Policy** | `/privacy` | 10 sections — DPDP Act 2023, data rights, consent management |
| **Refund Policy** | `/refund-policy` | 8 sections — RBI guidelines, 7-day refund window |
| **Cookie Policy** | `/cookie-policy` | 7 sections — consent, tracking, opt-out |
| **Acceptable Use Policy** | `/aup` | 25 sections — prohibited conduct, enforcement, penalties |
| **Provider Agreement** | `/provider-agreement` | 13 sections — KYC, service standards, arbitration |
| **Community Guidelines** | `/community-guidelines` | 9 sections — respect, safety, reporting |

### Registration Terms Acceptance

- **Clients** must accept: Terms of Service + Acceptable Use Policy + Privacy Policy
- **Providers** must accept: Terms of Service + Provider Agreement + Privacy Policy

---

## Service Categories & Pricing

All services fall under **Home Maintenance & Repairs** with pricing between **₹199 – ₹499**:

### Plumbing
| # | Service | Price Range |
|---|---|---|
| 1 | Leak Repair | ₹199–₹499 |
| 2 | Pipe Installation | ₹199–₹499 |
| 3 | Drain Cleaning | ₹199–₹499 |
| 4 | Faucet Repair | ₹199–₹499 |
| 5 | Water Heater Service | ₹199–₹499 |
| 6 | Toilet Repair | ₹199–₹499 |
| 7 | Sewer Line Service | ₹199–₹499 |
| 8 | Bathroom Renovation | ₹199–₹499 |
| 9 | Water Filter Installation | ₹199–₹499 |
| 10 | Gas Pipe Fitting | ₹199–₹499 |

### Electrical
| # | Service | Price Range |
|---|---|---|
| 1 | Wiring & Rewiring | ₹199–₹499 |
| 2 | Switch Board Repair | ₹199–₹499 |
| 3 | Ceiling Fan Installation | ₹199–₹499 |
| 4 | MCB / DB Box Service | ₹199–₹499 |
| 5 | Light Fixture Installation | ₹199–₹499 |
| 6 | Inverter / UPS Service | ₹199–₹499 |
| 7 | Earthing & Grounding | ₹199–₹499 |
| 8 | Power Outlet Installation | ₹199–₹499 |
| 9 | Electrical Inspection | ₹199–₹499 |
| 10 | Smart Home Setup | ₹199–₹499 |

### AC & HVAC
| # | Service | Price Range |
|---|---|---|
| 1 | AC Installation | ₹199–₹499 |
| 2 | AC Repair | ₹199–₹499 |
| 3 | AC Gas Refill | ₹199–₹499 |
| 4 | AC Deep Cleaning | ₹199–₹499 |
| 5 | AC Annual Maintenance | ₹199–₹499 |
| 6 | Heater Repair | ₹199–₹499 |
| 7 | Ventilation Service | ₹199–₹499 |
| 8 | Duct Cleaning | ₹199–₹499 |
| 9 | Thermostat Installation | ₹199–₹499 |
| 10 | HVAC System Inspection | ₹199–₹499 |

---

## License

Proprietary — All rights reserved. © 2025 BookYourService
