# Task 2-c: Legal Pages Builder

## Task
Build 6 Legal page components for the BookMyService project.

## Files Created

1. **src/components/pages/legal/privacy-policy-page.tsx** (510 lines)
   - Sidebar table of contents with 9 sections + active section highlighting
   - Quick summary card
   - Sections: Information Collection, How We Use Data, Data Sharing, Cookies, Data Security, User Rights, Children's Privacy, Changes, Contact

2. **src/components/pages/legal/terms-page.tsx** (~400 lines)
   - Sidebar table of contents with 10 sections
   - Key highlights card
   - Sections: Acceptance, Account Registration, Service Booking, Payment Terms, Cancellation & Refund, Provider Terms, IP, Liability, Dispute Resolution, Governing Law

3. **src/components/pages/legal/refund-policy-page.tsx** (~350 lines)
   - 3 quick stats cards
   - Visual refund process timeline (5 steps)
   - Eligibility criteria (green/amber/red sections)
   - Partial refund structure table
   - Service-specific policies (8 categories)
   - FAQ accordion (6 items)

4. **src/components/pages/legal/cancellation-policy-page.tsx** (~380 lines)
   - 4 quick overview cards
   - Step-by-step cancellation process
   - 6-tier cancellation fee schedule table
   - Free cancellation window details
   - Provider cancellation & no-show policies
   - Force majeure section

5. **src/components/pages/legal/cookie-policy-page.tsx** (~370 lines)
   - Cookie type explanation cards
   - 4 expandable cookie categories with detailed tables
   - 6 third-party services with privacy links
   - Cookie management guide (in-app, browser, DNT)
   - Impact of disabling cookies table

6. **src/components/pages/legal/gdpr-page.tsx** (~450 lines)
   - Gradient DPO contact card
   - 6 data protection principles
   - 6 user rights with timeframes
   - Data processing activities table (8 activities)
   - Cross-border data transfers (3 countries)
   - Interactive rights request form with submission state
   - Supervisory authority info
   - Data retention periods

## Design Consistency
- bg-[#f8fafc] backgrounds
- White rounded-xl cards
- blue-600 primary color
- shadcn/ui components (Card, Button, Badge, Separator, ScrollArea, Input)
- Lucide React icons throughout
- 'use client' directive on all pages
- Responsive layouts (mobile-first)

## Indian Legal Context
- IT Act 2000, GST Act 2017, Consumer Protection Act 2019
- Arbitration & Conciliation Act 1996, Indian Contract Act 1872, Copyright Act 1957
- INR currency, Indian payment methods (UPI, Razorpay)
- Indian jurisdiction (Noida, Uttar Pradesh courts)
- Indian service categories and provider requirements

## TypeScript
- Fixed `Child` icon import → `Baby` from lucide-react
- Custom `Target` SVG icon for GDPR page
- 0 compilation errors in legal pages
