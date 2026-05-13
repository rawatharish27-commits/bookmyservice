-- BookYourService PostgreSQL Database Schema
-- Migration 0001: Initial schema (converted from SQLite D1)
-- Compatible with Supabase PostgreSQL (public schema)

-- Roles
CREATE TABLE IF NOT EXISTS "Role" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  name TEXT NOT NULL,
  "roleId" INTEGER NOT NULL REFERENCES "Role"(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
  "profileImageUrl" TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  "lastLoginAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_phone ON "User"(phone);
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"("roleId");
CREATE INDEX IF NOT EXISTS idx_user_status ON "User"(status);

-- Provider KYC
CREATE TABLE IF NOT EXISTS "ProviderKyc" (
  id TEXT PRIMARY KEY,
  "providerId" TEXT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  "documentType" TEXT NOT NULL,
  "documentNumber" TEXT NOT NULL,
  "documentFrontUrl" TEXT NOT NULL,
  "documentBackUrl" TEXT,
  "selfieUrl" TEXT NOT NULL,
  "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "verifiedBy" TEXT,
  "verifiedAt" TIMESTAMPTZ,
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Service Categories
CREATE TABLE IF NOT EXISTS "ServiceCategory" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  "iconUrl" TEXT,
  icon TEXT,
  "parentId" INTEGER REFERENCES "ServiceCategory"(id),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_category_slug ON "ServiceCategory"(slug);
CREATE INDEX IF NOT EXISTS idx_category_active ON "ServiceCategory"("isActive");

-- Service Subcategories
CREATE TABLE IF NOT EXISTS "ServiceSubcategory" (
  id SERIAL PRIMARY KEY,
  "categoryId" INTEGER NOT NULL REFERENCES "ServiceCategory"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("categoryId", slug)
);
CREATE INDEX IF NOT EXISTS idx_subcategory_category ON "ServiceSubcategory"("categoryId");

-- Services
CREATE TABLE IF NOT EXISTS "Service" (
  id TEXT PRIMARY KEY,
  "providerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "categoryId" INTEGER NOT NULL REFERENCES "ServiceCategory"(id),
  "subcategoryId" INTEGER REFERENCES "ServiceSubcategory"(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "basePrice" DOUBLE PRECISION NOT NULL,
  "priceNegotiable" BOOLEAN NOT NULL DEFAULT false,
  "serviceDurationMinutes" INTEGER,
  "serviceAreaRadiusKm" INTEGER NOT NULL DEFAULT 10,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  pincode TEXT,
  images TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMPTZ,
  "rejectionReason" TEXT,
  "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalBookings" INTEGER NOT NULL DEFAULT 0,
  "totalReviews" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_service_provider ON "Service"("providerId");
CREATE INDEX IF NOT EXISTS idx_service_category ON "Service"("categoryId");
CREATE INDEX IF NOT EXISTS idx_service_active ON "Service"("isActive", "isApproved");
CREATE INDEX IF NOT EXISTS idx_service_city ON "Service"(city);
CREATE INDEX IF NOT EXISTS idx_service_price ON "Service"("basePrice");

-- Service Availability
CREATE TABLE IF NOT EXISTS "ServiceAvailability" (
  id TEXT PRIMARY KEY,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "maxBookingsPerSlot" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_availability_service ON "ServiceAvailability"("serviceId");

-- Bookings
CREATE TABLE IF NOT EXISTS "Booking" (
  id TEXT PRIMARY KEY,
  "bookingNumber" TEXT NOT NULL UNIQUE,
  "clientId" TEXT NOT NULL REFERENCES "User"(id),
  "providerId" TEXT NOT NULL REFERENCES "User"(id),
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  "scheduledDate" DATE NOT NULL,
  "scheduledTime" TIME NOT NULL,
  "serviceAddress" TEXT NOT NULL,
  "serviceLatitude" DOUBLE PRECISION,
  "serviceLongitude" DOUBLE PRECISION,
  "distanceKm" DOUBLE PRECISION,
  "basePrice" DOUBLE PRECISION NOT NULL,
  "negotiatedPrice" DOUBLE PRECISION,
  "finalPrice" DOUBLE PRECISION NOT NULL,
  "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  "providerEarnings" DOUBLE PRECISION,
  "specialInstructions" TEXT,
  "cancellationReason" TEXT,
  "cancelledBy" TEXT,
  "cancelledAt" TIMESTAMPTZ,
  "completedAt" TIMESTAMPTZ,
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_booking_client ON "Booking"("clientId");
CREATE INDEX IF NOT EXISTS idx_booking_provider ON "Booking"("providerId");
CREATE INDEX IF NOT EXISTS idx_booking_service ON "Booking"("serviceId");
CREATE INDEX IF NOT EXISTS idx_booking_status ON "Booking"(status);
CREATE INDEX IF NOT EXISTS idx_booking_number ON "Booking"("bookingNumber");

-- Payments
CREATE TABLE IF NOT EXISTS "Payment" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL UNIQUE REFERENCES "Booking"(id),
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  "paymentMethod" TEXT,
  gateway TEXT,
  "gatewayOrderId" TEXT,
  "gatewayPaymentId" TEXT,
  status TEXT NOT NULL DEFAULT 'CREATED',
  "refundAmount" DOUBLE PRECISION,
  "refundReason" TEXT,
  "refundedAt" TIMESTAMPTZ,
  metadata TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS "Review" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL UNIQUE REFERENCES "Booking"(id) ON DELETE CASCADE,
  "reviewerId" TEXT NOT NULL REFERENCES "User"(id),
  "reviewedId" TEXT NOT NULL REFERENCES "User"(id),
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id),
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "isFlagged" BOOLEAN NOT NULL DEFAULT false,
  "flagReason" TEXT,
  "adminResponse" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_review_service ON "Review"("serviceId");
CREATE INDEX IF NOT EXISTS idx_review_reviewer ON "Review"("reviewerId");

-- Negotiations
CREATE TABLE IF NOT EXISTS "Negotiation" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "proposedBy" TEXT NOT NULL REFERENCES "User"(id),
  "proposedPrice" DOUBLE PRECISION NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "respondedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Disputes
CREATE TABLE IF NOT EXISTS "Dispute" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL REFERENCES "Booking"(id),
  "raisedBy" TEXT NOT NULL REFERENCES "User"(id),
  "disputeType" TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  "assignedTo" TEXT REFERENCES "User"(id),
  resolution TEXT,
  "resolvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dispute_raiser ON "Dispute"("raisedBy");
CREATE INDEX IF NOT EXISTS idx_dispute_status ON "Dispute"(status);

-- Dispute Messages
CREATE TABLE IF NOT EXISTS "DisputeMessage" (
  id TEXT PRIMARY KEY,
  "disputeId" TEXT NOT NULL REFERENCES "Dispute"(id) ON DELETE CASCADE,
  "senderId" TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dispute_msg ON "DisputeMessage"("disputeId");

-- Notifications
CREATE TABLE IF NOT EXISTS "Notification" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  "actionUrl" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS idx_notification_unread ON "Notification"("userId", "isRead");

-- FAQ
CREATE TABLE IF NOT EXISTS "Faq" (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Pages
CREATE TABLE IF NOT EXISTS "LegalPage" (
  id SERIAL PRIMARY KEY,
  "pageType" TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  "effectiveDate" DATE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- SEO Metadata
CREATE TABLE IF NOT EXISTS "SeoMetadata" (
  id SERIAL PRIMARY KEY,
  "pageType" TEXT,
  "pageId" TEXT,
  title TEXT,
  description TEXT,
  keywords TEXT,
  "canonicalUrl" TEXT,
  "ogImage" TEXT,
  "schemaMarkup" TEXT,
  indexed BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue Streams
CREATE TABLE IF NOT EXISTS "RevenueStream" (
  id SERIAL PRIMARY KEY,
  "streamType" TEXT NOT NULL,
  description TEXT,
  "revenueModel" TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  "estimatedMonthlyRevenue" DOUBLE PRECISION,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Logs
CREATE TABLE IF NOT EXISTS "AdminLog" (
  id TEXT PRIMARY KEY,
  "adminId" TEXT NOT NULL REFERENCES "User"(id),
  action TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  details TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_adminlog_admin ON "AdminLog"("adminId");
CREATE INDEX IF NOT EXISTS idx_adminlog_created ON "AdminLog"("createdAt");

-- Favorites
CREATE TABLE IF NOT EXISTS "Favorite" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("userId", "serviceId")
);
CREATE INDEX IF NOT EXISTS idx_favorite_user ON "Favorite"("userId");

-- Contact Messages
CREATE TABLE IF NOT EXISTS "ContactMessage" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Visitor Sessions
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
  "lastActive" TIMESTAMPTZ DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_visitor_session ON "VisitorSession"("sessionId");
CREATE INDEX IF NOT EXISTS idx_visitor_active ON "VisitorSession"("isActive");

-- Platform Stats
CREATE TABLE IF NOT EXISTS "PlatformStats" (
  id SERIAL PRIMARY KEY,
  "totalVisitors" INTEGER NOT NULL DEFAULT 0,
  "totalUsers" INTEGER NOT NULL DEFAULT 0,
  "totalProviders" INTEGER NOT NULL DEFAULT 0,
  "totalBookings" INTEGER NOT NULL DEFAULT 0,
  "totalServices" INTEGER NOT NULL DEFAULT 0,
  "activeVisitors" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
