-- BookYourService D1 Database Schema
-- Migration 0001: Initial schema

-- Roles
CREATE TABLE IF NOT EXISTS Role (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Users
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  name TEXT NOT NULL,
  roleId INTEGER NOT NULL REFERENCES Role(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  emailVerified INTEGER NOT NULL DEFAULT 0,
  phoneVerified INTEGER NOT NULL DEFAULT 0,
  profileImageUrl TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  pincode TEXT,
  latitude REAL,
  longitude REAL,
  lastLoginAt TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_user_email ON User(email);
CREATE INDEX IF NOT EXISTS idx_user_phone ON User(phone);
CREATE INDEX IF NOT EXISTS idx_user_role ON User(roleId);
CREATE INDEX IF NOT EXISTS idx_user_status ON User(status);

-- Provider KYC
CREATE TABLE IF NOT EXISTS ProviderKyc (
  id TEXT PRIMARY KEY,
  providerId TEXT NOT NULL UNIQUE REFERENCES User(id) ON DELETE CASCADE,
  documentType TEXT NOT NULL,
  documentNumber TEXT NOT NULL,
  documentFrontUrl TEXT NOT NULL,
  documentBackUrl TEXT,
  selfieUrl TEXT NOT NULL,
  verificationStatus TEXT NOT NULL DEFAULT 'PENDING',
  verifiedBy TEXT,
  verifiedAt TEXT,
  rejectionReason TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Service Categories
CREATE TABLE IF NOT EXISTS ServiceCategory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  iconUrl TEXT,
  icon TEXT,
  parentId INTEGER REFERENCES ServiceCategory(id),
  isActive INTEGER NOT NULL DEFAULT 1,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  seoTitle TEXT,
  seoDescription TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_category_slug ON ServiceCategory(slug);
CREATE INDEX IF NOT EXISTS idx_category_active ON ServiceCategory(isActive);

-- Service Subcategories
CREATE TABLE IF NOT EXISTS ServiceSubcategory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoryId INTEGER NOT NULL REFERENCES ServiceCategory(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  UNIQUE(categoryId, slug)
);
CREATE INDEX IF NOT EXISTS idx_subcategory_category ON ServiceSubcategory(categoryId);

-- Services
CREATE TABLE IF NOT EXISTS Service (
  id TEXT PRIMARY KEY,
  providerId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
  categoryId INTEGER NOT NULL REFERENCES ServiceCategory(id),
  subcategoryId INTEGER REFERENCES ServiceSubcategory(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  basePrice REAL NOT NULL,
  priceNegotiable INTEGER NOT NULL DEFAULT 0,
  serviceDurationMinutes INTEGER,
  serviceAreaRadiusKm INTEGER NOT NULL DEFAULT 10,
  latitude REAL,
  longitude REAL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  pincode TEXT,
  images TEXT,
  isActive INTEGER NOT NULL DEFAULT 0,
  isApproved INTEGER NOT NULL DEFAULT 0,
  approvalStatus TEXT NOT NULL DEFAULT 'PENDING',
  approvedBy TEXT,
  approvedAt TEXT,
  rejectionReason TEXT,
  averageRating REAL NOT NULL DEFAULT 0,
  totalBookings INTEGER NOT NULL DEFAULT 0,
  totalReviews INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_service_provider ON Service(providerId);
CREATE INDEX IF NOT EXISTS idx_service_category ON Service(categoryId);
CREATE INDEX IF NOT EXISTS idx_service_active ON Service(isActive, isApproved);
CREATE INDEX IF NOT EXISTS idx_service_city ON Service(city);
CREATE INDEX IF NOT EXISTS idx_service_price ON Service(basePrice);

-- Service Availability
CREATE TABLE IF NOT EXISTS ServiceAvailability (
  id TEXT PRIMARY KEY,
  serviceId TEXT NOT NULL REFERENCES Service(id) ON DELETE CASCADE,
  dayOfWeek INTEGER NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  isAvailable INTEGER NOT NULL DEFAULT 1,
  maxBookingsPerSlot INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_availability_service ON ServiceAvailability(serviceId);

-- Bookings
CREATE TABLE IF NOT EXISTS Booking (
  id TEXT PRIMARY KEY,
  bookingNumber TEXT NOT NULL UNIQUE,
  clientId TEXT NOT NULL REFERENCES User(id),
  providerId TEXT NOT NULL REFERENCES User(id),
  serviceId TEXT NOT NULL REFERENCES Service(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  scheduledDate TEXT NOT NULL,
  scheduledTime TEXT NOT NULL,
  serviceAddress TEXT NOT NULL,
  serviceLatitude REAL,
  serviceLongitude REAL,
  distanceKm REAL,
  basePrice REAL NOT NULL,
  negotiatedPrice REAL,
  finalPrice REAL NOT NULL,
  platformFee REAL NOT NULL DEFAULT 5.0,
  providerEarnings REAL,
  specialInstructions TEXT,
  cancellationReason TEXT,
  cancelledBy TEXT,
  cancelledAt TEXT,
  completedAt TEXT,
  paymentStatus TEXT NOT NULL DEFAULT 'PENDING',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_booking_client ON Booking(clientId);
CREATE INDEX IF NOT EXISTS idx_booking_provider ON Booking(providerId);
CREATE INDEX IF NOT EXISTS idx_booking_service ON Booking(serviceId);
CREATE INDEX IF NOT EXISTS idx_booking_status ON Booking(status);
CREATE INDEX IF NOT EXISTS idx_booking_number ON Booking(bookingNumber);

-- Payments
CREATE TABLE IF NOT EXISTS Payment (
  id TEXT PRIMARY KEY,
  bookingId TEXT NOT NULL UNIQUE REFERENCES Booking(id),
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  paymentMethod TEXT,
  gateway TEXT,
  gatewayOrderId TEXT,
  gatewayPaymentId TEXT,
  status TEXT NOT NULL DEFAULT 'CREATED',
  refundAmount REAL,
  refundReason TEXT,
  refundedAt TEXT,
  metadata TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Reviews
CREATE TABLE IF NOT EXISTS Review (
  id TEXT PRIMARY KEY,
  bookingId TEXT NOT NULL UNIQUE REFERENCES Booking(id) ON DELETE CASCADE,
  reviewerId TEXT NOT NULL REFERENCES User(id),
  reviewedId TEXT NOT NULL REFERENCES User(id),
  serviceId TEXT NOT NULL REFERENCES Service(id),
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT,
  isVerified INTEGER NOT NULL DEFAULT 0,
  isFlagged INTEGER NOT NULL DEFAULT 0,
  flagReason TEXT,
  adminResponse TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_review_service ON Review(serviceId);
CREATE INDEX IF NOT EXISTS idx_review_reviewer ON Review(reviewerId);

-- Negotiations
CREATE TABLE IF NOT EXISTS Negotiation (
  id TEXT PRIMARY KEY,
  bookingId TEXT NOT NULL REFERENCES Booking(id) ON DELETE CASCADE,
  serviceId TEXT NOT NULL REFERENCES Service(id) ON DELETE CASCADE,
  proposedBy TEXT NOT NULL REFERENCES User(id),
  proposedPrice REAL NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  respondedAt TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Disputes
CREATE TABLE IF NOT EXISTS Dispute (
  id TEXT PRIMARY KEY,
  bookingId TEXT NOT NULL REFERENCES Booking(id),
  raisedBy TEXT NOT NULL REFERENCES User(id),
  disputeType TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  assignedTo TEXT REFERENCES User(id),
  resolution TEXT,
  resolvedAt TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_dispute_raiser ON Dispute(raisedBy);
CREATE INDEX IF NOT EXISTS idx_dispute_status ON Dispute(status);

-- Dispute Messages
CREATE TABLE IF NOT EXISTS DisputeMessage (
  id TEXT PRIMARY KEY,
  disputeId TEXT NOT NULL REFERENCES Dispute(id) ON DELETE CASCADE,
  senderId TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_dispute_msg ON DisputeMessage(disputeId);

-- Notifications
CREATE TABLE IF NOT EXISTS Notification (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  actionUrl TEXT,
  isRead INTEGER NOT NULL DEFAULT 0,
  readAt TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notification_user ON Notification(userId);
CREATE INDEX IF NOT EXISTS idx_notification_unread ON Notification(userId, isRead);

-- FAQ
CREATE TABLE IF NOT EXISTS Faq (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Legal Pages
CREATE TABLE IF NOT EXISTS LegalPage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pageType TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  effectiveDate TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- SEO Metadata
CREATE TABLE IF NOT EXISTS SeoMetadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pageType TEXT,
  pageId TEXT,
  title TEXT,
  description TEXT,
  keywords TEXT,
  canonicalUrl TEXT,
  ogImage TEXT,
  schemaMarkup TEXT,
  indexed INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Revenue Streams
CREATE TABLE IF NOT EXISTS RevenueStream (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  streamType TEXT NOT NULL,
  description TEXT,
  revenueModel TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  estimatedMonthlyRevenue REAL,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Admin Logs
CREATE TABLE IF NOT EXISTS AdminLog (
  id TEXT PRIMARY KEY,
  adminId TEXT NOT NULL REFERENCES User(id),
  action TEXT NOT NULL,
  targetType TEXT,
  targetId TEXT,
  details TEXT,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_adminlog_admin ON AdminLog(adminId);
CREATE INDEX IF NOT EXISTS idx_adminlog_created ON AdminLog(createdAt);

-- Favorites
CREATE TABLE IF NOT EXISTS Favorite (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
  serviceId TEXT NOT NULL REFERENCES Service(id) ON DELETE CASCADE,
  createdAt TEXT DEFAULT (datetime('now')),
  UNIQUE(userId, serviceId)
);
CREATE INDEX IF NOT EXISTS idx_favorite_user ON Favorite(userId);

-- Contact Messages
CREATE TABLE IF NOT EXISTS ContactMessage (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  isRead INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Visitor Sessions
CREATE TABLE IF NOT EXISTS VisitorSession (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL UNIQUE,
  ipAddress TEXT,
  userAgent TEXT,
  country TEXT,
  city TEXT,
  page TEXT,
  referrer TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  lastActive TEXT DEFAULT (datetime('now')),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_visitor_session ON VisitorSession(sessionId);
CREATE INDEX IF NOT EXISTS idx_visitor_active ON VisitorSession(isActive);

-- Platform Stats
CREATE TABLE IF NOT EXISTS PlatformStats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  totalVisitors INTEGER NOT NULL DEFAULT 0,
  totalUsers INTEGER NOT NULL DEFAULT 0,
  totalProviders INTEGER NOT NULL DEFAULT 0,
  totalBookings INTEGER NOT NULL DEFAULT 0,
  totalServices INTEGER NOT NULL DEFAULT 0,
  activeVisitors INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT DEFAULT (datetime('now'))
);
