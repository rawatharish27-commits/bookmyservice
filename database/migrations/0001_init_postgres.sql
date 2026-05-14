-- BookYourService PostgreSQL Database Schema
-- Migration 0001: Initial schema

-- Roles
CREATE TABLE IF NOT EXISTS "Role" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  latitude REAL,
  longitude REAL,
  "lastLoginAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  "verifiedAt" TIMESTAMP,
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
  "basePrice" REAL NOT NULL,
  "priceNegotiable" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "rating" REAL DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "completionRate" REAL DEFAULT 0,
  "responseTime" INTEGER, -- in minutes
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_service_provider ON "Service"("providerId");
CREATE INDEX IF NOT EXISTS idx_service_category ON "Service"("categoryId");
CREATE INDEX IF NOT EXISTS idx_service_active ON "Service"("isActive");
CREATE INDEX IF NOT EXISTS idx_service_verified ON "Service"("isVerified");

-- Service Images
CREATE TABLE IF NOT EXISTS "ServiceImage" (
  id TEXT PRIMARY KEY,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "imageUrl" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_service_image_service ON "ServiceImage"("serviceId");

-- Bookings
CREATE TABLE IF NOT EXISTS "Booking" (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "providerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "scheduledDate" DATE NOT NULL,
  "scheduledTime" TIME NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  "specialInstructions" TEXT,
  "totalAmount" REAL NOT NULL,
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "paymentMethod" TEXT,
  "transactionId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_booking_customer ON "Booking"("customerId");
CREATE INDEX IF NOT EXISTS idx_booking_service ON "Booking"("serviceId");
CREATE INDEX IF NOT EXISTS idx_booking_provider ON "Booking"("providerId");
CREATE INDEX IF NOT EXISTS idx_booking_status ON "Booking"(status);
CREATE INDEX IF NOT EXISTS idx_booking_date ON "Booking"("scheduledDate");

-- Reviews
CREATE TABLE IF NOT EXISTS "Review" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL UNIQUE REFERENCES "Booking"(id) ON DELETE CASCADE,
  "customerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "providerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_review_customer ON "Review"("customerId");
CREATE INDEX IF NOT EXISTS idx_review_provider ON "Review"("providerId");
CREATE INDEX IF NOT EXISTS idx_review_service ON "Review"("serviceId");
CREATE INDEX IF NOT EXISTS idx_review_rating ON "Review"(rating);

-- Favorites
CREATE TABLE IF NOT EXISTS "Favorite" (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("customerId", "serviceId")
);
CREATE INDEX IF NOT EXISTS idx_favorite_customer ON "Favorite"("customerId");
CREATE INDEX IF NOT EXISTS idx_favorite_service ON "Favorite"("serviceId");

-- Notifications
CREATE TABLE IF NOT EXISTS "Notification" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "data" JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS idx_notification_read ON "Notification"("isRead");

-- Disputes
CREATE TABLE IF NOT EXISTS "Dispute" (
  id TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL UNIQUE REFERENCES "Booking"(id) ON DELETE CASCADE,
  "initiatorId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "againstId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  "resolution" TEXT,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dispute_booking ON "Dispute"("bookingId");
CREATE INDEX IF NOT EXISTS idx_dispute_initiator ON "Dispute"("initiatorId");
CREATE INDEX IF NOT EXISTS idx_dispute_status ON "Dispute"(status);

-- Insert default roles
INSERT INTO "Role" (name, description) VALUES
('CUSTOMER', 'Service customer'),
('PROVIDER', 'Service provider'),
('ADMIN', 'System administrator')
ON CONFLICT (name) DO NOTHING;