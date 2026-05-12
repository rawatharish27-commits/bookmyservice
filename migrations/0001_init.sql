-- BookYourService D1 Migration
-- Run with: npx wrangler d1 execute bookyourservice-db --file=./migrations/0001_init.sql

-- Role table
CREATE TABLE IF NOT EXISTS Role (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User table
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  name TEXT NOT NULL,
  roleId INTEGER NOT NULL,
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
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (roleId) REFERENCES Role(id)
);

-- ProviderKyc table
CREATE TABLE IF NOT EXISTS ProviderKyc (
  id TEXT PRIMARY KEY,
  providerId TEXT NOT NULL UNIQUE,
  documentType TEXT NOT NULL,
  documentNumber TEXT NOT NULL,
  documentFrontUrl TEXT NOT NULL,
  documentBackUrl TEXT,
  selfieUrl TEXT NOT NULL,
  verificationStatus TEXT NOT NULL DEFAULT 'PENDING',
  verifiedBy TEXT,
  verifiedAt TEXT,
  rejectionReason TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (providerId) REFERENCES User(id) ON DELETE CASCADE
);

-- ServiceCategory table
CREATE TABLE IF NOT EXISTS ServiceCategory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  iconUrl TEXT,
  icon TEXT,
  parentId INTEGER,
  isActive INTEGER NOT NULL DEFAULT 1,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  seoTitle TEXT,
  seoDescription TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parentId) REFERENCES ServiceCategory(id)
);

-- ServiceSubcategory table
CREATE TABLE IF NOT EXISTS ServiceSubcategory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoryId INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (categoryId) REFERENCES ServiceCategory(id) ON DELETE CASCADE,
  UNIQUE(categoryId, slug)
);

-- Service table
CREATE TABLE IF NOT EXISTS Service (
  id TEXT PRIMARY KEY,
  providerId TEXT NOT NULL,
  categoryId INTEGER NOT NULL,
  subcategoryId INTEGER,
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
  seoTitle TEXT,
  seoDescription TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (providerId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES ServiceCategory(id),
  FOREIGN KEY (subcategoryId) REFERENCES ServiceSubcategory(id)
);

-- ServiceAvailability table
CREATE TABLE IF NOT EXISTS ServiceAvailability (
  id TEXT PRIMARY KEY,
  serviceId TEXT NOT NULL,
  dayOfWeek INTEGER NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  isAvailable INTEGER NOT NULL DEFAULT 1,
  maxBookingsPerSlot INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (serviceId) REFERENCES Service(id) ON DELETE CASCADE
);

-- Booking table
CREATE TABLE IF NOT EXISTS Booking (
  id TEXT PRIMARY KEY,
  bookingNumber TEXT NOT NULL UNIQUE,
  clientId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  serviceId TEXT NOT NULL,
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
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (clientId) REFERENCES User(id),
  FOREIGN KEY (providerId) REFERENCES User(id),
  FOREIGN KEY (serviceId) REFERENCES Service(id)
);

-- Payment table
CREATE TABLE IF NOT EXISTS Payment (
  id TEXT PRIMARY KEY,
  bookingId TEXT NOT NULL UNIQUE,
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
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE RESTRICT
);

-- Review table
CREATE TABLE IF NOT EXISTS Review (
  id TEXT PRIMARY KEY,
  bookingId TEXT NOT NULL UNIQUE,
  reviewerId TEXT NOT NULL,
  reviewedId TEXT NOT NULL,
  serviceId TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  images TEXT,
  isVerified INTEGER NOT NULL DEFAULT 0,
  isFlagged INTEGER NOT NULL DEFAULT 0,
  flagReason TEXT,
  adminResponse TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewerId) REFERENCES User(id),
  FOREIGN KEY (reviewedId) REFERENCES User(id),
  FOREIGN KEY (serviceId) REFERENCES Service(id)
);

-- Negotiation table
CREATE TABLE IF NOT EXISTS Negotiation (
  id TEXT PRIMARY KEY,
  bookingId TEXT NOT NULL,
  serviceId TEXT NOT NULL,
  proposedBy TEXT NOT NULL,
  proposedPrice REAL NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  respondedAt TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bookingId) REFERENCES Booking(id) ON DELETE CASCADE,
  FOREIGN KEY (serviceId) REFERENCES Service(id) ON DELETE CASCADE,
  FOREIGN KEY (proposedBy) REFERENCES User(id)
);

-- Dispute table
CREATE TABLE IF NOT EXISTS Dispute (
  id TEXT PRIMARY KEY,
  bookingId TEXT NOT NULL,
  raisedBy TEXT NOT NULL,
  disputeType TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  assignedTo TEXT,
  resolution TEXT,
  resolvedAt TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (bookingId) REFERENCES Booking(id),
  FOREIGN KEY (raisedBy) REFERENCES User(id),
  FOREIGN KEY (assignedTo) REFERENCES User(id)
);

-- DisputeMessage table
CREATE TABLE IF NOT EXISTS DisputeMessage (
  id TEXT PRIMARY KEY,
  disputeId TEXT NOT NULL,
  senderId TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (disputeId) REFERENCES Dispute(id) ON DELETE CASCADE
);

-- Notification table
CREATE TABLE IF NOT EXISTS Notification (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  actionUrl TEXT,
  isRead INTEGER NOT NULL DEFAULT 0,
  readAt TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Faq table
CREATE TABLE IF NOT EXISTS Faq (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- LegalPage table
CREATE TABLE IF NOT EXISTS LegalPage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pageType TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  effectiveDate TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- SeoMetadata table
CREATE TABLE IF NOT EXISTS SeoMetadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pageType TEXT NOT NULL,
  pageId TEXT,
  title TEXT,
  description TEXT,
  keywords TEXT,
  canonicalUrl TEXT,
  ogImage TEXT,
  schemaMarkup TEXT,
  indexed INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- RevenueStream table
CREATE TABLE IF NOT EXISTS RevenueStream (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  streamType TEXT NOT NULL,
  description TEXT,
  revenueModel TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  estimatedMonthlyRevenue REAL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- AdminLog table
CREATE TABLE IF NOT EXISTS AdminLog (
  id TEXT PRIMARY KEY,
  adminId TEXT NOT NULL,
  action TEXT NOT NULL,
  targetType TEXT,
  targetId TEXT,
  details TEXT,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (adminId) REFERENCES User(id)
);

-- Favorite table
CREATE TABLE IF NOT EXISTS Favorite (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  serviceId TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (serviceId) REFERENCES Service(id) ON DELETE CASCADE,
  UNIQUE(userId, serviceId)
);

-- ContactMessage table
CREATE TABLE IF NOT EXISTS ContactMessage (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  isRead INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- VisitorSession table
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
  lastActive TEXT NOT NULL DEFAULT (datetime('now')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- PlatformStats table
CREATE TABLE IF NOT EXISTS PlatformStats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  totalVisitors INTEGER NOT NULL DEFAULT 0,
  totalUsers INTEGER NOT NULL DEFAULT 0,
  totalProviders INTEGER NOT NULL DEFAULT 0,
  totalBookings INTEGER NOT NULL DEFAULT 0,
  totalServices INTEGER NOT NULL DEFAULT 0,
  activeVisitors INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_role ON User(roleId);
CREATE INDEX IF NOT EXISTS idx_user_status ON User(status);
CREATE INDEX IF NOT EXISTS idx_service_provider ON Service(providerId);
CREATE INDEX IF NOT EXISTS idx_service_category ON Service(categoryId);
CREATE INDEX IF NOT EXISTS idx_service_approval ON Service(approvalStatus);
CREATE INDEX IF NOT EXISTS idx_service_subcategory ON Service(subcategoryId);
CREATE INDEX IF NOT EXISTS idx_booking_client ON Booking(clientId);
CREATE INDEX IF NOT EXISTS idx_booking_provider ON Booking(providerId);
CREATE INDEX IF NOT EXISTS idx_booking_service ON Booking(serviceId);
CREATE INDEX IF NOT EXISTS idx_booking_status ON Booking(status);
CREATE INDEX IF NOT EXISTS idx_payment_booking ON Payment(bookingId);
CREATE INDEX IF NOT EXISTS idx_review_booking ON Review(bookingId);
CREATE INDEX IF NOT EXISTS idx_review_service ON Review(serviceId);
CREATE INDEX IF NOT EXISTS idx_notification_user ON Notification(userId);
CREATE INDEX IF NOT EXISTS idx_dispute_booking ON Dispute(bookingId);
CREATE INDEX IF NOT EXISTS idx_admin_log_admin ON AdminLog(adminId);
CREATE INDEX IF NOT EXISTS idx_favorite_user ON Favorite(userId);
CREATE INDEX IF NOT EXISTS idx_visitor_session ON VisitorSession(sessionId);
