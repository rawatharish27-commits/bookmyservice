# BookYourService

**India's Trusted Home Services Marketplace**

A full-stack service marketplace platform connecting homeowners with verified service professionals for **Plumbing**, **Electrical**, and **HVAC** services. This repository is structured for separate root-level deployment services: `frontend/`, `backend/`, `database/`, and `docker-compose.yml`.

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
| **Frontend** | React + Vite | 5.x / latest |
| **Backend** | Hono.js | 4.x |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui | Latest |
| **Icons** | Lucide React | 0.525+ |
| **Database** | PostgreSQL via Prisma ORM | 6.x |
| **Authentication** | JWT (jose) + bcryptjs | — |
| **Real-Time** | Socket.IO | 4.x |
| **State Management** | Zustand + React Context | 5.x |
| **Server State** | TanStack React Query | 5.x |
| **Forms** | React Hook Form + Zod | 7.x / 4.x |
| **Charts** | Recharts | 2.x |
| **Deployment** | Docker Compose | 3.x |
| **Runtime** | Node.js 20+ | — |
| **Reverse Proxy** | Caddy / Docker network | — |

---

## Project Structure

```
bookmyservice/
├── backend/                       # Hono.js API service
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── api/
│       │   ├── auth/
│       │   ├── bookings/
│       │   ├── categories/
│       │   ├── services/
│       │   ├── users/
│       │   └── reviews/
│       └── shared/
│
├── frontend/                      # React + Vite UI service
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── public/
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── components/
│       └── styles/
│
├── database/                      # PostgreSQL init and migrations
│   └── migrations/
│       └── 0001_init_postgres.sql
│
├── docker-compose.yml             # Root service orchestration
├── README.md
├── Caddyfile                      # Optional reverse proxy config
├── DEPLOYMENT_SUMMARY.md
├── package-lock.json
├── .env                           # Local environment overrides
└── worklog.md
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
│  /*                          ──►  React + Vite Frontend (port 5173)    │
└──────────────────────────────────────────────────────────────┘
        │                                     │
        ▼                                     ▼
┌───────────────────┐              ┌───────────────────────────┐
│  Stats Service    │              │     Hono.js Backend        │
│  (optional)       │              │     (Port 3000)            │
│                   │              │                             │
│  • Real-time      │              │  ┌───────────────────────┐ │
│    visitor count  │              │  │  API routes            │ │
│  • Platform stats │              │  │  /api/auth/*          │ │
│  • data streams   │              │  │  /api/bookings/*      │ │
│                   │              │  │  /api/services/*      │ │
│  Reads PostgreSQL │◄────────────┤  │  /api/users/*         │ │
│  database         │              │  │  /api/reviews/*       │ │
│                   │              │  │  ...and more          │ │
│                   │              │  └───────────┬───────────┘ │
└───────────────────┘              │              │             │
                                   │  ┌───────────▼───────────┐ │
                                   │  │  Prisma ORM           │ │
                                   │  │  (PostgreSQL Client)  │ │
                                   │  └───────────┬───────────┘ │
                                   │              │             │
                                   │  ┌───────────▼───────────┐ │
                                   │  │  PostgreSQL Database  │ │
                                   │  │  database/migrations/  │ │
                                   │  └───────────────────────┘ │
                                   └─────────────────────────────┘
```

### SPA Routing

The current deployment uses a **single-page React application** — `frontend/src/App.tsx` is the entry point and routing is handled by the frontend React router and app state.

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

- **Node.js** 20+ (optional, only for local package install)
- **Docker** 24+ and **Docker Compose**
- **npm** (for local frontend/backend installs if not using Docker)

### Local Deployment with Docker Compose

```bash
# Clone the repository
git clone https://github.com/rawatharish27-commits/bookmyservice.git
cd bookmyservice

# Copy environment example and update values as needed
cp .env.example .env

# Start database, backend, and frontend services
docker compose up -d
```

### Verify Services

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:3000/health`
- Database: `localhost:5432`

### Manual Install (Optional)

```bash
cd backend
npm ci
cd ../frontend
npm ci
```

Then you can start services locally from their folders or use Docker Compose.

### Available Commands

| Command | Description |
|---|---|
| `docker compose up -d` | Start database, backend, and frontend services |
| `docker compose down` | Stop and remove containers |
| `cd backend && npm ci` | Install backend dependencies |
| `cd frontend && npm ci` | Install frontend dependencies |

---

## Environment Variables

The repository supports root-level Docker Compose overrides and service-specific environment configuration. Create or update `.env` with values like below:

```env
# Backend
DATABASE_URL=postgresql://bookmyservice_user:bookmyservice_password@postgres:5432/bookmyservice
JWT_SECRET=your-production-secret-key-change-this
NODE_ENV=development
PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000
```

This file can be used for local overrides. Docker Compose already sets default values for the root services.

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
