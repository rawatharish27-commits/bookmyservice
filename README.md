# BookYourService

**India's Trusted Hyperlocal Home Services Marketplace**

A full-stack service marketplace platform connecting homeowners with verified service professionals across **11 service categories**. Built with **React + Vite** (frontend), **Hono.js** (backend), and **PostgreSQL via Supabase** (database), with a hyperlocal 20KM radius service model, referral-driven growth, and area-activation business engine.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How the System Works — Complete Flow](#how-the-system-works--complete-flow)
  - [1. User Opens the App](#1-user-opens-the-app)
  - [2. Auto Location Detection](#2-auto-location-detection)
  - [3. Smart Service Visibility](#3-smart-service-visibility)
  - [4. User Registration & Login](#4-user-registration--login)
  - [5. Client Browses & Books a Service](#5-client-browses--books-a-service)
  - [6. Provider Receives & Manages Booking](#6-provider-receives--manages-booking)
  - [7. Booking Lifecycle & OTP Verification](#7-booking-lifecycle--otp-verification)
  - [8. Payment, Invoice & GST](#8-payment-invoice--gst)
  - [9. Review & Rating](#9-review--rating)
  - [10. Referral & WhatsApp Viral Growth](#10-referral--whatsapp-viral-growth)
  - [11. Commission Engine](#11-commission-engine)
  - [12. Area Activation & Target-Based Expansion](#12-area-activation--target-based-expansion)
  - [13. Career / Area Manager System](#13-career--area-manager-system)
  - [14. Pop-Up Funnel](#14-pop-up-funnel)
  - [15. Hyperlocal Expansion](#15-hyperlocal-expansion)
  - [16. Franchise & Vendor Model](#16-franchise--vendor-model)
  - [17. Admin Oversight & Dispute Resolution](#17-admin-oversight--dispute-resolution)
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
- **Smart Service Visibility** — Services visible only within 20KM radius of provider
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
| **Backend** | Hono.js | 4.x | REST API with ~80 endpoints |
| **Language** | TypeScript | 5.x | End-to-end type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first responsive design |
| **UI Components** | shadcn/ui | Latest | Radix-based accessible components |
| **Icons** | Lucide React | 0.525+ | Consistent icon set |
| **Animations** | Framer Motion | 12.x | Page transitions, hover effects, 3D cards |
| **Database** | PostgreSQL (Supabase) | — | Cloud-hosted production database |
| **ORM** | Prisma | 6.x | Type-safe database queries |
| **Authentication** | JWT (jose) + bcryptjs | — | HS256 tokens, bcrypt password hashing |
| **State Management** | Zustand + React Context | 5.x | Client state, navigation, auth |
| **Server State** | TanStack React Query | 5.x | Data fetching, caching, mutations |
| **Forms** | React Hook Form + Zod | 7.x / 4.x | Validated form handling |
| **Charts** | Recharts | 2.x | Analytics and dashboard visualizations |
| **PWA** | vite-plugin-pwa + Workbox | 1.3+ | Offline capability, install prompt |
| **Reverse Proxy** | Caddy | — | Gateway routing (port 81) |
| **Runtime** | Node.js 20+ | — | Server execution |

---

## Project Structure

```
bookmyservice/
├── .env                              # Root environment variables
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
│       │   └── password.ts           # Password validation
│       ├── components/
│       │   ├── ui/                   # 35+ shadcn/ui components
│       │   └── bys/                  # 55+ BookYourService page components
│       │       ├── home-page.tsx             # Landing page
│       │       ├── header.tsx                # Role-based navigation header
│       │       ├── footer.tsx                # 5-column footer
│       │       ├── login-page.tsx            # Login form
│       │       ├── register-page.tsx         # Registration form
│       │       ├── booking-page.tsx          # Booking flow
│       │       ├── booking-confirmation-page.tsx
│       │       ├── emergency-booking-page.tsx
│       │       ├── client-dashboard-page.tsx
│       │       ├── client-bookings-page.tsx
│       │       ├── client-referrals-page.tsx
│       │       ├── client-commissions-page.tsx
│       │       ├── client-wallet-page.tsx
│       │       ├── client-amc-page.tsx
│       │       ├── provider-dashboard-page.tsx
│       │       ├── provider-create-service-page.tsx
│       │       ├── provider-kyc-page.tsx
│       │       ├── provider-earnings-page.tsx
│       │       ├── technician-dashboard-page.tsx
│       │       ├── admin-dashboard-page.tsx
│       │       ├── admin-analytics-page.tsx
│       │       ├── admin-disputes-page.tsx
│       │       ├── area-manager-dashboard-page.tsx
│       │       ├── franchise-dashboard-page.tsx
│       │       ├── vendor-dashboard-page.tsx
│       │       └── ... (55+ total)
│
├── mini-services/
│   └── api-service/                  # Hono.js REST API
│       ├── package.json              # API dependencies (hono, pg, jose, bcryptjs)
│       └── index.ts                  # Full API server (~2150 lines, ~80 endpoints)
│
├── database/                         # Database layer
│   ├── prisma/
│   │   ├── schema.prisma             # 35 Prisma models
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

**Frontend role:** Triggers geolocation, calls reverse geocode API, stores location in context, shows LocationBar

**Backend role:** Receives lat/lng, performs city matching against the 20+ Indian cities dataset, returns city/pincode info

**Database role:** The cities data is currently in-memory in the API (not in DB), but can be migrated to the `City` table

---

### 3. Smart Service Visibility

```
FRONTEND                          HONO API                       POSTGRESQL
────────                          ─────────                      ──────────
    |                                  |                              |
    |-- GET /api/categories -------->  |                              |
    |                                  |-- SELECT ServiceCategory ---> |
    |                                  |   WHERE isActive = true       |
    |                                  |   ORDER BY displayOrder       |
    |                                  |<-- 11 categories -------------|
    |                                  |                              |
    |<-- {categories: [...]} ---------|                              |
    |                                  |                              |
    |-- GET /api/providers/nearby ----|                              |
    |   ?lat=X&lng=Y&categoryId=Z     |                              |
    |                                  |-- SELECT Service -----------> |
    |                                  |   WHERE categoryId = Z        |
    |                                  |   AND isActive = true          |
    |                                  |   AND isApproved = true        |
    |                                  |   AND ST_Distance(lat/lng) < 20km
    |                                  |<-- nearby providers ----------|
    |                                  |                              |
    |<-- {providers: [...]} ----------|                              |
    |                                  |                              |
    |-- IF providers found:           |                              |
    |   Show "Book Now" buttons       |                              |
    |-- IF no providers in 20KM:      |                              |
    |   Show "Join Waiting List"      |                              |
    |   Show "Refer to Activate"      |                              |
```

**What happens:**
1. Frontend fetches all 11 active service categories from `GET /api/categories`
2. For each category, frontend checks `GET /api/providers/nearby?lat=X&lng=Y&categoryId=Z`
3. API filters services by **20KM radius** from user's location
4. If providers exist nearby → category shows "Book Now" with pricing
5. If NO providers within 20KM → category shows **"Service Not Available"** with two options:
   - **"Join Waiting List"** → `POST /api/waiting-list/join` → stored in memory
   - **"Refer to Activate"** → redirects to referral page

**Frontend role:** Fetches categories, checks nearby provider availability, conditionally renders booking or waiting-list UI

**Backend role:** Proximity search (20KM radius), returns available providers per category, handles waiting list submissions

**Database role:** `ServiceCategory` table for categories, `Service` table with lat/lng for proximity queries, `ServiceArea` table for pincode-based coverage

---

### 4. User Registration & Login

```
FRONTEND (register-page.tsx)      HONO API                       POSTGRESQL
────────────────────────────      ─────────                      ──────────
    |                                  |                              |
    |-- User fills form:              |                              |
    |   name, email, phone,           |                              |
    |   password, roleId              |                              |
    |   ☑ Terms of Service            |                              |
    |   ☑ Privacy Policy              |                              |
    |   ☑ AUP / Provider Agreement    |                              |
    |                                  |                              |
    |-- POST /api/auth/register ----> |                              |
    |   {email, phone, name,          |                              |
    |    password, roleId}            |                              |
    |                                  |                              |
    |                                  |-- Check User WHERE email --->|
    |                                  |<-- No duplicate found -------|
    |                                  |                              |
    |                                  |-- Check User WHERE phone --->|
    |                                  |<-- No duplicate found -------|
    |                                  |                              |
    |                                  |-- bcrypt.hash(password, 10)->|
    |                                  |   → passwordHash              |
    |                                  |                              |
    |                                  |-- INSERT INTO "User" ------->|
    |                                  |   (id, email, phone,         |
    |                                  |    passwordHash, name,        |
    |                                  |    roleId, status='ACTIVE')   |
    |                                  |<-- User created --------------|
    |                                  |                              |
    |                                  |-- IF roleId=2 (PROVIDER):   |
    |                                  |   INSERT INTO "ProviderKyc"->|
    |                                  |   (status='PENDING')         |
    |                                  |                              |
    |                                  |-- jose SignJWT:             |
    |                                  |   {sub, email, role, roleId} |
    |                                  |   HS256, 15min expiry        |
    |                                  |                              |
    |<-- {user, accessToken} ---------|                              |
    |                                  |                              |
    |-- AuthContext stores:           |                              |
    |   bys_token in localStorage     |                              |
    |   bys_user in localStorage      |                              |
    |                                  |                              |
    |-- Navigate to role dashboard    |                              |
```

**What happens:**
1. User fills the registration form with name, email, phone, password, and selects role
2. User must check legal agreement checkboxes (role-specific)
3. Frontend sends `POST /api/auth/register` with all fields
4. **Hono API** validates all fields, checks for duplicate email/phone
5. API hashes password with **bcryptjs** (salt rounds: 10)
6. API generates a unique user ID (`usr_` + UUID)
7. API inserts the user into the **`User`** table in PostgreSQL
8. If the role is **Provider** (roleId=2), API also creates a **`ProviderKyc`** record with `PENDING` status
9. API generates a **JWT** using `jose` with HS256 algorithm, 15-minute expiry
10. Returns the user object (without passwordHash) and the accessToken
11. **AuthContext** stores the token and user in `localStorage` as `bys_token` and `bys_user`
12. Frontend navigates to the appropriate role dashboard

**Frontend role:** Renders registration form, validates input, stores JWT and user data, redirects to dashboard

**Backend role:** Validates fields, checks duplicates, hashes password, creates user in DB, creates KYC for providers, generates JWT

**Database role:** `User` table stores the new record, `ProviderKyc` table gets a pending record for providers, `Role` table defines role permissions

---

### 5. Client Browses & Books a Service

```
FRONTEND                          HONO API                       POSTGRESQL
────────                          ─────────                      ──────────
    |                                  |                              |
    |-- Browse categories ----------->|                              |
    |   GET /api/categories           |-- SELECT ServiceCategory ---->|
    |<-- 11 categories ---------------|<-- 11 rows -------------------|
    |                                  |                              |
    |-- Click category (e.g. AC) ---->|                              |
    |   GET /api/categories/4/services|-- SELECT Service + JOIN ----->|
    |<-- {services: [...]} -----------|<-- Services with providers ---|
    |                                  |                              |
    |-- Click service ---------------->|                              |
    |   GET /api/services/:id         |-- SELECT Service + ----------->|
    |                                  |   JOIN User (provider)        |
    |                                  |   JOIN ServiceAvailability    |
    |                                  |   JOIN Review                 |
    |<-- {service, availability,      |<-- Full service detail -------|
    |    reviews}                      |                              |
    |                                  |                              |
    |-- Click "Book Now" ------------>|                              |
    |   Navigate to booking-page      |                              |
    |   Select date, time, address    |                              |
    |   Apply coupon (optional)       |                              |
    |                                  |                              |
    |-- POST /api/bookings ---------->|                              |
    |   {serviceId, scheduledDate,    |                              |
    |    scheduledTime, address,      |                              |
    |    couponCode?}                 |                              |
    |                                  |-- Calculate pricing:         |
    |                                  |   basePrice from Service      |
    |                                  |   + emergencyCharge (if any)  |
    |                                  |   + weekendCharge (if any)    |
    |                                  |   - couponDiscount (if any)   |
    |                                  |   = finalPrice                |
    |                                  |   platformFee = 10%           |
    |                                  |   providerEarnings = 90%      |
    |                                  |                              |
    |                                  |-- Generate OTP (6 digits)    |
    |                                  |                              |
    |                                  |-- INSERT INTO Booking ------->|
    |                                  |   status = 'PENDING'          |
    |                                  |   bookingNumber = 'BYS-XXXXX' |
    |                                  |   otp, otpExpiry              |
    |                                  |                              |
    |                                  |-- INSERT INTO BookingTimeline|
    |                                  |   {status: 'PENDING',         |
    |                                  |    description: 'Booking created'}
    |                                  |                              |
    |                                  |-- INSERT INTO Notification ->|
    |                                  |   to provider: 'New booking'  |
    |                                  |                              |
    |<-- {booking, bookingNumber} ----|                              |
    |                                  |                              |
    |-- Navigate to booking-          |                              |
    |   confirmation page             |                              |
```

**What happens:**
1. Client browses categories → selects one → sees services within 20KM
2. Client clicks a service → sees full detail with provider info, reviews, availability slots
3. Client clicks "Book Now" → booking form with date/time picker, address, optional coupon
4. Frontend sends `POST /api/bookings` with serviceId, scheduledDate, scheduledTime, address, optional couponCode
5. **Hono API** calculates the final price:
   - `basePrice` from the Service
   - `+ emergencyCharge` if emergency booking (from `PricingRule`)
   - `+ weekendCharge` if weekend (from `PricingRule`)
   - `+ distanceCharge` if applicable
   - `- couponDiscount` if valid coupon applied
   - `= finalPrice`
   - `platformFee = 10%` of finalPrice
   - `providerEarnings = 90%` of finalPrice
6. API generates a **6-digit OTP** for service verification
7. API creates the **Booking** record with `status = PENDING`
8. API creates a **BookingTimeline** entry recording the booking creation
9. API creates a **Notification** for the provider about the new booking
10. Frontend navigates to the booking confirmation page showing the booking number

**Frontend role:** Renders browsing, service detail, and booking forms; sends booking request; shows confirmation

**Backend role:** Calculates dynamic pricing, generates OTP, creates booking with timeline, notifies provider

**Database role:** `Booking` table (new record), `BookingTimeline` table (status history), `Notification` table (provider alert), `PricingRule` table (pricing logic), `Coupon`/`CouponUsage` tables (discount tracking)

---

### 6. Provider Receives & Manages Booking

```
PROVIDER FRONTEND                 HONO API                       POSTGRESQL
──────────────────                ─────────                      ──────────
    |                                  |                              |
    |-- GET /api/bookings?role=PROVIDER|-- SELECT Booking ----------->|
    |   (on dashboard load)            |   WHERE providerId = userId  |
    |<-- {bookings: [...]} ------------|<-- Provider's bookings ------|
    |                                  |                              |
    |-- Provider clicks "Accept" ----->|                              |
    |   PATCH /api/bookings/:id        |                              |
    |   {status: 'ACCEPTED'}           |                              |
    |                                  |-- UPDATE Booking ----------->|
    |                                  |   SET status = 'ACCEPTED'     |
    |                                  |                              |
    |                                  |-- INSERT INTO BookingTimeline|
    |                                  |   {status: 'ACCEPTED'}       |
    |                                  |                              |
    |                                  |-- INSERT INTO Notification ->|
    |                                  |   to client: 'Booking accepted'|
    |                                  |                              |
    |<-- {booking, status} ------------|                              |
    |                                  |                              |
    |-- Provider clicks "Start" ------>|                              |
    |   (after arriving at client)     |                              |
    |   PATCH /api/bookings/:id        |                              |
    |   {status: 'IN_PROGRESS'}        |                              |
    |                                  |-- UPDATE Booking ----------->|
    |                                  |   SET status = 'IN_PROGRESS'  |
    |                                  |-- INSERT INTO BookingTimeline|
    |                                  |   INSERT INTO Notification ->|
    |<-- {booking} --------------------|                              |
    |                                  |                              |
    |-- Provider clicks "Complete" --->|                              |
    |   + Client provides OTP -------->|                              |
    |   POST /api/bookings/:id/otp-verify                            |
    |   {otp: '123456'}               |                              |
    |                                  |-- Verify OTP:                |
    |                                  |   match otp + not expired     |
    |                                  |-- UPDATE Booking ----------->|
    |                                  |   SET status = 'COMPLETED'    |
    |                                  |-- INSERT INTO BookingTimeline|
    |                                  |-- INSERT INTO Payment ------->|
    |                                  |   amount, escrowStatus        |
    |                                  |-- INSERT INTO Notification ->|
    |                                  |   to client: 'Rate your service'|
    |<-- {booking, status} ------------|                              |
```

**What happens:**
1. Provider's dashboard loads → fetches their bookings from `GET /api/bookings`
2. Provider sees new PENDING bookings with client info, address, scheduled time
3. Provider clicks **Accept** → API updates booking status to `ACCEPTED`, creates timeline entry, notifies client
4. Provider arrives at client's location → clicks **Start Service** → status becomes `IN_PROGRESS`
5. Service is completed → Provider clicks **Complete** → client must provide the **OTP**
6. API verifies the OTP → marks booking as `COMPLETED`
7. API creates a **Payment** record with escrow status
8. API sends notification to client asking for a review

**Frontend role:** Displays bookings with status actions, handles Accept/Start/Complete buttons, OTP input dialog

**Backend role:** Updates booking status, verifies OTP, creates payment records, sends notifications at each step

**Database role:** `Booking` (status updates), `BookingTimeline` (audit trail), `Notification` (alerts), `Payment` (escrow record)

---

### 7. Booking Lifecycle & OTP Verification

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
- When the provider marks the service as complete, the **Client must provide the OTP** to the provider
- Provider enters the OTP → API verifies it → booking status changes to `COMPLETED`
- If OTP is wrong or expired → error is returned, provider can request re-entry

**Frontend role:** Shows OTP to client, provides OTP input for provider, handles verification UI

**Backend role:** Generates OTP, verifies OTP, handles expiry, updates booking status on success

**Database role:** `Booking` table stores `otp`, `otpExpiry`, and all status timestamps; `BookingTimeline` records every status change

---

### 8. Payment, Invoice & GST

```
BOOKING COMPLETED                 HONO API                       POSTGRESQL
──────────────────                ─────────                      ──────────
    |                                  |                              |
    |   (After OTP verification)       |                              |
    |                                  |-- CREATE Payment record ---->|
    |                                  |   amount = finalPrice         |
    |                                  |   platformFee = 10%           |
    |                                  |   providerEarnings = 90%      |
    |                                  |   escrowStatus = 'HELD'       |
    |                                  |                              |
    |                                  |-- CREATE Invoice ----------->|
    |                                  |   subtotal                    |
    |                                  |   gstAmount = 18%             |
    |                                  |   totalAmount                 |
    |                                  |   gstin = '27AABCB1234F1ZH'  |
    |                                  |   hsnCode = '9983'            |
    |                                  |                              |
    |                                  |-- UPDATE Provider Wallet ---->|
    |                                  |   +providerEarnings           |
    |                                  |   UPDATE totalEarned          |
    |                                  |                              |
    |                                  |-- After 7-day escrow:        |
    |                                  |   UPDATE Payment             |
    |                                  |   SET escrowStatus='RELEASED' |
    |                                  |                              |
    |<-- Client downloads invoice ----|                              |
    |    from GET /api/invoices/:id    |                              |
```

**What happens:**
1. When booking is completed (OTP verified), API creates a **Payment** record
2. Payment includes: `finalPrice`, `platformFee` (10%), `providerEarnings` (90%), `escrowStatus = HELD`
3. API creates a **GST-compliant Invoice** with:
   - Subtotal (base amount)
   - GST @ 18% (9% CGST + 9% SGST for intra-state)
   - Total amount
   - GSTIN: `27AABCB1234F1ZH`
   - HSN Code: `9983` (for repair services)
4. Provider's **Wallet** is updated with the earnings
5. After a **7-day escrow period** (for dispute window), payment is released
6. Client can download the invoice from the Invoices page

**Frontend role:** Displays invoice with GST breakdown, allows download, shows wallet balance

**Backend role:** Creates payment and invoice records, calculates GST, manages escrow, updates wallets

**Database role:** `Payment` table (escrow tracking), `Invoice` table (GST details), `Wallet` table (balance), `WalletTransaction` table (credit/debit history)

---

### 9. Review & Rating

```
CLIENT FRONTEND                   HONO API                       POSTGRESQL
──────────────────                ─────────                      ──────────
    |                                  |                              |
    |-- Click "Rate Service" -------->|                              |
    |   POST /api/reviews             |                              |
    |   {bookingId, serviceId,        |                              |
    |    rating (1-5), comment}       |                              |
    |                                  |-- INSERT INTO Review ------->|
    |                                  |   rating, comment, images     |
    |                                  |                              |
    |                                  |-- UPDATE Service ------------>|
    |                                  |   averageRating = AVG(ratings)|
    |                                  |   totalReviews = COUNT(*)     |
    |                                  |                              |
    |                                  |-- INSERT INTO Notification ->|
    |                                  |   to provider: 'New review'   |
    |                                  |                              |
    |<-- {review} --------------------|                              |
```

**What happens:**
1. After booking is completed, client receives a notification to rate the service
2. Client submits a review with rating (1-5 stars), comment, and optional images
3. API creates a `Review` record linked to the booking and service
4. API updates the `Service.averageRating` and `Service.totalReviews`
5. Provider receives a notification about the new review

**Frontend role:** Review form with star rating, comment, image upload; displays reviews on service detail page

**Backend role:** Creates review record, recalculates service average rating, notifies provider

**Database role:** `Review` table (rating, comment, images, isFlagged), `Service` table (averageRating, totalReviews updated)

---

### 10. Referral & WhatsApp Viral Growth

```
CLIENT / AREA MANAGER             HONO API                       POSTGRESQL
────────────────────              ─────────                      ──────────
    |                                  |                              |
    |-- Navigate to "Refer & Earn" -->|                              |
    |   GET /api/referrals            |-- SELECT Referral ----------->|
    |<-- {referrals, code} -----------|<-- User's referral history ---|
    |                                  |                              |
    |-- Click "Share on WhatsApp" --->|                              |
    |   GET /api/referral/            |                              |
    |       whatsapp-message?code=XYZ |                              |
    |<-- {message: "Hey! Book your... |                              |
    |    home service with BYS...     |                              |
    |    Use code XYZ for ₹50 off"}   |                              |
    |                                  |                              |
    |-- window.open(whatsapp://send?  |                              |
    |    text=encoded_message)        |                              |
    |                                  |                              |
    |   [Recipient clicks link]       |                              |
    |   [Lands on register page]      |                              |
    |                                  |                              |
    |   POST /api/referral/track ---->|                              |
    |   {code: 'XYZ', source:         |                              |
    |    'whatsapp', type: 'provider'}|                              |
    |                                  |-- INSERT INTO Referral ----->|
    |                                  |   status = 'PENDING'          |
    |                                  |   source = 'whatsapp'         |
    |                                  |                              |
    |   [Referred user registers]     |                              |
    |                                  |-- UPDATE Referral ----------->|
    |                                  |   status = 'REGISTERED'       |
    |                                  |                              |
    |   [Referred user becomes active]|                              |
    |                                  |-- UPDATE Referral ----------->|
    |                                  |   status = 'ACTIVE'           |
    |                                  |   reward = ₹50                |
    |                                  |                              |
    |                                  |-- UPDATE Wallet ------------->|
    |                                  |   +₹50 cashbackBalance       |
    |                                  |                              |
    |<-- Referral status updated -----|                              |
```

**What happens:**
1. Client/Provider/Area Manager visits the "Refer & Earn" page
2. Page shows their unique referral code and share options (WhatsApp, Email, SMS, Copy Link)
3. **WhatsApp sharing** generates a deep link with pre-filled message: *"Hey! Book your home service with BookYourService. Use code XYZ for ₹50 off! 🏠🔧"*
4. When recipient clicks the link → lands on registration page with referral code pre-filled
5. `POST /api/referral/track` records the referral click with source (whatsapp/email/sms)
6. When referred user registers → referral status changes to `REGISTERED`
7. When referred user completes first booking/provides service → status changes to `ACTIVE`
8. Referrer earns **₹50** credited to their wallet as cashback
9. Referral history shows all referrals with status badges

**Frontend role:** Displays referral code, share buttons (WhatsApp deep links), referral history, earnings summary

**Backend role:** Generates WhatsApp message templates, tracks referral clicks, manages referral status lifecycle, credits wallet rewards

**Database role:** `Referral` table (referrerId, refereeId, status, source, rewards), `Wallet` table (cashback balance), `WalletTransaction` table (reward credit)

---

### 11. Commission Engine

```
AREA MANAGER                      HONO API                       POSTGRESQL
──────────────────                ─────────                      ──────────
    |                                  |                              |
    |-- GET /api/commissions -------->|                              |
    |                                  |-- SELECT from Referral ----->|
    |                                  |   WHERE referrerId = userId   |
    |                                  |   AND status = 'ACTIVE'       |
    |                                  |                              |
    |                                  |-- Calculate commission:      |
    |                                  |   3% of referred user's       |
    |                                  |   booking transaction value   |
    |                                  |                              |
    |<-- {totalEarned, pendingBalance,|                              |
    |    commissionRate: 3%} ---------|                              |
    |                                  |                              |
    |-- GET /api/commission/info ---->|                              |
    |<-- {rate: 3%, description:      |                              |
    |    "Earn 3% on every booking    |                              |
    |     from your referrals"}       |                              |
```

**What happens:**
1. Area Manager views the Commissions page showing total earned, pending balance, and commission rate
2. Commission is calculated as **3%** of every booking transaction made by referred providers/customers
3. Commission accumulates in the Area Manager's wallet
4. Area Manager can request a payout via bank transfer or UPI
5. Admin can approve/reject payout requests from the admin panel

**Frontend role:** Displays commission summary, earnings breakdown, payout request form

**Backend role:** Calculates 3% commission from referral transactions, manages payout processing

**Database role:** `Referral` table (tracks referral chain), `PayoutRequest` table (payout tracking), `Wallet`/`WalletTransaction` tables (commission credits)

---

### 12. Area Activation & Target-Based Expansion

```
FRONTEND (home-page.tsx)          HONO API                       POSTGRESQL
────────────────────────          ─────────                      ──────────
    |                                  |                              |
    |-- GET /api/area/status -------->|                              |
    |   ?pincode=400001               |                              |
    |                                  |-- Check ServiceArea --------->|
    |                                  |   + count providers in area   |
    |                                  |   + count customers in area   |
    |                                  |<-- Area data -----------------|
    |                                  |                              |
    |<-- {is_active: false,           |                              |
    |    providers: 8/20,             |                              |
    |    customers: 34/100}           |                              |
    |                                  |                              |
    |-- Show Activation Meter:        |                              |
    |   ████████░░░░ 8/20 providers   |                              |
    |   ███░░░░░░░░░ 34/100 customers |                              |
    |                                  |                              |
    |-- Show "Join Waiting List"      |                              |
    |   Show "Refer to Activate"      |                              |
    |                                  |                              |
    |-- GET /api/area/activation ---->|                              |
    |<-- {progress, target,           |                              |
    |    currentProviders,            |                              |
    |    currentCustomers}            |                              |
    |                                  |                              |
    |   [When 20 providers + 100      |                              |
    |    customers reached:]          |                              |
    |   Area becomes ACTIVE           |                              |
    |   Services become visible       |                              |
    |   Bookings open up              |                              |
```

**What happens:**
1. When user visits from an area not yet activated, the system checks `GET /api/area/status?pincode=XXXXXX`
2. API counts providers and customers in that pincode area
3. If area hasn't hit targets (20 providers + 100 customers) → shows **Activation Meter**
4. The Activation Meter displays progress bars: `8/20 providers` and `34/100 customers`
5. User sees two CTAs: **"Join Waiting List"** and **"Refer to Activate"**
6. Joining waiting list → `POST /api/waiting-list/join` → stores user's interest
7. Referring new providers/customers → tracked via referral system
8. When targets are met → area status changes to `ACTIVE` → services become visible → bookings open

**Frontend role:** Shows activation meter with progress bars, waiting list form, referral CTAs

**Backend role:** Checks area status, counts providers/customers, manages waiting list, determines area activation

**Database role:** `ServiceArea` table (pincode coverage), `User` table (count by area), waiting list stored in memory

---

### 13. Career / Area Manager System

```
FRONTEND                          HONO API                       POSTGRESQL
────────                          ─────────                      ──────────
    |                                  |                              |
    |-- "Become an Area Manager" ---->|                              |
    |   POST /api/area-manager/apply  |                              |
    |   {name, email, phone, city,    |                              |
    |    experience, message}         |                              |
    |                                  |-- Store application -------->|
    |                                  |   (in-memory for now)        |
    |<-- {success, id} ---------------|                              |
    |                                  |                              |
    |   [Admin reviews application]   |                              |
    |   [Admin creates user with      |                              |
    |    roleId=8 (AREA_MANAGER)]     |                              |
    |                                  |                              |
    |-- Area Manager Dashboard:       |                              |
    |   GET /api/service-areas        |-- SELECT ServiceArea -------->|
    |<-- {areas: [...]} --------------|<-- Manager's assigned areas --|
    |                                  |                              |
    |   GET /api/referrals            |-- SELECT Referral ----------->|
    |<-- {referrals: [...]} ----------|<-- Manager's referrals -------|
    |                                  |                              |
    |   GET /api/commissions          |-- Calculate 3% commission --->|
    |<-- {commissions} ---------------|                              |
    |                                  |                              |
    |-- WhatsApp "Refer Provider"     |                              |
    |   (deep link with referral code)|                              |
```

**What happens:**
1. User applies as Area Manager via `POST /api/area-manager/apply` with their details
2. Application is stored and reviewed by Admin
3. Admin creates a user with `roleId = 8` (AREA_MANAGER) and assigns service areas
4. Area Manager gets a **Dashboard** showing:
   - **Area Overview** — assigned city/pincode, radius, activation status
   - **Activation Meter** — progress towards 20 providers + 100 customers
   - **Commission Balance** — 3% earnings from referrals, current balance, total earned
   - **Recent Referrals** — list with status (PENDING/REGISTERED/ACTIVE/COMPLETED/EXPIRED)
   - **WhatsApp "Refer Provider"** button — for onboarding new providers via WhatsApp
5. Area Manager earns **3% commission** on every booking from their referrals

**Frontend role:** Area Manager Dashboard with activation meter, commission cards, referral list, WhatsApp share button

**Backend role:** Manages area manager applications, calculates commissions, provides area status data

**Database role:** `User` table (roleId=8), `ServiceArea` table (assigned areas), `Referral` table (referral tracking), `Wallet` table (commission balance)

---

### 14. Pop-Up Funnel

```
FRONTEND (non-active area user)   HONO API                       POSTGRESQL
──────────────────────────────    ─────────                      ──────────
    |                                  |                              |
    |-- User browses from inactive    |                              |
    |   area (pincode check fails)    |                              |
    |                                  |                              |
    |-- GET /api/area/status -------->|                              |
    |   ?pincode=302001               |                              |
    |<-- {is_active: false} ----------|                              |
    |                                  |                              |
    |-- SHOW POP-UP:                  |                              |
    |   ┌──────────────────────────┐  |                              |
    |   │ 🎉 Be the First!        │  |                              |
    |   │                          │  |                              |
    |   │ BookYourService is not   │  |                              |
    |   │ yet available in Jaipur  │  |                              |
    |   │                          │  |                              |
    |   │ Help us activate your    │  |                              |
    |   │ area by referring        │  |                              |
    |   │ providers & customers    │  |                              |
    |   │                          │  |                              |
    |   │ [Join Waiting List]      │  |                              |
    |   │ [Refer to Activate]      │  |                              |
    |   │ [Notify Me When Ready]   │  |                              |
    |   └──────────────────────────┘  |                              |
    |                                  |                              |
    |-- Click "Join Waiting List" ---->|                              |
    |   POST /api/waiting-list/join   |-- Store in waiting list ---->|
    |   {name, phone, email, city,    |   (in-memory)                 |
    |    pincode, serviceInterest}    |                              |
    |<-- {success} -------------------|                              |
```

**What happens:**
1. User from a non-active area tries to browse services
2. Frontend checks area status via `GET /api/area/status?pincode=XXXXXX`
3. If area is NOT active → a **Pop-Up Funnel** appears with three options:
   - **Join Waiting List** → `POST /api/waiting-list/join` → stores user's info and service interest
   - **Refer to Activate** → redirects to referral page with WhatsApp sharing
   - **Notify Me When Ready** → registers for email/SMS notification when area activates
4. This funnel converts interested users into area activation contributors
5. When enough people join the waiting list + refer → area reaches activation target

**Frontend role:** Detects inactive area, shows modal/pop-up funnel, handles form submission

**Backend role:** Stores waiting list entries, checks area status, triggers notifications when area activates

**Database role:** Waiting list stored in memory (can be migrated to DB), `ServiceArea` table (activation tracking)

---

### 15. Hyperlocal Expansion

```
ADMIN PANEL                       HONO API                       POSTGRESQL
────────────                      ─────────                      ──────────
    |                                  |                              |
    |-- Admin views area expansion    |                              |
    |   dashboard                     |                              |
    |                                  |                              |
    |-- GET /api/service-areas ------>|                              |
    |<-- {areas: [                    |                              |
    |    {city, pincode, status,      |                              |
    |     providers, customers},      |                              |
    |    ...]}                        |                              |
    |                                  |                              |
    |-- Admin activates a new area    |                              |
    |   by assigning an Area Manager  |                              |
    |                                  |                              |
    |-- Area Manager onboards         |                              |
    |   providers via WhatsApp        |                              |
    |   referrals in that pincode     |                              |
    |                                  |                              |
    |-- When 20+ providers and        |                              |
    |   100+ customers register:      |                              |
    |                                  |                              |
    |   Area status → ACTIVE          |                              |
    |   Services become visible       |                              |
    |   Bookings open                 |                              |
    |                                  |                              |
    |   Repeat for next area          |                              |
```

**What happens:**
1. Admin monitors the expansion dashboard showing all service areas and their status
2. Admin assigns Area Managers to target cities/pincodes
3. Area Manager uses **WhatsApp referral links** to onboard providers in the area
4. Each referred provider gets a unique referral code for further chain growth
5. When an area hits the **activation target** (20 providers + 100 customers):
   - Area status changes from `INACTIVE` to `ACTIVE`
   - All registered services in that area become visible to nearby clients
   - Clients can start booking services
6. The process repeats for the next target area — creating a **viral expansion loop**

**Frontend role:** Admin dashboard for area management, Area Manager dashboard for onboarding

**Backend role:** Area status checks, provider/customer counting, area activation logic

**Database role:** `ServiceArea` table (area coverage), `User` table (role-based counting), `Referral` table (growth tracking)

---

### 16. Franchise & Vendor Model

```
FRANCHISE OWNER                   HONO API                       POSTGRESQL
──────────────────                ─────────                      ──────────
    |                                  |                              |
    |-- GET /api/franchise/dashboard >|-- SELECT Franchise ---------->|
    |<-- {revenue, bookings,          |<-- Franchise data ------------|
    |    vendors, commissionRate}     |                              |
    |                                  |                              |
    |-- GET /api/franchise/vendors -->|-- SELECT FranchiseVendor ---->|
    |<-- {vendors: [...]} ------------|<-- Assigned vendors ----------|
    |                                  |                              |
    |-- GET /api/franchise/analytics >|-- SELECT FranchiseAnalytics ->|
    |<-- {daily: [...], monthly: [...]}|<-- Analytics data ------------|
    |                                  |                              |
    |   Franchise earns 10% default   |                              |
    |   commission on regional        |                              |
    |   bookings                      |                              |

VENDOR                            HONO API                       POSTGRESQL
──────                            ─────────                      ──────────
    |                                  |                              |
    |-- GET /api/vendor/bookings ---->|-- SELECT Vendor bookings ---->|
    |<-- {bookings: [...]} -----------|<-- Vendor's bookings ---------|
    |                                  |                              |
    |-- GET /api/vendor/services ---->|-- SELECT Vendor services ---->|
    |<-- {services: [...]} -----------|<-- Vendor's services ---------|
    |                                  |                              |
    |-- Vendor supplies inventory     |                              |
    |   GET /api/admin/inventory ---->|-- SELECT InventoryItem ------>|
    |<-- {items: [...]} --------------|<-- Inventory list ------------|
    |                                  |                              |
    |-- Vendor records usage:         |                              |
    |   InventoryUsage created for    |                              |
    |   each booking with parts used  |                              |
```

**What happens:**
1. **Franchise Owner** manages a regional territory (city/area)
2. Franchise earns a **10% default commission** on all bookings in their territory
3. Franchise manages **Vendors** who supply parts and services
4. **Vendor** provides inventory (spare parts) and tracks usage per booking
5. Inventory usage creates `InventoryUsage` records linking parts to bookings
6. Franchise analytics show daily/monthly booking and revenue data

**Frontend role:** Franchise dashboard (revenue, vendors, analytics), Vendor dashboard (bookings, services, inventory, wallet)

**Backend role:** Franchise commission calculation, vendor management, inventory tracking, analytics aggregation

**Database role:** `Franchise` table (territory, commission rate), `FranchiseVendor` table (vendor assignments), `FranchiseAnalytics` table (daily stats), `InventoryItem`/`InventoryUsage` tables (parts tracking)

---

### 17. Admin Oversight & Dispute Resolution

```
ADMIN FRONTEND                    HONO API                       POSTGRESQL
─────────────────                 ─────────                      ──────────
    |                                  |                              |
    |-- GET /api/admin/dashboard ---->|                              |
    |<-- {users, bookings, revenue,   |                              |
    |    disputes, services} ---------|                              |
    |                                  |                              |
    |-- GET /api/admin/users -------->|                              |
    |<-- {users: [...]} --------------|                              |
    |                                  |                              |
    |-- PATCH /api/admin/users/:id -->|                              |
    |   {status: 'BLOCKED'}           |-- UPDATE User status -------->|
    |<-- {user} ----------------------|                              |
    |                                  |                              |
    |-- GET /api/admin/disputes ----->|                              |
    |<-- {disputes: [...]} -----------|                              |
    |                                  |                              |
    |-- PATCH /api/admin/disputes/:id |                              |
    |   {status: 'RESOLVED',          |-- UPDATE Dispute ------------>|
    |    resolution: '...'}           |-- INSERT DisputeMessage ----->|
    |<-- {dispute} -------------------|                              |
    |                                  |                              |
    |-- GET /api/admin/logs ---------->|                              |
    |<-- {logs: [...]} ---------------|<-- Audit trail ---------------|
```

**What happens:**
1. Admin has full platform visibility: user counts, booking stats, revenue, disputes
2. Admin can **manage users**: view, block, suspend, change roles
3. Admin can **approve/reject services** before they go live
4. Admin handles **disputes**: view details, communicate with both parties, assign priority, resolve
5. All admin actions are logged in the **Audit Log** for compliance
6. Admin manages: categories, FAQs, coupons, AMC plans, B2B contracts, inventory, franchises, payouts

**Frontend role:** 19 admin pages covering all management functions, analytics dashboards, data tables

**Backend role:** Role-restricted admin endpoints, dispute messaging, audit logging, CRUD operations

**Database role:** `AdminLog` table (audit trail), `Dispute`/`DisputeMessage` tables (dispute handling), `CRMActivity`/`FollowUp` tables (CRM), all entity tables (CRUD)

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            BROWSER (SPA)                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │  React 19  │  │  Zustand + │  │  TanStack  │  │  Framer Motion  │   │
│  │  55+ Pages │  │  Context   │  │  Query     │  │  Animations     │   │
│  │  (BYS)     │  │  (Auth,Nav)│  │  (Server)  │  │  (3D Cards)     │   │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────────┬────────┘   │
│        │               │               │                    │            │
└────────┼───────────────┼───────────────┼────────────────────┼────────────┘
         │               │               │                    │
    HTTP │               │          HTTP │                    │
         │               │               │                    │
┌────────▼───────────────▼───────────────▼────────────────────▼────────────┐
│                     CADDY REVERSE PROXY (:81)                             │
│                                                                           │
│  /?XTransformPort=5173     ──►  Vite Frontend (port 5173)               │
│  /api/*                    ──►  Hono API (port 3001)                     │
│  /?XTransformPort=3001     ──►  Hono API (port 3001)                     │
│  / (default)               ──►  Vite Frontend (port 5173)               │
└────────┬──────────────────────────────────────────────────┬───────────────┘
         │                                                  │
         ▼                                                  ▼
┌────────────────────────────┐              ┌────────────────────────────────┐
│     Vite Frontend          │              │      Hono.js Backend           │
│     (Port 5173)            │              │      (Port 3001)               │
│                             │              │                                 │
│  • React 19 SPA            │   /api/*     │  • ~80 REST endpoints          │
│  • Tailwind CSS 4          │◄────────────┤  • JWT auth (jose, HS256)      │
│  • shadcn/ui components    │              │  • bcryptjs password hashing   │
│  • Framer Motion animations│              │  • Dynamic pricing engine      │
│  • PWA with Workbox        │              │  • Hyperlocal proximity search │
│  • Custom page routing     │              │  • OTP verification            │
│  • Geolocation hooks       │              │  • WhatsApp referral system    │
│  • Role-based navigation   │              │  • Commission engine (3%)      │
│  • Responsive design       │              │  • Area activation logic       │
│  • Navy blue theme         │              │  • Escrow payment management   │
│                             │              │  • GST invoicing               │
│  Vite proxy:               │              │  • 20+ Indian cities data      │
│  /api → localhost:3001     │              │  • In-memory stores (fallback) │
│                             │              │                                 │
│                             │              │  ┌───────────────────────────┐ │
│                             │              │  │  pg Pool (PostgreSQL)     │ │
│                             │              │  │  Connection pooling       │ │
│                             │              │  │  SSL to Supabase          │ │
│                             │              │  └────────────┬──────────────┘ │
│                             │              │               │                │
└────────────────────────────┘              │  ┌────────────▼──────────────┐ │
                                            │  │  PostgreSQL (Supabase)    │ │
                                            │  │                           │ │
                                            │  │  35 Prisma Models         │ │
                                            │  │  • User (8 roles)         │ │
                                            │  │  • Service (11 categories)│ │
                                            │  │  • Booking (9 statuses)   │ │
                                            │  │  • Payment + Escrow       │ │
                                            │  │  • Wallet + Transactions  │ │
                                            │  │  • Referral + Commission  │ │
                                            │  │  • Franchise + Vendor     │ │
                                            │  │  • Invoice + GST          │ │
                                            │  │  • AMC + Coupons          │ │
                                            │  │  • Inventory + Usage      │ │
                                            │  │  • Dispute + Messages     │ │
                                            │  │  • Notification (5 channels)│ │
                                            │  │  • + 14 more models       │ │
                                            │  │                           │ │
                                            │  └───────────────────────────┘ │
                                            └────────────────────────────────┘

┌────────────────────────────┐
│   Next.js Sandbox          │
│   (Port 3000)              │
│                             │
│  • Entry point for sandbox │
│  • Renders Vite in iframe  │
│  • page.tsx → <iframe      │
│    src="hostname:5173">    │
└────────────────────────────┘
```

---

## Database Schema

35 Prisma models with relationships:

```
Role ──1:N──► User
User ──1:N──► Booking (as client)
User ──1:N──► Booking (as provider/technician)
User ──1:N──► Service (as provider)
User ──1:N──► Review (as reviewer)
User ──1:1──► ProviderKyc
User ──1:1──► TechnicianProfile
User ──1:1──► Wallet
User ──1:N──► Notification
User ──1:N──► Favorite
User ──1:N──► Referral (as referrer/referee)
User ──1:N──► PayoutRequest
User ──1:N──► CRMActivity
User ──1:N──► FollowUp

ServiceCategory ──1:N──► ServiceSubcategory
ServiceCategory ──1:N──► Service
ServiceCategory ──1:N──► PricingRule
ServiceCategory ──1:N──► AMCPlan
ServiceSubcategory ──1:N──► Service
Service ──1:N──► ServiceAvailability
Service ──1:N──► ServiceArea
Service ──1:N──► WorkPhoto
Service ──1:N──► Booking
Service ──1:N──► Review
Service ──1:N──► Favorite

Booking ──1:1──► Payment
Booking ──1:1──► Review
Booking ──1:N──► Negotiation
Booking ──1:N──► Dispute
Booking ──1:N──► BookingTimeline
Booking ──1:1──► Invoice
Booking ──1:N──► WorkPhoto

Dispute ──1:N──► DisputeMessage
Franchise ──1:N──► FranchiseVendor
Franchise ──1:N──► FranchiseAnalytics
Franchise ──1:N──► PayoutRequest
AMCPlan ──1:N──► AMCSubscription
AMCSubscription ──1:N──► AMCSReminder
Coupon ──1:N──► CouponUsage
InventoryItem ──1:N──► InventoryUsage
Wallet ──1:N──► WalletTransaction
```

### Key Enums (via String + Check Constraints)

| Model | Field | Values |
|---|---|---|
| User | status | `PENDING`, `ACTIVE`, `BLOCKED`, `SUSPENDED` |
| User | roleId | 1=CLIENT, 2=PROVIDER, 3=ADMIN, 4=TECHNICIAN, 5=VENDOR, 6=FRANCHISE, 7=SUB_ADMIN, 8=AREA_MANAGER |
| Service | approvalStatus | `PENDING`, `APPROVED`, `REJECTED` |
| Booking | status | `PENDING`, `ASSIGNED`, `ACCEPTED`, `ON_THE_WAY`, `ARRIVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REFUNDED` |
| Booking | bookingType | `NORMAL`, `EMERGENCY`, `AMC` |
| Payment | status | `CREATED`, `PROCESSING`, `SUCCESS`, `FAILED`, `REFUNDED` |
| Payment | escrowStatus | `HELD`, `RELEASED`, `REFUNDED` |
| ProviderKyc | verificationStatus | `PENDING`, `APPROVED`, `REJECTED` |
| Negotiation | status | `PENDING`, `ACCEPTED`, `REJECTED`, `COUNTER` |
| Dispute | status | `OPEN`, `UNDER_REVIEW`, `RESOLVED`, `CLOSED` |
| Notification | channel | `IN_APP`, `SMS`, `WHATSAPP`, `EMAIL`, `PUSH` |
| PricingRule | ruleType | `EMERGENCY`, `WEEKEND`, `DISTANCE`, `TIME_SLOT`, `CITY`, `PEAK_HOURS` |
| WalletTransaction | type | `CREDIT`, `DEBIT` |

---

## API Reference

### Health & Static
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API health check |
| `GET` | `/api/legal` | List all legal documents |
| `GET` | `/api/legal/:type` | Get legal page by type (TERMS, PRIVACY, etc.) |
| `GET` | `/api/faq` | List FAQs (optional `?category=` filter) |
| `POST` | `/api/contact` | Submit contact form message |
| `GET` | `/api/stats/platform` | Get platform statistics |
| `GET` | `/api/cities` | List Indian cities (`?search=` for filtering) |

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login with email + password → JWT |
| `POST` | `/api/auth/register` | Register new user (all 8 roles) |
| `POST` | `/api/auth/forgot-password` | Request password reset token |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `POST` | `/api/auth/change-password` | Change password (authenticated) |
| `GET` | `/api/auth/profile` | Get current user profile (authenticated) |
| `PATCH` | `/api/auth/profile` | Update user profile (authenticated) |

### Categories & Services
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | List active categories (11 services) |
| `GET` | `/api/categories/:id` | Category by ID/slug with subcategories |
| `GET` | `/api/categories/:id/services` | Services in a category (paginated) |
| `GET` | `/api/subcategories` | List subcategories (`?categoryId=` filter) |
| `GET` | `/api/services` | List services (paginated, filterable) |
| `GET` | `/api/services/:id` | Service detail + availability + reviews |
| `POST` | `/api/services` | Create service (Provider) |
| `PATCH` | `/api/services/:id` | Update service |

### Hyperlocal & Area
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/providers/nearby` | Find nearby providers (lat/lng + categoryId) |
| `GET` | `/api/area/status` | Check area activation by pincode |
| `GET` | `/api/area/activation` | Get area activation progress |
| `POST` | `/api/waiting-list/join` | Join waiting list for inactive area |
| `POST` | `/api/area-manager/apply` | Apply as area manager |
| `GET` | `/api/location/reverse-geocode` | Reverse geocode lat/lng to city |
| `GET` | `/api/service-areas` | List service areas |

### Referral & Commission
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/referral/track` | Track a referral click |
| `GET` | `/api/referral/whatsapp-message` | Get WhatsApp referral message |
| `GET` | `/api/referrals` | Get user's referral data |
| `GET` | `/api/commissions` | Get commission summary |
| `GET` | `/api/commission/info` | Get commission rate info (3%) |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/bookings` | Create booking (with dynamic pricing) |
| `GET` | `/api/bookings` | List user's bookings |
| `GET` | `/api/bookings/:id` | Get booking detail |
| `PATCH` | `/api/bookings/:id` | Update booking status |
| `POST` | `/api/bookings/:id/otp-verify` | Verify OTP to complete booking |

### Reviews, Notifications & Wallet
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reviews` | Create review (1-5 rating) |
| `GET` | `/api/reviews` | List reviews (by service/user) |
| `GET` | `/api/notifications` | List user notifications |
| `GET` | `/api/wallet` | Get wallet balance |
| `POST` | `/api/wallet/deposit` | Deposit to wallet |

### Earnings, Payouts & Favorites
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/earnings` | Get earnings summary |
| `GET` | `/api/payouts` | List payout history |
| `POST` | `/api/payouts/request` | Request payout (bank/UPI) |
| `GET` | `/api/favorites` | List user favorites |
| `POST` | `/api/favorites` | Add to favorites |
| `DELETE` | `/api/favorites/:serviceId` | Remove from favorites |

### KYC, Disputes & Coupons
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/kyc` | Get KYC status |
| `POST` | `/api/kyc` | Submit KYC documents |
| `GET` | `/api/disputes` | List disputes |
| `POST` | `/api/disputes` | Create dispute |
| `GET` | `/api/coupons` | List available coupons |
| `POST` | `/api/coupons/validate` | Validate coupon code |

### AMC & Invoices
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/amc-plans` | List AMC plans |
| `GET` | `/api/amc-subscriptions` | List user's AMC subscriptions |
| `GET` | `/api/invoices` | List invoices |
| `GET` | `/api/invoices/:id` | Get invoice detail (with GST) |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Dashboard statistics |
| `GET` | `/api/admin/users` | List all users |
| `GET` | `/api/admin/users/:id` | Get user detail |
| `PATCH` | `/api/admin/users/:id` | Update user (status, role) |
| `GET` | `/api/admin/services` | List all services |
| `PATCH` | `/api/admin/services/:id` | Approve/reject service |
| `GET` | `/api/admin/bookings` | List all bookings |
| `GET` | `/api/admin/revenue` | Revenue summary |
| `GET` | `/api/admin/logs` | Audit logs |
| `GET` | `/api/admin/analytics` | Platform analytics |
| `GET`/`PATCH` | `/api/admin/disputes` | List/update disputes |
| `GET`/`PATCH` | `/api/admin/payouts` | List/process payouts |
| `GET`/`POST` | `/api/admin/coupons` | List/create coupons |
| `GET` | `/api/admin/franchises` | List franchises |
| `GET` | `/api/admin/inventory` | List inventory items |
| `GET` | `/api/admin/amc` | AMC management |
| `GET` | `/api/admin/b2b` | B2B contracts |
| `GET` | `/api/admin/crm` | CRM data |

### Franchise & Vendor
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/franchise/dashboard` | Franchise dashboard |
| `GET` | `/api/franchise/vendors` | List franchise vendors |
| `GET` | `/api/franchise/analytics` | Franchise analytics |
| `GET` | `/api/vendor/bookings` | Vendor bookings |
| `GET` | `/api/vendor/services` | Vendor services |

---

## Getting Started

### Prerequisites

- **Node.js** 20+ and **npm**
- **PostgreSQL** database (Supabase recommended)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/rawatharish27-commits/bookmyservice.git
cd bookmyservice

# Install API dependencies
cd mini-services/api-service
npm install

# Install frontend dependencies
cd ../../frontend
npm install

# Return to root
cd ..
```

### Configure Environment

Create `.env` in `mini-services/api-service/`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.host.supabase.co:6543/postgres
JWT_SECRET=your-production-secret-key-min-32-chars
```

### Run Database Migrations

```bash
# Using Prisma
cd database
npx prisma db push

# Or run SQL migrations directly
psql $DATABASE_URL -f migrations/0001_init_postgres.sql
psql $DATABASE_URL -f migrations/0002_enhanced_schema.sql
psql $DATABASE_URL -f migrations/0002_seed.sql
```

### Start Services

```bash
# Option 1: Use the launcher (starts API + Vite + Next.js)
node launcher.js

# Option 2: Start services individually
# Terminal 1: API
cd mini-services/api-service
npx tsx index.ts

# Terminal 2: Frontend
cd frontend
npx vite --host

# Terminal 3: (Optional) Next.js sandbox
npx next dev --port 3000
```

### Verify Services

| Service | URL | Description |
|---------|-----|-------------|
| **Hono API** | `http://localhost:3001/health` | Should return `{"status":"ok"}` |
| **Vite Frontend** | `http://localhost:5173` | BYS app loads |
| **Next.js Sandbox** | `http://localhost:3000` | Iframes Vite app |
| **Caddy Gateway** | `http://localhost:81` | Routes `/api/*` → 3001, `/*` → 5173 |

---

## Environment Variables

| Variable | Location | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | `mini-services/api-service/.env` | Supabase pooler URL | PostgreSQL connection string |
| `JWT_SECRET` | `mini-services/api-service/.env` | `bys-dev-secret-key-change-in-production-2024` | HS256 JWT signing key |
| `PORT` | API service | `3001` | API server port |
| — | `frontend/vite.config.ts` | `5173` | Vite dev server port |

**Production Checklist:**
- [ ] Change `JWT_SECRET` to a strong random key (min 32 characters)
- [ ] Update `DATABASE_URL` to production database
- [ ] Enable SSL for database connections
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting

---

## Seeding the Database

The seed script (`database/prisma/seed.ts`) creates:

| Entity | Count | Details |
|---|---|---|
| **Roles** | 8 | CLIENT, PROVIDER, ADMIN, TECHNICIAN, VENDOR, FRANCHISE, SUB_ADMIN, AREA_MANAGER |
| **Categories** | 11 | AC, Refrigerator, Washing Machine, Kitchen, TV, Water Purifier, Geyser, Plumber, Electrician, Water Tank, Movers & Packers |
| **Subcategories** | 48 | 3-5 per category |
| **Admin** | 1 | admin@bookyourservice.co.in |
| **Providers** | 5+ | Across Indian cities with KYC |
| **Clients** | 8+ | Various statuses |
| **Services** | 14+ | All priced ₹199–₹499 |
| **Bookings** | 12+ | All statuses represented |
| **FAQs** | 10+ | Platform-related questions |
| **Legal Pages** | 7 | All policy documents |
| **AMC Plans** | 3+ | Per category with features |
| **Coupons** | 3+ | WELCOME50, SUMMER20, FIRST100 |
| **Pricing Rules** | 6+ | Emergency, weekend, distance, time slot, city, peak hours |
| **Cities** | 20+ | Major Indian cities with pincodes |

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

All **11 service categories** with pricing between **₹199 – ₹499**:

| # | Category | Icon | Image | Subcategories |
|---|---|---|---|---|
| 1 | **Air Conditioner** | Wind | `/images/air-conditioner.jpg` | AC Install, Repair, Gas Refill, Deep Clean, Annual Maintenance |
| 2 | **Refrigerator** | Snowflake | `/images/refrigerator.jpg` | Fridge Repair, Gas Charging, Thermostat Fix, Deep Clean |
| 3 | **Washing Machine** | Shirt | `/images/washing-machine.jpg` | Drum Repair, Motor Fix, Drain Clean, Install |
| 4 | **Kitchen Appliances** | ChefHat | `/images/kitchen-appliances.jpg` | Microwave, Chimney, Dishwasher, Mixer Repair |
| 5 | **TV Repair** | Tv | `/images/tv-repair.jpg` | LED/LCD Repair, Smart TV Setup, Wall Mount, Panel Fix |
| 6 | **Water Purifier** | Droplets | `/images/water-purifier.jpg` | RO Install, Filter Replace, UV Fix, Annual Service |
| 7 | **Geyser** | Flame | `/images/geyser.jpg` | Geyser Install, Thermostat Fix, Leak Repair, Flush |
| 8 | **Plumber** | Wrench | `/images/plumber.jpg` | Leak Repair, Pipe Install, Drain Clean, Faucet Fix |
| 9 | **Electrician** | Zap | `/images/electrician.jpg` | Wiring, Switch Board, Fan Install, MCB/DB Box |
| 10 | **Water Tank Cleaning** | Droplet | `/images/water-tank-cleaning.jpg` | Tank Clean, Sanitization, Repair, Filter Install |
| 11 | **Movers and Packers** | Truck | `/images/movers-and-packers.jpg` | Home Shifting, Office Move, Packing, Unpacking |

### Dynamic Pricing Rules

| Rule Type | Charge | Description |
|---|---|---|
| **Emergency** | +50-100% | Premium for emergency bookings |
| **Weekend** | +20% | Surcharge for Saturday/Sunday |
| **Distance** | +₹10/KM | For services beyond 5KM |
| **Time Slot** | +₹50-100 | Early morning/late night premium |
| **City Tier** | Variable | Metro cities cost more |
| **Peak Hours** | +30% | 10AM-12PM, 5PM-8PM surcharge |

### Revenue Split

| Component | Percentage |
|---|---|
| **Provider Earnings** | 90% |
| **Platform Fee** | 10% |
| **Area Manager Commission** | 3% (from platform fee) |
| **Franchise Commission** | 10% (from platform fee) |

---

## License

Proprietary — All rights reserved. © 2025 BookYourService Technologies Pvt. Ltd.
