# BookYourService

**India's Trusted Hyperlocal Home Services Marketplace**

A full-stack service marketplace platform connecting homeowners with verified service professionals across **11 service categories**. Built with **React + Vite** (frontend), **Hono.js** (backend), and **PostgreSQL via Supabase** (database), with a hyperlocal 20KM radius service model, referral-driven growth, and area-activation business engine.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Enhancement Phases](#enhancement-phases)
  - [Phase 1 — Reliability](#phase-1--reliability)
  - [Phase 2 — Performance](#phase-2--performance)
  - [Phase 3 — Monitoring & Workers](#phase-3--monitoring--workers)
  - [Phase 4 — Core Business](#phase-4--core-business)
  - [Phase 5 — Security & Production](#phase-5--security--production)
- [How the System Works — Complete Flow](#how-the-system-works--complete-flow)
- [Architecture Diagram](#architecture-diagram)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [Default Accounts](#default-accounts)
- [Legal Compliance](#legal-compliance)
- [Service Categories & Pricing](#service-categories--pricing)
- [License](#license)

---

## Overview

**BookYourService** (`bookyourservice.co.in`) is a legally-compliant Indian home services marketplace that enables:

- **Clients** to browse, book, and review home maintenance services
- **Providers** to list services, manage bookings, and track earnings
- **Technicians** to accept assigned jobs, track availability, and earn
- **Vendors** to supply inventory and manage service-level agreements
- **Franchise Owners** to manage regional operations and earn commissions
- **Area Managers** to activate new service areas and earn referral commissions
- **Admins** to oversee the entire platform, manage users, and resolve disputes

All service pricing is constrained to **₹199 – ₹499**, making home maintenance affordable and transparent. The platform operates on a **hyperlocal model** — services are visible only within a **20KM radius** of the provider, and areas get activated only after hitting critical mass (20 providers + 100 customers).

---

## Features

### Public Pages
- **Landing Page** — Hero section with rotating service text, live visitor/user/provider counters, animated stats, 11 service category showcase with 3D tilt cards
- **Categories** — Browse all 11 service categories with subcategories
- **Service Detail** — Full service info with provider profile, pricing, reviews, availability, work photos
- **Search** — Full-text search across services, categories, and providers
- **About** — Company info, mission, values
- **How It Works** — Step-by-step guide for clients and providers
- **FAQ** — Frequently asked questions with expandable answers
- **Contact** — Contact form with subject categories

### Authentication & Roles
- **8 User Roles:** Client, Provider, Technician, Vendor, Franchise, Sub-Admin, Area Manager, Admin
- **Login** — Email + password authentication with JWT tokens (HS256, 15min expiry)
- **Register** — Role-based registration with terms acceptance
- **Token Management** — Access token (15 min) + persistent sessions via localStorage
- **Auto KYC Creation** — Providers get a pending KYC record on registration

### Client Dashboard (14 pages)
- **Dashboard** — Booking overview, recent activity, quick actions, wallet balance
- **My Bookings** — List all bookings with status filters
- **Booking Detail** — Full booking info with timeline, OTP verification
- **Favorites** — Save services for later
- **Notifications** — Real-time notification feed (IN_APP, SMS, WhatsApp, Email, Push)
- **Reviews** — View and manage submitted reviews
- **Profile** — Edit personal information, change password
- **Wallet** — Balance, cashback, promo balance, deposit, transaction history
- **AMC Plans** — Annual Maintenance Contracts with visit tracking
- **Coupons** — Available discount coupons
- **Referrals** — Refer & Earn with WhatsApp sharing, copy code/link
- **Commissions** — Commission tracking from referrals
- **Invoices** — GST-compliant invoices (18% GST, HSN code, GSTIN)
- **Emergency Booking** — Priority emergency service with premium pricing

### Provider Dashboard (12 pages)
- **Dashboard** — Earnings summary, booking overview, service stats
- **My Services** — List, create, and manage service listings with work photos
- **Create Service** — Add new service with pricing (₹199–₹499), description, availability, service area
- **Bookings** — Accept, reject, start, and complete bookings with OTP
- **Earnings** — Revenue breakdown, platform fee deduction, payment history
- **KYC Verification** — Submit identity documents (Aadhaar, PAN, Driving License, Passport)
- **Reviews** — View client reviews and ratings
- **Profile** — Manage professional profile and service areas
- **Wallet** — Provider wallet with earnings, payouts
- **Payouts** — Request bank transfer/UPI payouts
- **Invoices** — Invoice management per booking

### Technician Dashboard (6 pages)
- **Dashboard** — Job overview, availability toggle, earnings summary
- **My Jobs** — Assigned jobs with accept/complete flow
- **Job Detail** — Full job info with client location
- **Earnings** — Per-job earnings and totals
- **Profile** — Skills, service radius, bank details
- **Availability** — Toggle availability, set working hours

### Admin Dashboard (19 pages)
- **Dashboard** — Platform-wide analytics, user/service/booking counts, revenue overview
- **User Management** — View, block, suspend users; view detailed user profiles
- **Service Management** — Approve/reject service listings, manage service quality
- **Booking Management** — Monitor all bookings, resolve issues
- **Dispute Resolution** — Handle disputes with messaging system, assign priority
- **Category Management** — Add/edit service categories and subcategories
- **FAQ Management** — Create and organize FAQ entries
- **Revenue Analytics** — Revenue streams, commission tracking, charts
- **Audit Logs** — Complete admin action audit trail
- **Analytics** — Platform-wide charts and insights
- **Franchise Management** — List and manage franchise operations
- **CRM** — Customer relationship management with activities and follow-ups
- **Payouts** — Process provider/vendor payout requests
- **Inventory** — Manage spare parts and supplies
- **Coupons** — Create and manage discount coupons
- **AMC** — Manage Annual Maintenance Contract plans
- **B2B** — Manage business-to-business contracts

### Franchise Dashboard (3 pages)
- **Dashboard** — Regional overview, commission tracking
- **Vendors** — Manage vendor relationships
- **Analytics** — Regional performance analytics

### Vendor Dashboard (6 pages)
- **Dashboard** — Supply overview, booking summary
- **Bookings** — Service-level bookings
- **Services** — Manage vendor-provided services
- **Profile** — Business profile and KYC
- **KYC** — Submit business verification documents
- **Wallet** — Vendor wallet and payout tracking

### Area Manager Dashboard (2 pages)
- **Dashboard** — Area overview, activation meter (20 providers / 100 customers target), commission balance, referral list, WhatsApp "Refer Provider" button
- **Commissions** — Commission tracking and payout history

### Hyperlocal & Growth Engine
- **Auto Location Detection** — Browser Geolocation API → reverse geocode to Indian city/pincode via Nominatim
- **Smart Service Visibility** — Services visible only within 20KM radius of provider (PostGIS ST_DWithin)
- **Area Activation** — Areas unlock only after 20 providers + 100 customers join
- **Waiting List** — Users in inactive areas join a waiting list
- **WhatsApp Referral System** — Deep links for viral provider/customer onboarding
- **Referral Network** — Multi-tier referral tracking with ₹50 reward per successful referral
- **Commission Engine** — 3% commission on referred transactions for area managers
- **Pop-Up Funnel** — Non-active area users see "Join Waiting List" + "Refer to Activate" prompts

### Legal & Compliance
- **7 Legal Pages** — Terms of Service, Privacy Policy, Refund Policy, Cookie Policy, Acceptable Use Policy, Provider Agreement, Community Guidelines
- **Terms Acceptance** — Registration requires checkbox acceptance of relevant legal documents
- **Role-Specific Terms** — Clients accept Terms + AUP + Privacy; Providers accept Terms + Provider Agreement + Privacy
- **GST Invoicing** — 18% GST, HSN codes, GSTIN on all invoices

---

## Tech Stack

| Layer | Technology | Version | Role |
|---|---|---|---|
| **Frontend** | React + Vite | 19 / 8 | SPA with 55+ pages, PWA support |
| **Backend** | Hono.js | 4.x | REST API with ~85 endpoints |
| **Language** | TypeScript | 5.x | End-to-end type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first responsive design |
| **UI Components** | shadcn/ui | Latest | Radix-based accessible components |
| **Icons** | Lucide React | 0.525+ | Consistent icon set |
| **Animations** | Framer Motion | 12.x | Page transitions, hover effects, 3D cards |
| **Database** | PostgreSQL (Supabase) | — | Cloud-hosted production database |
| **ORM** | Prisma | 6.x | Type-safe database queries |
| **Authentication** | JWT (jose) + bcryptjs | — | HS256 tokens, bcrypt password hashing |
| **Validation** | Zod | 4.x | Request body validation schemas |
| **Caching** | Redis (with in-memory fallback) | 5.x | Service listings, OTPs, sessions, popular searches |
| **State Management** | Zustand + React Context | 5.x | Client state, navigation, auth |
| **Server State** | TanStack React Query | 5.x | Data fetching, caching, mutations |
| **Forms** | React Hook Form + Zod | 7.x / 4.x | Validated form handling |
| **Charts** | Recharts | 2.x | Analytics and dashboard visualizations |
| **PWA** | vite-plugin-pwa + Workbox | 1.3+ | Offline capability, install prompt |
| **Image Upload** | Cloudinary | 2.x | Profile, service, and KYC image uploads |
| **Push Notifications** | Firebase Cloud Messaging | 13.x | Real-time push via FCM (Android, iOS, Web) |
| **Geospatial** | PostGIS | — | 20KM radius provider search (ST_DWithin) |
| **Queue System** | BullMQ | 5.x | Async notification & booking processing |
| **Rate Limiting** | hono-rate-limiter | 0.5.x | Per-endpoint API rate limiting |
| **Logging** | Winston + Morgan | 3.x / 1.x | Structured logging with file rotation |
| **Monitoring** | Sentry | 10.x | Error tracking, performance, memory monitoring |
| **Security** | Custom middleware | — | XSS/SQLi detection, CSP, bot protection, DDoS throttle |
| **Backup** | node-cron + Supabase Storage | 4.x | Daily automated database backups |
| **CDN/Security** | Cloudflare | — | SSL, CDN, DDoS protection, Bot Management, caching |
| **Reverse Proxy** | Caddy | — | Gateway routing (port 81) |
| **Runtime** | Node.js 20+ | — | Server execution |

---

## Project Structure

```
bookmyservice/
├── .env                              # Root environment variables
├── .env.example                      # Environment variable template
├── Caddyfile                         # Caddy reverse proxy config
├── launcher.js                       # Multi-service launcher (API + Vite + Next.js)
├── start-all.sh                      # Shell script to start all services
├── package.json                      # Root package with scripts
│
├── frontend/                         # React + Vite frontend
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.ts                # Vite config (port 5173, API proxy to 3001, PWA)
│   ├── vite-api-plugin.ts            # Dev middleware for API fallback
│   ├── index.html                    # HTML entry point
│   ├── public/                       # Static assets
│   │   ├── images/                   # 11 service category images
│   │   ├── icon-192.png              # PWA icon
│   │   ├── icon-512.png              # PWA icon
│   │   ├── logo.svg                  # BYS logo
│   │   ├── hero-illustration.png     # Hero section image
│   │   └── manifest.json             # PWA manifest
│   └── src/
│       ├── main.tsx                  # React entry point
│       ├── App.tsx                   # Main app with router (55+ routes)
│       ├── globals.css               # Tailwind + custom CSS (navy blue theme)
│       ├── contexts/
│       │   ├── app-context.tsx        # Navigation state, history, params
│       │   └── auth-context.tsx       # Auth state, login/logout/register, JWT
│       ├── hooks/
│       │   ├── use-api.ts            # API fetch wrapper with auth headers
│       │   ├── use-geolocation.ts     # Browser geolocation hook
│       │   ├── use-toast.ts          # Toast notification hook
│       │   └── use-mobile.ts         # Mobile detection hook
│       ├── lib/
│       │   ├── api-url.ts            # API URL builder (XTransformPort)
│       │   ├── auth.ts               # Auth utility functions
│       │   ├── utils.ts              # shadcn/ui utility (cn)
│       │   ├── password.ts           # Password validation
│       │   ├── sentry.ts             # Frontend Sentry integration
│       │   ├── db.ts                 # IndexedDB local storage
│       │   ├── safe.ts               # Safe execution helpers
│       │   ├── animations.ts         # Framer Motion animation presets
│       │   └── middleware.ts         # Frontend middleware
│       ├── components/
│       │   ├── ui/                   # 35+ shadcn/ui components
│       │   ├── bys/                  # 55+ BookYourService page components
│       │   └── error-boundary.tsx    # React error boundary
│       └── config/
│           └── company.ts            # Company info constants
│
├── mini-services/
│   └── api-service/                  # Hono.js REST API
│       ├── package.json              # API dependencies
│       ├── index.ts                  # Full API server (~3900 lines, ~85 endpoints)
│       ├── lib/
│       │   ├── redis.ts              # Redis cache layer with in-memory fallback
│       │   ├── logger.ts             # Winston structured logging (4 loggers)
│       │   ├── sentry.ts             # Sentry monitoring (API errors, DB, memory)
│       │   ├── postgis.ts            # PostGIS geospatial helpers (ST_DWithin)
│       │   ├── firebase.ts           # FCM push notification integration
│       │   ├── cloudflare.ts         # Cloudflare CDN/DDoS/bot middleware
│       │   ├── cloudinary.ts         # Cloudinary image upload integration
│       │   ├── backup.ts             # Daily backup system (node-cron)
│       │   ├── security.ts           # XSS/SQLi detection, CSP, security headers
│       │   └── db-indexes.ts         # Database index migration script
│       ├── validators/
│       │   ├── login.schema.ts       # Login Zod schema
│       │   ├── signup.schema.ts      # Registration Zod schema
│       │   ├── create-booking.schema.ts  # Booking creation Zod schema
│       │   ├── provider.schema.ts    # Provider service Zod schema
│       │   └── validate.ts           # Zod validation middleware for Hono
│       ├── queues/
│       │   └── index.ts              # BullMQ queue system (notifications, bookings)
│       └── workers/
│           ├── notification-worker.ts # Notification senders (WhatsApp, SMS, Email, Push)
│           ├── notification.worker.ts # Notification worker with retry + DLQ
│           └── booking-worker.ts      # Booking processor (invoice, referral, analytics)
│
├── database/                         # Database layer
│   ├── prisma/
│   │   ├── schema.prisma             # 35+ Prisma models
│   │   └── seed.ts                   # Comprehensive seeder
│   ├── migrations/
│   │   ├── 0001_init.sql             # SQLite initial schema
│   │   ├── 0001_init_postgres.sql    # PostgreSQL initial schema
│   │   ├── 0002_enhanced_schema.sql  # Enhanced schema (roles, wallet, AMC, franchise)
│   │   └── 0002_seed.sql             # Seed data (categories, FAQs, legal pages)
│   └── db/
│       └── custom.db                 # Local SQLite (dev only)
│
└── src/                              # Next.js sandbox (port 3000)
    └── app/
        ├── page.tsx                  # Iframe wrapper → Vite frontend
        ├── layout.tsx                # Next.js layout
        └── globals.css               # Sandbox CSS
```

---

## Enhancement Phases

This project has been enhanced across 5 phases with 15 steps. Each step is non-destructive — existing services continue to work even if enhancement dependencies are unavailable.

### Phase 1 — Reliability

| Step | Feature | Status | Description |
|---|---|---|---|
| 1 | Error Handling | ✅ Done | Global error boundary + API error handler with crash protection |
| 2 | Zod Validation | ✅ Done | 4 validation schemas (login, signup, booking, provider) + validate middleware |

### Phase 2 — Performance

| Step | Feature | Status | Description |
|---|---|---|---|
| 3 | Rate Limiting | ✅ Done | Per-endpoint rate limiting via hono-rate-limiter |
| 4 | Redis Cache | ✅ Done | Redis with automatic in-memory fallback, cache key builders, TTL presets |
| 5 | DB Optimization | ✅ Done | 14 Prisma indexes + PostGIS spatial index for fast queries |

### Phase 3 — Monitoring & Workers

| Step | Feature | Status | Description |
|---|---|---|---|
| 6 | Monitoring | ✅ Done | Sentry integration (API errors, DB errors, memory monitoring, performance) |
| 7 | Notifications | ✅ Done | BullMQ queue system with notification worker + booking worker |
| 8 | Notification Worker | ✅ Done | Retry logic with exponential backoff, dead letter queue, job tracking |
| 9 | Structured Logging | ✅ Done | Winston (4 loggers: main, auth, booking, API) + Morgan HTTP middleware |
| 10 | Frontend Sentry | ✅ Done | React error tracking, blank screen detection, session replay |

### Phase 4 — Core Business

| Step | Feature | Status | Description |
|---|---|---|---|
| 11 | 20KM Radius Search | ✅ Done | PostGIS ST_DWithin geospatial queries, latitude/longitude on providers, GiST spatial index |
| 12 | Push Notifications | ✅ Done | Firebase Cloud Messaging, device token management, 7 booking event templates |

### Phase 5 — Security & Production

| Step | Feature | Status | Description |
|---|---|---|---|
| 13 | Cloudflare | ✅ Done | SSL, CDN caching headers, DDoS throttle, bot protection, real IP extraction |
| 14 | Backup System | ✅ Done | Daily cron backups, Supabase Storage upload, compression, restore, retention cleanup |
| 15 | Analytics Dashboard | ✅ Done | Total bookings, active providers, cancellation rate, top cities, top services, revenue |

---

## How the System Works — Complete Flow

> **No step is skipped.** Below is the full journey from opening the app to the final post-booking process, covering frontend, backend, and database roles at every step.

---

### 1. User Opens the App

```
BROWSER                    CADDY (port 81)              VITE (port 5173)           NEXT.JS (port 3000)
───────                    ─────────────────             ─────────────────           ────────────────────
  |                              |                            |                            |
  |-- GET / ------------------>  |                            |                            |
  |                              |-- reverse_proxy :5173 -->  |                            |
  |                              |                            |                            |
  |   OR (via sandbox)          |                            |                            |
  |                              |                            |                            |
  |-- GET / :3000 ----------->  |                            |     <iframe src=:5173>     |
  |                              |                            |<---------------------------|
  |                              |                            |                            |
  |<-- index.html + React ----  |                            |                            |
  |    + Tailwind CSS            |                            |                            |
  |    + PWA manifest            |                            |                            |
```

**What happens:**
1. **Browser** sends `GET /` to the **Caddy reverse proxy** on port 81
2. **Caddy** routes the request to **Vite dev server** on port 5173 (or Next.js on port 3000 which iframes Vite)
3. **Vite** serves `index.html` which loads React, Tailwind CSS, and PWA manifest
4. **`main.tsx`** renders `<App />` which wraps everything in `<AuthProvider>` and `<AppProvider>`
5. **`AppRouter`** reads `useApp().nav.page` and renders the matching page component (default: `home`)

**Frontend role:** Renders the SPA shell, initializes auth context (checks `localStorage` for `bys_token`), initializes app context (sets page to `home`)

**Backend role:** None yet — this is a static page load

**Database role:** None yet

---

### 2. Auto Location Detection

```
FRONTEND (home-page.tsx)          BROWSER API              HONO API (port 3001)         POSTGRESQL
────────────────────────          ───────────              ─────────────────────         ──────────
      |                               |                           |                         |
      |-- navigator.geolocation -->   |                           |                         |
      |   .getCurrentPosition()       |                           |                         |
      |                               |                           |                         |
      |<-- {lat, lng} --------------  |                           |                         |
      |                               |                           |                         |
      |-- GET /api/location/reverse-geocode?lat=X&lng=Y ------>  |                         |
      |                               |                           |                         |
      |                               |                           |-- SELECT from City ----> |
      |                               |                           |   WHERE lat/lng match    |
      |                               |                           |<-- {city, state, pincode} |
      |                               |                           |                         |
      |<-- {city, state, pincode, pincodes[]} ----------------   |                         |
      |                               |                           |                         |
      |-- Store in AppContext --------|                           |                         |
      |-- Update LocationBar UI -----|                           |                         |
```

**What happens:**
1. **HomePage** component calls `navigator.geolocation.getCurrentPosition()` on mount
2. Browser prompts user for location permission → returns `{lat, lng}`
3. Frontend calls `GET /api/location/reverse-geocode?lat=X&lng=Y`
4. **Hono API** receives lat/lng, compares against 20+ Indian cities in memory (Mumbai, Delhi, Bangalore, etc.)
5. Returns the matching city, state, and valid pincodes
6. Frontend stores the location in **AppContext** and displays in the **LocationBar**
7. User can also manually enter a pincode

---

### 3. Smart Service Visibility (PostGIS)

```
FRONTEND                          HONO API                       POSTGRESQL + PostGIS
────────                          ─────────                      ─────────────────────
    |                                  |                              |
    |-- GET /api/categories -------->  |                              |
    |                                  |-- SELECT ServiceCategory ---> |
    |<-- 11 categories ---------------|<-- 11 rows -------------------|
    |                                  |                              |
    |-- GET /api/providers/nearby ----|                              |
    |   ?lat=X&lng=Y&radius=20000     |                              |
    |                                  |-- ST_DWithin(               ->|
    |                                  |   location,                 ->|
    |                                  |   ST_MakePoint(lng,lat),   ->|
    |                                  |   20000 meters)             ->|
    |<-- {providers: [...]} ----------|<-- nearby providers ----------|
    |                                  |                              |
    |-- IF providers found:           |                              |
    |   Show "Book Now" buttons       |                              |
    |-- IF no providers in 20KM:      |                              |
    |   Show "Join Waiting List"      |                              |
    |   Show "Refer to Activate"      |                              |
```

**What happens:**
1. Frontend fetches all 11 active service categories from `GET /api/categories`
2. For each category, frontend checks `GET /api/providers/nearby?lat=X&lng=Y&radius=20000`
3. API uses **PostGIS ST_DWithin** on the `location` geography column for accurate 20KM radius search
4. If PostGIS is unavailable, falls back to Haversine bounding-box approach
5. If providers exist nearby → category shows "Book Now" with pricing
6. If NO providers within 20KM → category shows **"Service Not Available"** with waiting list options

---

### 4. User Registration & Login

```
FRONTEND (register-page.tsx)      HONO API                       POSTGRESQL
────────────────────────────      ─────────                      ──────────
    |                                  |                              |
    |-- POST /api/auth/register ----> |                              |
    |   {email, phone, name,          |                              |
    |    password, roleId}            |                              |
    |                                  |                              |
    |                                  |-- Zod validation ---------->|
    |                                  |-- Check duplicate email ---->|
    |                                  |-- Check duplicate phone ---->|
    |                                  |-- bcrypt.hash(password, 10)->|
    |                                  |-- INSERT INTO "User" ------->|
    |                                  |-- IF provider: INSERT KYC -->|
    |                                  |-- jose SignJWT (HS256) ------>|
    |<-- {user, accessToken} ---------|                              |
    |                                  |                              |
    |-- Store token in localStorage   |                              |
    |-- Navigate to role dashboard    |                              |
```

**What happens:**
1. User fills the registration form with name, email, phone, password, and selects role
2. User must check legal agreement checkboxes (role-specific)
3. Frontend sends `POST /api/auth/register` — validated by **Zod signup schema** before processing
4. **Hono API** validates all fields via Zod, checks for duplicate email/phone
5. API hashes password with **bcryptjs** (salt rounds: 10)
6. API generates a unique user ID (`usr_` + UUID)
7. API inserts the user into the **`User`** table in PostgreSQL
8. If the role is **Provider** (roleId=2), API creates a **`ProviderKyc`** record with `PENDING` status
9. API generates a **JWT** using `jose` with HS256 algorithm, 15-minute expiry
10. **Auth logger** records the registration event
11. Returns the user object (without passwordHash) and the accessToken

---

### 5. Client Browses & Books a Service

```
FRONTEND                          HONO API                       POSTGRESQL
────────                          ─────────                      ──────────
    |                                  |                              |
    |-- POST /api/bookings ---------->|                              |
    |   {serviceId, scheduledDate,    |                              |
    |    scheduledTime, address}      |                              |
    |                                  |-- Zod validation            |
    |                                  |-- Check Redis cache         |
    |                                  |-- Calculate pricing:        |
    |                                  |   base + emergency + weekend |
    |                                  |   - coupon = finalPrice      |
    |                                  |   platformFee = 10%          |
    |                                  |-- Generate OTP (6 digits)   |
    |                                  |-- INSERT INTO Booking ------>|
    |                                  |-- INSERT INTO Timeline ----->|
    |                                  |-- INSERT INTO Notification ->|
    |                                  |-- Push FCM notification ---->|
    |                                  |-- Push BullMQ job ---------->|
    |<-- {booking, bookingNumber} ----|                              |
```

**What happens:**
1. Client browses categories → selects one → sees services within 20KM
2. Client clicks "Book Now" → booking form with date/time picker, address, optional coupon
3. Frontend sends `POST /api/bookings` — validated by **Zod create-booking schema**
4. **Hono API** calculates the final price with dynamic pricing rules
5. API generates a **6-digit OTP** for service verification
6. API creates the **Booking** record with `status = PENDING`
7. API creates **BookingTimeline** entry and **Notification** for provider
8. API sends **FCM push notification** to provider about new booking
9. API pushes a **BullMQ job** for booking confirmation (email, SMS, WhatsApp)
10. **Booking logger** records the booking creation event
11. Frontend navigates to the booking confirmation page

---

### 6. Booking Lifecycle & OTP Verification

```
                     BOOKING STATUS FLOW

Client Books ─────────────────────────────► PENDING
                                                  │
                              ┌────────────────────┴────────────────────┐
                              ▼                                         ▼
                    Provider Accepts                              Provider Rejects
                              │                                         │
                              ▼                                         ▼
                         ACCEPTED                                 REJECTED (terminal)
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
             Provider Assigned     Client Cancels
                    │                    │
                    ▼                    ▼
                ASSIGNED             CANCELLED (refund)
                    │
                    ▼
             Provider En Route
                    │
                    ▼
               ON_THE_WAY
                    │
                    ▼
              Provider Arrives
                    │
                    ▼
                ARRIVED
                    │
                    ▼
             Provider Starts
                    │
                    ▼
              IN_PROGRESS
                    │
              ┌─────┴──────┐
              ▼            ▼
          Complete      Cancel
              │            │
              ▼            ▼
      OTP Verification  CANCELLED (refund)
              │
        ┌─────┴──────┐
        ▼            ▼
    OTP Match    OTP Failed
        │            │
        ▼            ▼
    COMPLETED    Retry OTP
        │
        ▼
    Review Created
        │
        ▼
    Payment Released
    from Escrow
```

**OTP Flow:**
- When a booking is created, API generates a **6-digit OTP** with an expiry time
- OTP is shown to the **Client** on the booking detail page
- **FCM push notification** sends OTP to the client's device
- When the provider marks the service as complete, the **Client must provide the OTP** to the provider
- Provider enters the OTP → API verifies it → booking marked as `COMPLETED`

---

### 7. Push Notification Flow (FCM)

```
BOOKING EVENT           FCM TEMPLATE                   CHANNELS
─────────────           ────────────                   ────────
Booking Confirmed  →    ✅ Booking Confirmed!     →    Push + In-App
Provider Accepted  →    🎉 Provider Accepted!     →    Push + In-App
Provider Arriving  →    🚶 Provider on the way!   →    Push + In-App
Booking Completed  →    🎉 Service Completed!     →    Push + In-App
Booking Cancelled  →    ❌ Booking Cancelled      →    Push + In-App
New Booking (Provider) → 🔔 New Booking Request!  →    Push + In-App
Booking OTP        →    🔐 Your Booking OTP       →    Push + In-App
```

**How it works:**
1. Frontend registers FCM token via `POST /api/devices/token`
2. On booking events, API queries `DeviceToken` table for user's active tokens
3. API uses `BookingPushTemplates` to generate notification content
4. API calls `sendPushToDevice()` or `sendPushToDevices()` via Firebase Admin SDK
5. Invalid/unregistered tokens are automatically cleaned up
6. If Firebase credentials are not configured, all push operations are logged as stubs

---

### 8. Notification Worker Pipeline

```
API Route → pushNotificationJob() → BullMQ Queue → Worker → Send
                                                  ↓ (failure)
                                              Retry (exponential backoff)
                                                  ↓ (max retries)
                                              Dead Letter Queue
                                                  ↓ (admin)
                                              Recover Job → Re-queue
```

**Worker features:**
- **Max 3 retries** with exponential backoff (5s → 10s → 20s) + jitter
- **Dead Letter Queue** for permanently failed jobs
- **Job metrics**: total processed, succeeded, failed, dead-lettered
- **Recovery endpoint**: `POST /api/worker/recover/:jobId`
- **Monitoring**: `GET /api/worker/status`, `GET /api/worker/jobs`, `GET /api/worker/dead-letter`

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLOUDFLARE CDN                                  │
│                    SSL · CDN · DDoS · Bot Protection · Cache                 │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           CADDY REVERSE PROXY (Port 81)                      │
│                                                                              │
│   /            → Vite Frontend (Port 5173)                                  │
│   /api/*       → Hono API (Port 3001)                                       │
│   /*           → Next.js Sandbox (Port 3000)                                │
└──────────┬─────────────────────────────────┬─────────────────────────────────┘
           │                                 │
           ▼                                 ▼
┌──────────────────────┐        ┌──────────────────────────────────────────────┐
│   REACT + VITE SPA   │        │              HONO.JS API                     │
│   (Port 5173)        │───────▶│              (Port 3001)                     │
│                      │        │                                              │
│  • 55+ Pages         │        │  ┌─────────────┐  ┌─────────────────────┐   │
│  • Zustand State     │        │  │ Zod Validator│  │ Rate Limiter        │   │
│  • React Query       │        │  └──────┬──────┘  └──────────┬──────────┘   │
│  • Framer Motion     │        │         │                    │              │
│  • shadcn/ui         │        │  ┌──────▼──────┐  ┌─────────▼──────────┐   │
│  • Sentry Frontend   │        │  │   Routes    │  │ Security Middleware │   │
│  • PWA Support       │        │  │  (~85 APIs) │  │ (XSS, SQLi, CSP)   │   │
└──────────────────────┘        │  └──────┬──────┘  └─────────┬──────────┘   │
                                │         │                    │              │
                                │  ┌──────▼──────┐  ┌─────────▼──────────┐   │
                                │  │ Redis Cache │  │ Cloudflare MW      │   │
                                │  │ (w/ fallback│  │ (Bot, DDoS, CDN)   │   │
                                │  └──────┬──────┘  └─────────┬──────────┘   │
                                │         │                    │              │
                                │  ┌──────▼─────────────────────▼──────────┐  │
                                │  │           Winston Logger              │  │
                                │  │  (main, auth, booking, API loggers)   │  │
                                │  └──────────────────┬────────────────────┘  │
                                │                     │                       │
                                │  ┌──────────────────▼────────────────────┐  │
                                │  │           Sentry Monitor              │  │
                                │  │  (errors, perf, memory, breadcrumbs) │  │
                                │  └──────────────────┬────────────────────┘  │
                                │                     │                       │
                                │  ┌──────────────────▼────────────────────┐  │
                                │  │     BullMQ Queues + Workers           │  │
                                │  │  • Notification Queue (concurrency:5)│  │
                                │  │  • Booking Queue (concurrency:3)     │  │
                                │  │  • Retry + Dead Letter Queue         │  │
                                │  └──────────────────┬────────────────────┘  │
                                │                     │                       │
                                │  ┌──────────────────▼────────────────────┐  │
                                │  │     Firebase Cloud Messaging          │  │
                                │  │  • sendPushToDevice()                │  │
                                │  │  • sendPushToDevices() (multicast)   │  │
                                │  │  • sendPushToTopic()                 │  │
                                │  │  • 7 booking event templates         │  │
                                │  └──────────────────┬────────────────────┘  │
                                │                     │                       │
                                │  ┌──────────────────▼────────────────────┐  │
                                │  │     Backup System (node-cron)         │  │
                                │  │  • Daily at 2 AM IST                 │  │
                                │  │  • Supabase Storage upload            │  │
                                │  │  • Compression + Retention (30 days) │  │
                                │  └──────────────────────────────────────┘  │
                                └──────────────────────┬──────────────────────┘
                                                       │
                                           ┌───────────▼───────────┐
                                           │   SUPABASE POSTGRESQL  │
                                           │   + PostGIS Extension  │
                                           │                        │
                                           │  • 35+ Prisma Models   │
                                           │  • 14 DB Indexes       │
                                           │  • GiST Spatial Index  │
                                           │  • Automated Backups   │
                                           └────────────────────────┘
```

---

## Database Schema

The database has **35+ models** organized into these domains:

| Domain | Models | Key Features |
|---|---|---|
| **Users & Roles** | User, Role, TechnicianProfile, ProviderKyc | 8 roles, location (lat/lng + PostGIS), verification |
| **Services** | ServiceCategory, ServiceSubcategory, Service, ServiceAvailability, ServiceArea, WorkPhoto | Category hierarchy, approval workflow, geospatial |
| **Bookings** | Booking, BookingTimeline, BookingTracking | 9 status states, OTP verification, live tracking |
| **Payments** | Payment, Wallet, WalletTransaction | Escrow system, multi-method, INR currency |
| **Pricing** | PricingRule | Dynamic rules: emergency, weekend, distance, time slot |
| **AMC** | AMCPlan, AMCSubscription, AMCSReminder | Annual contracts, visit tracking, auto-renew |
| **Franchise** | Franchise, FranchiseVendor, FranchiseAnalytics | Regional operations, commission tracking |
| **Coupons** | Coupon, CouponUsage | Percentage/fixed discounts, usage limits |
| **Referrals** | Referral, ReferralReward | Multi-tier tracking, cash/credit/discount rewards |
| **Invoices** | Invoice | GST-compliant (18%), HSN codes, GSTIN |
| **CRM** | CRMActivity, FollowUp | Activity tracking, follow-up management |
| **Disputes** | Dispute, DisputeMessage, ComplaintEscalation | Multi-level escalation (L1→L2→L3) |
| **Inventory** | InventoryItem, InventoryUsage | Spare parts management, usage tracking |
| **B2B** | B2BContract | Office maintenance, society contracts, bulk bookings |
| **Content** | Faq, LegalPage, SeoMetadata, RevenueStream, PlatformStats, City, ContactMessage, VisitorSession | Static content, SEO, analytics |
| **Admin** | AdminLog, AuditLog, AdminAction, Favorite, Notification | Audit trails, user actions |

### PostGIS Spatial Schema

```sql
-- Enabled on startup
CREATE EXTENSION IF NOT EXISTS postgis;

-- User table has location geography column
ALTER TABLE "User" ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN longitude DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN location GEOGRAPHY(POINT, 4326);

-- Populate from lat/lng
UPDATE "User" SET location = ST_MakePoint(longitude, latitude)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

-- GiST spatial index for fast radius queries
CREATE INDEX idx_users_location ON "User" USING GIST (location);
```

### Runtime Tables (Created by API)

```sql
-- FCM Device Tokens (for push notifications)
CREATE TABLE "DeviceToken" (
  id VARCHAR PRIMARY KEY,
  "userId" VARCHAR NOT NULL,
  token VARCHAR NOT NULL,
  platform VARCHAR DEFAULT 'unknown',
  "appVersion" VARCHAR,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Backup Records (for daily backup system)
CREATE TABLE "BackupRecord" (
  id VARCHAR PRIMARY KEY,
  timestamp TIMESTAMP,
  status VARCHAR DEFAULT 'IN_PROGRESS',
  "totalTables" INT DEFAULT 0,
  "totalRows" INT DEFAULT 0,
  "sizeBytes" BIGINT DEFAULT 0,
  duration INT DEFAULT 0,
  "storageLocation" VARCHAR DEFAULT 'database',
  data TEXT,
  error TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login with email + password |
| POST | `/api/auth/register` | Public | Register with Zod validation |
| GET | `/api/auth/me` | JWT | Get current user profile |

### Categories & Services
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | Public | All active categories (cached) |
| GET | `/api/categories/:id/services` | Public | Services by category |
| GET | `/api/services` | Public | Service listings (cached, paginated) |
| GET | `/api/services/:id` | Public | Service detail |
| POST | `/api/services` | Provider | Create service (Zod validated) |

### Provider Search (PostGIS)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/providers/nearby` | Public | 20KM radius search (ST_DWithin) |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings` | Client | Create booking (Zod validated) |
| GET | `/api/bookings` | JWT | List bookings (filtered by role) |
| GET | `/api/bookings/:id` | JWT | Booking detail with timeline |
| PATCH | `/api/bookings/:id` | JWT | Update booking status |
| POST | `/api/bookings/:id/otp-verify` | JWT | Verify OTP to complete booking |

### Push Notifications (FCM)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/devices/token` | JWT | Register FCM device token |
| DELETE | `/api/devices/token` | JWT | Deactivate device token |
| GET | `/api/fcm/status` | JWT | FCM configuration status |

### Analytics Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/analytics/dashboard` | Admin | Full analytics (bookings, providers, revenue, top cities, top services, cancellation rate) |

### Worker & Queue Monitoring
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/worker/status` | Public | Worker status + retry config |
| GET | `/api/worker/jobs` | Public | Recent notification jobs |
| GET | `/api/worker/dead-letter` | Public | Dead letter queue jobs |
| POST | `/api/worker/recover/:jobId` | Public | Recover a failed job |

### System Health & Monitoring
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | API health check (DB + Redis status) |
| GET | `/api/upload/status` | Public | Cloudinary + queue status |

### Image Upload (Cloudinary)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload/profile` | JWT | Upload profile image |
| POST | `/api/upload/service` | Provider | Upload service image |
| POST | `/api/upload/kyc` | JWT | Upload KYC documents |
| DELETE | `/api/upload/:publicId` | JWT | Delete uploaded image |

### Backup System
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| — | Internal cron | System | Daily backup at 2 AM IST |
| — | `lib/backup.ts` | Admin | Create, restore, list, delete, cleanup |

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (Supabase recommended)
- Redis server (optional — in-memory fallback included)

### Installation

```bash
# Clone the repository
git clone https://github.com/rawatharish27-commits/bookmyservice.git
cd bookmyservice

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install API dependencies
cd mini-services/api-service && npm install && cd ../..

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Start the development server
npm run dev
# OR
bun run dev
```

### Running the Application

The application starts 3 services:
1. **Hono API** on port 3001
2. **Vite Frontend** on port 5173
3. **Next.js Sandbox** on port 3000

All accessible through the Caddy gateway on port 81.

---

## Environment Variables

### Required

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://USER:PASS@HOST:6543/postgres?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key-change-this` |

### Frontend

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `https://your-backend.onrender.com` |
| `VITE_SENTRY_DSN` | Sentry DSN for frontend monitoring | `https://xxx@sentry.io/123` |
| `VITE_SENTRY_RELEASE` | Release version for Sentry | `bookmyservice-frontend@1.0.0` |
| `VITE_SENTRY_TRACES_SAMPLE_RATE` | Performance sampling rate | `0.1` |

### Backend — Caching

| Variable | Description | Example |
|---|---|---|
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |

> If `REDIS_URL` is not set, the app automatically uses in-memory cache fallback.

### Backend — Monitoring

| Variable | Description | Example |
|---|---|---|
| `SENTRY_DSN` | Sentry DSN for backend monitoring | `https://xxx@sentry.io/456` |
| `SENTRY_RELEASE` | Release version | `bookmyservice-api@1.0.0` |
| `SENTRY_TRACES_SAMPLE_RATE` | Performance sampling (0-1) | `0.1` |
| `SENTRY_PROFILES_SAMPLE_RATE` | Profiling sampling (0-1) | `0.1` |
| `LOG_LEVEL` | Winston log level | `info` |

### Backend — Push Notifications (FCM)

| Variable | Description | Example |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project ID | `bookmyservice-prod` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk@bookmyservice.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key (with \n) | `-----BEGIN PRIVATE KEY-----\n...` |

> If Firebase variables are not set, push notifications are logged as stubs (no-op).

### Backend — Image Upload

| Variable | Description | Example |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-secret` |

### Backend — Backup System

| Variable | Description | Example |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGci...` |

---

## Seeding the Database

```bash
# Push Prisma schema to database
cd database && npx prisma db push

# Run the seeder
npx prisma db seed
```

The seeder populates:
- **8 Roles** — Client, Provider, Technician, Vendor, Franchise, Sub-Admin, Area Manager, Admin
- **11 Service Categories** — AC, Plumbing, Electrical, Cleaning, Painting, Carpentry, Pest Control, Appliance Repair, Beauty, Laundry, Moving
- **7 Legal Pages** — Terms, Privacy, Refund, Cookies, AUP, Provider Agreement, Community Guidelines
- **FAQs** — Common questions across categories
- **Pricing Rules** — Emergency, weekend, distance charges
- **Platform Stats** — Initial counters

---

## Default Accounts

After seeding, these test accounts are available:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@bookmyservice.com` | `admin123` |
| Client | `client@bookmyservice.com` | `client123` |
| Provider | `provider@bookmyservice.com` | `provider123` |

---

## Legal Compliance

The platform complies with Indian legal requirements:

- **Terms of Service** — Platform usage terms
- **Privacy Policy** — Data collection and usage (DPDPA compliant)
- **Refund Policy** — Cancellation and refund process
- **Cookie Policy** — Cookie usage and tracking
- **Acceptable Use Policy** — Platform usage restrictions
- **Provider Agreement** — Service provider terms
- **Community Guidelines** — User behavior standards
- **GST Invoicing** — 18% GST with HSN codes and GSTIN on all invoices

---

## Service Categories & Pricing

| # | Category | Price Range | Emergency Available |
|---|---|---|---|
| 1 | AC Service & Repair | ₹199 – ₹499 | ✅ |
| 2 | Plumbing | ₹199 – ₹499 | ✅ |
| 3 | Electrical | ₹199 – ₹499 | ✅ |
| 4 | Home Cleaning | ₹199 – ₹499 | ❌ |
| 5 | Painting | ₹199 – ₹499 | ❌ |
| 6 | Carpentry | ₹199 – ₹499 | ✅ |
| 7 | Pest Control | ₹199 – ₹499 | ❌ |
| 8 | Appliance Repair | ₹199 – ₹499 | ✅ |
| 9 | Beauty & Wellness | ₹199 – ₹499 | ❌ |
| 10 | Laundry | ₹199 – ₹499 | ❌ |
| 11 | Moving & Packing | ₹199 – ₹499 | ✅ |

### Dynamic Pricing Rules

| Rule Type | Charge | Condition |
|---|---|---|
| Emergency | +50% of base price | Emergency booking requested |
| Weekend | +20% of base price | Saturday/Sunday booking |
| Distance | +₹5/km beyond 10km | Service address > 10km from provider |
| Time Slot | +15% of base price | Peak hours (9-11 AM, 6-8 PM) |
| Platform Fee | 10% of final price | Deducted from provider earnings |

---

## License

This project is proprietary software owned by BookYourService. All rights reserved.
