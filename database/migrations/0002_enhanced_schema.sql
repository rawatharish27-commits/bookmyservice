-- BookYourService Enhanced Schema Migration
-- Adds: Multi-Role, Technician Profile, Live Tracking, Wallet, AMC, Franchise, 
--        Coupons, Referral, Invoice, CRM, Dynamic Pricing, Inventory, B2B, Payouts

-- ============================================================================
-- 1. UPDATE EXISTING TABLES
-- ============================================================================

-- Add new columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifiedBadge" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "completedJobsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT UNIQUE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredBy" TEXT;

-- Add new roles (TECHNICIAN=4, VENDOR=5, FRANCHISE=6, SUB_ADMIN=7, AREA_MANAGER=8)
INSERT INTO "Role" (name, description) VALUES
('TECHNICIAN', 'Service technician who performs the work'),
('VENDOR', 'Service vendor/business owner'),
('FRANCHISE', 'Franchise owner/operator'),
('SUB_ADMIN', 'Sub administrator with limited access'),
('AREA_MANAGER', 'Area/region manager')
ON CONFLICT (name) DO NOTHING;

-- Update ServiceCategory table
ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "isEmergency" BOOLEAN NOT NULL DEFAULT false;

-- Update Service table with new columns
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "serviceDurationMinutes" INTEGER;
ALTER TABLE "ServiceCategory" ADD COLUMN IF NOT EXISTS "serviceAreaRadiusKm" INTEGER DEFAULT 10;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "serviceAreaRadiusKm" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "latitude" REAL;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "longitude" REAL;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "pincode" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "images" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "averageRating" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "totalBookings" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "totalReviews" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "isEmergencyAvailable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "priceNegotiable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "seoTitle" TEXT;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;

-- Update Booking table with new columns
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "bookingNumber" TEXT UNIQUE;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "technicianId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "bookingType" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "servicePincode" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "distanceKm" REAL;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "basePrice" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "emergencyCharge" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "weekendCharge" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "distanceCharge" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "timeSlotCharge" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "negotiatedPrice" REAL;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "finalPrice" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "platformFee" REAL NOT NULL DEFAULT 5.0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "providerEarnings" REAL;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancelledBy" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "acceptedAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "onTheWayAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "arrivedAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "otpCode" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "otpVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "otpVerifiedAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "contactShared" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "couponId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "couponDiscount" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "warrantyDays" INTEGER NOT NULL DEFAULT 7;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "warrantyExpiresAt" TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "b2bContractId" TEXT;

-- Update ProviderKyc table
ALTER TABLE "ProviderKyc" ADD COLUMN IF NOT EXISTS "skillVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProviderKyc" ADD COLUMN IF NOT EXISTS "skillVerifiedBy" TEXT;
ALTER TABLE "ProviderKyc" ADD COLUMN IF NOT EXISTS "skillVerifiedAt" TIMESTAMP;
ALTER TABLE "ProviderKyc" ADD COLUMN IF NOT EXISTS "bankAccountName" TEXT;
ALTER TABLE "ProviderKyc" ADD COLUMN IF NOT EXISTS "bankAccountNumber" TEXT;
ALTER TABLE "ProviderKyc" ADD COLUMN IF NOT EXISTS "bankIfsc" TEXT;
ALTER TABLE "ProviderKyc" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "ProviderKyc" ADD COLUMN IF NOT EXISTS "upiId" TEXT;
ALTER TABLE "ProviderKyc" ADD COLUMN IF NOT EXISTS "serviceAreaPincodes" TEXT;
ALTER TABLE "ProviderKyc" ADD COLUMN IF NOT EXISTS "serviceAreaCity" TEXT;

-- Update Notification table
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "channel" TEXT NOT NULL DEFAULT 'IN_APP';
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "actionUrl" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "metadata" TEXT;

-- ============================================================================
-- 2. NEW TABLES
-- ============================================================================

-- Technician Profile
CREATE TABLE IF NOT EXISTS "TechnicianProfile" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  skills TEXT NOT NULL DEFAULT '[]',
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "serviceAreaRadiusKm" INTEGER NOT NULL DEFAULT 15,
  "serviceAreaPincodes" TEXT,
  "dailyEarnings" REAL NOT NULL DEFAULT 0,
  "weeklyEarnings" REAL NOT NULL DEFAULT 0,
  "monthlyEarnings" REAL NOT NULL DEFAULT 0,
  "totalEarnings" REAL NOT NULL DEFAULT 0,
  "totalJobsCompleted" INTEGER NOT NULL DEFAULT 0,
  "totalJobsRejected" INTEGER NOT NULL DEFAULT 0,
  "averageRating" REAL NOT NULL DEFAULT 0,
  "currentLocationLat" REAL,
  "currentLocationLng" REAL,
  "locationUpdatedAt" TIMESTAMP,
  "bankAccountName" TEXT,
  "bankAccountNumber" TEXT,
  "bankIfsc" TEXT,
  "bankName" TEXT,
  "upiId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Availability
CREATE TABLE IF NOT EXISTS "ServiceAvailability" (
  id TEXT PRIMARY KEY,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "maxBookingsPerSlot" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Area (pincode-based availability)
CREATE TABLE IF NOT EXISTS "ServiceArea" (
  id TEXT PRIMARY KEY,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  pincode TEXT NOT NULL,
  city TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("serviceId", pincode)
);

-- Work Photos
CREATE TABLE IF NOT EXISTS "WorkPhoto" (
  id TEXT PRIMARY KEY,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "bookingId" TEXT,
  "uploadedBy" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  caption TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Booking Timeline (Live Tracking)
CREATE TABLE IF NOT EXISTS "BookingTimeline" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  description TEXT,
  "performedBy" TEXT,
  metadata TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_timeline_booking ON "BookingTimeline"("bookingId");

-- Payment (enhanced)
CREATE TABLE IF NOT EXISTS "Payment" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL UNIQUE REFERENCES "Booking"(id) ON DELETE RESTRICT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  "paymentMethod" TEXT,
  gateway TEXT,
  "gatewayOrderId" TEXT,
  "gatewayPaymentId" TEXT,
  status TEXT NOT NULL DEFAULT 'CREATED',
  "escrowStatus" TEXT NOT NULL DEFAULT 'NONE',
  "refundAmount" REAL,
  "refundReason" TEXT,
  "refundedAt" TIMESTAMP,
  metadata TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet
CREATE TABLE IF NOT EXISTS "Wallet" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  balance REAL NOT NULL DEFAULT 0,
  "cashbackBalance" REAL NOT NULL DEFAULT 0,
  "promoBalance" REAL NOT NULL DEFAULT 0,
  "totalDeposited" REAL NOT NULL DEFAULT 0,
  "totalWithdrawn" REAL NOT NULL DEFAULT 0,
  "totalSpent" REAL NOT NULL DEFAULT 0,
  "totalEarned" REAL NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wallet_user ON "Wallet"("userId");

-- Wallet Transaction
CREATE TABLE IF NOT EXISTS "WalletTransaction" (
  id TEXT PRIMARY KEY,
  "walletId" TEXT NOT NULL REFERENCES "Wallet"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"(id),
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  "referenceId" TEXT,
  "referenceType" TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  metadata TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON "WalletTransaction"("walletId");
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON "WalletTransaction"("userId");

-- Dynamic Pricing Rules
CREATE TABLE IF NOT EXISTS "PricingRule" (
  id SERIAL PRIMARY KEY,
  "categoryId" INTEGER NOT NULL REFERENCES "ServiceCategory"(id),
  "ruleType" TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  "chargeType" TEXT NOT NULL,
  "chargeValue" REAL NOT NULL,
  "conditionJson" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  "validFrom" TIMESTAMP,
  "validTo" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AMC Plans
CREATE TABLE IF NOT EXISTS "AMCPlan" (
  id SERIAL PRIMARY KEY,
  "categoryId" INTEGER NOT NULL REFERENCES "ServiceCategory"(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  "durationMonths" INTEGER NOT NULL DEFAULT 12,
  "visitsIncluded" INTEGER NOT NULL DEFAULT 4,
  features TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AMC Subscription
CREATE TABLE IF NOT EXISTS "AMCSubscription" (
  id TEXT PRIMARY KEY,
  "planId" INTEGER NOT NULL REFERENCES "AMCPlan"(id),
  "clientId" TEXT NOT NULL REFERENCES "User"(id),
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "visitsUsed" INTEGER NOT NULL DEFAULT 0,
  "visitsRemaining" INTEGER NOT NULL,
  "autoRenew" BOOLEAN NOT NULL DEFAULT true,
  "lastReminderAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_amc_sub_client ON "AMCSubscription"("clientId");

-- AMC Reminders
CREATE TABLE IF NOT EXISTS "AMCSReminder" (
  id TEXT PRIMARY KEY,
  "subscriptionId" TEXT NOT NULL REFERENCES "AMCSubscription"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  "scheduledAt" TIMESTAMP NOT NULL,
  "sentAt" TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Franchise
CREATE TABLE IF NOT EXISTS "Franchise" (
  id TEXT PRIMARY KEY,
  "ownerId" TEXT NOT NULL UNIQUE REFERENCES "User"(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  pincode TEXT,
  address TEXT,
  latitude REAL,
  longitude REAL,
  "contactPhone" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "commissionRate" REAL NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "totalRevenue" REAL NOT NULL DEFAULT 0,
  "totalBookings" INTEGER NOT NULL DEFAULT 0,
  "totalProviders" INTEGER NOT NULL DEFAULT 0,
  "agreementStart" TIMESTAMP,
  "agreementEnd" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Franchise Vendor
CREATE TABLE IF NOT EXISTS "FranchiseVendor" (
  id TEXT PRIMARY KEY,
  "franchiseId" TEXT NOT NULL REFERENCES "Franchise"(id) ON DELETE CASCADE,
  "vendorId" TEXT NOT NULL REFERENCES "User"(id),
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  "joinedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("franchiseId", "vendorId")
);

-- Franchise Analytics
CREATE TABLE IF NOT EXISTS "FranchiseAnalytics" (
  id TEXT PRIMARY KEY,
  "franchiseId" TEXT NOT NULL REFERENCES "Franchise"(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  "totalBookings" INTEGER NOT NULL DEFAULT 0,
  "totalRevenue" REAL NOT NULL DEFAULT 0,
  "commissionEarned" REAL NOT NULL DEFAULT 0,
  "activeProviders" INTEGER NOT NULL DEFAULT 0,
  "newCustomers" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("franchiseId", date)
);

-- Coupon
CREATE TABLE IF NOT EXISTS "Coupon" (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  "discountType" TEXT NOT NULL,
  "discountValue" REAL NOT NULL,
  "minOrderAmount" REAL NOT NULL DEFAULT 0,
  "maxDiscount" REAL,
  "usageLimit" INTEGER,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "perUserLimit" INTEGER NOT NULL DEFAULT 1,
  "validFrom" TIMESTAMP NOT NULL,
  "validTo" TIMESTAMP NOT NULL,
  "applicableType" TEXT NOT NULL DEFAULT 'ALL',
  "applicableIds" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupon Usage
CREATE TABLE IF NOT EXISTS "CouponUsage" (
  id TEXT PRIMARY KEY,
  "couponId" TEXT NOT NULL REFERENCES "Coupon"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "discountApplied" REAL NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("couponId", "userId", "bookingId")
);

-- Referral
CREATE TABLE IF NOT EXISTS "Referral" (
  id TEXT PRIMARY KEY,
  "referrerId" TEXT NOT NULL REFERENCES "User"(id),
  "refereeId" TEXT NOT NULL UNIQUE REFERENCES "User"(id),
  "referrerReward" REAL NOT NULL DEFAULT 0,
  "refereeReward" REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice
CREATE TABLE IF NOT EXISTS "Invoice" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL UNIQUE REFERENCES "Booking"(id) ON DELETE CASCADE,
  "invoiceNumber" TEXT NOT NULL UNIQUE,
  "clientId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "franchiseId" TEXT,
  subtotal REAL NOT NULL,
  "gstAmount" REAL NOT NULL DEFAULT 0,
  "gstRate" REAL NOT NULL DEFAULT 18,
  "discountAmount" REAL NOT NULL DEFAULT 0,
  "totalAmount" REAL NOT NULL,
  gstin TEXT,
  "hsnCode" TEXT,
  "invoiceDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueDate" TIMESTAMP,
  "pdfUrl" TEXT,
  status TEXT NOT NULL DEFAULT 'GENERATED',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRM Activity
CREATE TABLE IF NOT EXISTS "CRMActivity" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id),
  "activityType" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "scheduledAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  metadata TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_crm_user ON "CRMActivity"("userId");

-- Follow Up
CREATE TABLE IF NOT EXISTS "FollowUp" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "assignedTo" TEXT NOT NULL REFERENCES "User"(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  "dueDate" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_followup_assigned ON "FollowUp"("assignedTo");

-- Payout Request
CREATE TABLE IF NOT EXISTS "PayoutRequest" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id),
  "franchiseId" TEXT REFERENCES "Franchise"(id),
  amount REAL NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "bankRef" TEXT,
  "processedBy" TEXT,
  "processedAt" TIMESTAMP,
  "rejectionReason" TEXT,
  metadata TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payout_user ON "PayoutRequest"("userId");

-- B2B Contract
CREATE TABLE IF NOT EXISTS "B2BContract" (
  id TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "User"(id),
  "companyName" TEXT NOT NULL,
  "contactPerson" TEXT NOT NULL,
  "contactPhone" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  "contractType" TEXT NOT NULL,
  description TEXT,
  "monthlyAmount" REAL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Item
CREATE TABLE IF NOT EXISTS "InventoryItem" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  "categoryId" INTEGER REFERENCES "ServiceCategory"(id),
  price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  "minQuantity" INTEGER NOT NULL DEFAULT 5,
  "vendorId" TEXT,
  "vendorSource" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Usage
CREATE TABLE IF NOT EXISTS "InventoryUsage" (
  id TEXT PRIMARY KEY,
  "inventoryId" TEXT NOT NULL REFERENCES "InventoryItem"(id),
  "bookingId" TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  "unitPrice" REAL NOT NULL,
  "totalPrice" REAL NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- City (Multi-City Support)
CREATE TABLE IF NOT EXISTS "City" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  slug TEXT NOT NULL UNIQUE,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  latitude REAL,
  longitude REAL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legal Pages (if not exists)
CREATE TABLE IF NOT EXISTS "LegalPage" (
  id SERIAL PRIMARY KEY,
  "pageType" TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  "effectiveDate" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue Stream
CREATE TABLE IF NOT EXISTS "RevenueStream" (
  id SERIAL PRIMARY KEY,
  "streamType" TEXT NOT NULL,
  description TEXT,
  "revenueModel" TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  "estimatedMonthlyRevenue" REAL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Log
CREATE TABLE IF NOT EXISTS "AdminLog" (
  id TEXT PRIMARY KEY,
  "adminId" TEXT NOT NULL REFERENCES "User"(id),
  action TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  details TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Negotiation
CREATE TABLE IF NOT EXISTS "Negotiation" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "proposedBy" TEXT NOT NULL REFERENCES "User"(id),
  "proposedPrice" REAL NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "respondedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dispute Message
CREATE TABLE IF NOT EXISTS "DisputeMessage" (
  id TEXT PRIMARY KEY,
  "disputeId" TEXT NOT NULL REFERENCES "Dispute"(id) ON DELETE CASCADE,
  "senderId" TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform Stats (if not exists)
CREATE TABLE IF NOT EXISTS "PlatformStats" (
  id SERIAL PRIMARY KEY,
  "totalVisitors" INTEGER NOT NULL DEFAULT 0,
  "totalUsers" INTEGER NOT NULL DEFAULT 0,
  "totalProviders" INTEGER NOT NULL DEFAULT 0,
  "totalBookings" INTEGER NOT NULL DEFAULT 0,
  "totalServices" INTEGER NOT NULL DEFAULT 0,
  "activeVisitors" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitor Session
CREATE TABLE IF NOT EXISTS "VisitorSession" (
  id TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL UNIQUE,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  country TEXT,
  city TEXT,
  page TEXT,
  referrer TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastActive" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. SEED DATA
-- ============================================================================

-- Insert default cities
INSERT INTO "City" (name, state, slug, "displayOrder") VALUES
('Nagpur', 'Maharashtra', 'nagpur', 1),
('Mumbai', 'Maharashtra', 'mumbai', 2),
('Pune', 'Maharashtra', 'pune', 3),
('Delhi', 'Delhi', 'delhi', 4),
('Bangalore', 'Karnataka', 'bangalore', 5),
('Hyderabad', 'Telangana', 'hyderabad', 6),
('Chennai', 'Tamil Nadu', 'chennai', 7),
('Kolkata', 'West Bengal', 'kolkata', 8),
('Jaipur', 'Rajasthan', 'jaipur', 9),
('Ahmedabad', 'Gujarat', 'ahmedabad', 10),
('Lucknow', 'Uttar Pradesh', 'lucknow', 11),
('Chandigarh', 'Punjab', 'chandigarh', 12),
('Bhopal', 'Madhya Pradesh', 'bhopal', 13),
('Indore', 'Madhya Pradesh', 'indore', 14),
('Coimbatore', 'Tamil Nadu', 'coimbatore', 15),
('Jammu', 'Jammu & Kashmir', 'jammu', 16)
ON CONFLICT (name) DO NOTHING;

-- Insert default AMC Plans
INSERT INTO "AMCPlan" ("categoryId", name, slug, description, price, "durationMonths", "visitsIncluded", features, "isActive", "displayOrder")
SELECT id, 'AC Maintenance Plan', 'ac-maintenance-plan', 'Annual AC maintenance with 4 service visits', 2999, 12, 4, '["4 service visits per year", "Priority booking", "10% discount on repairs", "Free cleaning"]', true, 1
FROM "ServiceCategory" WHERE slug = 'hvac' LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "AMCPlan" ("categoryId", name, slug, description, price, "durationMonths", "visitsIncluded", features, "isActive", "displayOrder")
SELECT id, 'RO Maintenance Plan', 'ro-maintenance-plan', 'Annual RO purification system maintenance', 1999, 12, 4, '["4 filter checks", "Free filter replacement", "Priority support", "Water quality test"]', true, 2
FROM "ServiceCategory" WHERE slug = 'plumbing' LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "AMCPlan" ("categoryId", name, slug, description, price, "durationMonths", "visitsIncluded", features, "isActive", "displayOrder")
SELECT id, 'Home Maintenance Package', 'home-maintenance-package', 'Complete home maintenance covering plumbing, electrical & more', 4999, 12, 6, '["6 visits per year", "Multi-category coverage", "Emergency support", "10% off on parts"]', true, 3
FROM "ServiceCategory" WHERE slug = 'plumbing' LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- Insert default coupons
INSERT INTO "Coupon" (id, code, description, "discountType", "discountValue", "minOrderAmount", "maxDiscount", "usageLimit", "perUserLimit", "validFrom", "validTo", "applicableType", "isActive")
VALUES
('cpn_first100', 'FIRST100', 'First booking discount for early users', 'PERCENTAGE', 20, 500, 200, 100, 1, NOW(), NOW() + INTERVAL '1 year', 'FIRST_BOOKING', true),
('cpn_welcome', 'WELCOME50', 'Welcome discount for new users', 'FIXED', 50, 300, 50, 1000, 1, NOW(), NOW() + INTERVAL '6 months', 'ALL', true),
('cpn_emergency', 'EMERGENCY10', 'Discount on emergency bookings', 'PERCENTAGE', 10, 1000, 150, NULL, 3, NOW(), NOW() + INTERVAL '1 year', 'ALL', true)
ON CONFLICT (code) DO NOTHING;

-- Insert default pricing rules
INSERT INTO "PricingRule" ("categoryId", "ruleType", name, description, "chargeType", "chargeValue", "isActive", priority)
SELECT id, 'EMERGENCY', 'Emergency Service Charge', 'Additional charge for emergency bookings', 'PERCENTAGE', 25, true, 1
FROM "ServiceCategory" LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "PricingRule" ("categoryId", "ruleType", name, description, "chargeType", "chargeValue", "isActive", priority)
SELECT id, 'WEEKEND', 'Weekend Surcharge', 'Additional charge for weekend bookings', 'PERCENTAGE', 15, true, 2
FROM "ServiceCategory" LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert default legal pages if not exist
INSERT INTO "LegalPage" ("pageType", title, content, version, "effectiveDate")
VALUES
('COMMUNITY_GUIDELINES', 'Community Guidelines', '<h2>Community Guidelines</h2><p>Our community guidelines ensure a safe and respectful environment for all users.</p><h3>1. Respect All Users</h3><p>Treat every user with respect and professionalism.</p><h3>2. Honest Reviews</h3><p>Provide genuine and honest reviews based on your experience.</p><h3>3. No Discrimination</h3><p>Discrimination of any kind will not be tolerated.</p><h3>4. Follow Local Laws</h3><p>All users must comply with applicable local laws and regulations.</p>', '1.0', '2025-01-01')
ON CONFLICT ("pageType") DO NOTHING;

-- Update existing bookings with booking numbers if missing
UPDATE "Booking" SET "bookingNumber" = 'BYS' || to_char("createdAt", 'YYYYMMDD') || LPAD(id_hash, 6, '0')
WHERE "bookingNumber" IS NULL AND id IS NOT NULL;
