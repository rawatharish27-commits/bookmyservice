# Task CONFIG-BOOKING - Booking Page & Company Config

## Task Summary
Created 2 new files for the BookYourService (BYS) hyperlocal service marketplace project.

## Files Created

### 1. `/home/z/my-project/frontend/src/config/company.ts`
- Company configuration constants (name, address, phone, email, website, support hours, social links)
- Exported as `COMPANY_INFO`

### 2. `/home/z/my-project/frontend/src/components/bys/booking-page.tsx`
- Comprehensive 7-step booking workflow page (1430 lines)
- **Step 1: Service Details** - Shows selected service info (name, category, base price, provider info, duration, rating)
- **Step 2: Address Selection** - Full address, city, pincode, landmark fields + "Use Current Location" geolocation button
- **Step 3: Date/Time Selection** - Calendar date picker + time slot grid (9AM-7PM, 1-hour intervals) with navy blue highlight
- **Step 4: Nearby Provider Match** - Provider list with rating, distance, price; auto-selects best match; "View All Providers" expandable
- **Step 5: Technician Assignment** - Assigned technician info (name, photo, rating, experience, phone, certifications) + OTP display
- **Step 6: Payment Summary** - Price breakdown (Base, Emergency, Platform Fee ₹5, Distance, Coupon Discount), payment method (UPI/Card/Wallet/Cash), coupon code input
- **Step 7: Booking Confirmation** - Success animation, booking ID, scheduled details, amount paid, "Track Booking" + "Back to Home" buttons

## Key Features
- Navy blue gradient theme (#0a1628, #1e3a5f, #2d5a8e) throughout
- Progress bar + step indicators with animated connectors
- framer-motion transitions between steps (AnimatePresence)
- Form validation at each step before proceeding
- Back/Next navigation
- POST to /api/bookings with all collected data
- localStorage for auth token
- shadcn/ui components: Card, Button, Input, Label, Badge, Separator, RadioGroup, Progress, Calendar
- lucide-react icons
- Responsive design (mobile-first)
- Mock provider/technician fallback data when API calls fail
