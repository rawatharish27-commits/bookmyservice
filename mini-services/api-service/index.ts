/**
 * BookYourService API Server
 * 
 * Hono-based API server using PostgreSQL via Prisma.
 * Runs on port 3001 and proxies all /api/* requests.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { PrismaClient } from '/home/z/my-project/node_modules/@prisma/client';
import { PrismaPg } from '/home/z/my-project/node_modules/@prisma/adapter-pg';
import pg from '/home/z/my-project/node_modules/pg';
import { SignJWT, jwtVerify } from '/home/z/my-project/node_modules/jose';
import { createHash, randomBytes } from 'crypto';

// ============================================================
// Database Setup
// ============================================================

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bookyourservice';

const sslmode = connectionString.includes('sslmode=require') ||
                connectionString.includes('ssl=true') ||
                connectionString.includes('neon.tech') ||
                connectionString.includes('supabase.co') ||
                connectionString.includes('railway.app');

const pool = new pg.Pool({
  connectionString,
  ssl: sslmode ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

// ============================================================
// Auth Helpers
// ============================================================

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024');

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  const computedHash = createHash('sha256').update(password + salt).digest('hex');
  return hash === computedHash;
}

async function createToken(payload: Record<string, unknown>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ============================================================
// Hono App
// ============================================================

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://bookyourservice.pages.dev', 'https://bookyourservice.co.in'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// ============================================================
// Auth Middleware
// ============================================================

const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
  c.set('user', payload);
  await next();
};

const adminMiddleware = async (c: any, next: any) => {
  await authMiddleware(c, async () => {
    const user = c.get('user');
    if (user.role !== 'ADMIN') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    await next();
  });
};

// ============================================================
// Health Check
// ============================================================

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', database: 'postgresql', timestamp: new Date().toISOString() });
});

// ============================================================
// Auth Routes
// ============================================================

app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, phone, password, name, roleId, role } = body;

    if (!email || !phone || !password || !name) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }

    // Check existing user
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return c.json({ error: 'Email already registered' }, 409);
    }
    const existingPhone = await db.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return c.json({ error: 'Phone number already registered' }, 409);
    }

    const passwordHash = await hashPassword(password);
    const userRole = role || (roleId === 2 ? 'PROVIDER' : 'CLIENT');
    const userRoleId = roleId || (role === 'PROVIDER' ? 2 : 1);

    const user = await db.user.create({
      data: {
        email,
        phone,
        passwordHash,
        name,
        roleId: userRoleId,
        status: 'ACTIVE',
      },
    });

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: userRole,
      roleId: userRoleId,
    });

    return c.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: userRole,
        roleId: userRoleId,
        status: user.status,
      },
    }, 201);
  } catch (error: any) {
    console.error('Register error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    if (user.status === 'BLOCKED') {
      return c.json({ error: 'Account is blocked. Contact support.' }, 403);
    }

    const userRole = user.role?.name || 'CLIENT';
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: userRole,
      roleId: user.roleId,
    });

    return c.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: userRole,
        roleId: user.roleId,
        status: user.status,
        profileImageUrl: user.profileImageUrl,
        city: user.city,
        state: user.state,
        country: user.country,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

app.get('/api/auth/profile', authMiddleware, async (c: any) => {
  try {
    const userId = c.get('user').id as string;
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) return c.json({ error: 'User not found' }, 404);

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role?.name || 'CLIENT',
        roleId: user.roleId,
        status: user.status,
        profileImageUrl: user.profileImageUrl,
        city: user.city,
        state: user.state,
        country: user.country,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (error: any) {
    console.error('Profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.patch('/api/auth/profile', authMiddleware, async (c: any) => {
  try {
    const userId = c.get('user').id as string;
    const body = await c.req.json();
    const { name, phone, city, state, country, address, pincode } = body;

    const user = await db.user.update({
      where: { id: userId },
      data: { name, phone, city, state, country, address, pincode },
      include: { role: true },
    });

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role?.name || 'CLIENT',
        roleId: user.roleId,
        status: user.status,
        profileImageUrl: user.profileImageUrl,
        city: user.city,
        state: user.state,
        country: user.country,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

app.post('/api/auth/change-password', authMiddleware, async (c: any) => {
  try {
    const userId = c.get('user').id as string;
    const { currentPassword, newPassword } = await c.req.json();

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return c.json({ error: 'User not found' }, 404);

    const validPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!validPassword) return c.json({ error: 'Current password is incorrect' }, 401);

    const passwordHash = await hashPassword(newPassword);
    await db.user.update({ where: { id: userId }, data: { passwordHash } });

    return c.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return c.json({ error: 'Failed to change password' }, 500);
  }
});

// ============================================================
// Categories Routes
// ============================================================

app.get('/api/categories', async (c) => {
  try {
    const categories = await db.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { subcategories: true, services: true } },
      },
    });
    return c.json({ categories });
  } catch (error: any) {
    console.error('Categories error:', error);
    return c.json({ categories: [] });
  }
});

app.get('/api/categories/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const category = await db.serviceCategory.findUnique({
      where: { id },
      include: {
        subcategories: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
        services: {
          where: { isActive: true, isApproved: true },
          include: { provider: { select: { id: true, name: true, profileImageUrl: true } } },
        },
      },
    });
    if (!category) return c.json({ error: 'Category not found' }, 404);
    return c.json(category);
  } catch (error: any) {
    console.error('Category detail error:', error);
    return c.json({ error: 'Failed to fetch category' }, 500);
  }
});

// ============================================================
// Subcategories Routes
// ============================================================

app.get('/api/subcategories', async (c) => {
  try {
    const categoryId = c.req.query('categoryId');
    const where: any = { isActive: true };
    if (categoryId) where.categoryId = parseInt(categoryId);

    const subcategories = await db.serviceSubcategory.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return c.json({ subcategories });
  } catch (error: any) {
    console.error('Subcategories error:', error);
    return c.json({ subcategories: [] });
  }
});

// ============================================================
// Services Routes
// ============================================================

app.get('/api/services', async (c) => {
  try {
    const categoryId = c.req.query('categoryId');
    const subcategoryId = c.req.query('subcategoryId');
    const city = c.req.query('city');
    const search = c.req.query('search');

    const where: any = { isActive: true, isApproved: true };
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (subcategoryId) where.subcategoryId = parseInt(subcategoryId);
    if (city) where.city = { equals: city, mode: 'insensitive' };
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];

    const services = await db.service.findMany({
      where,
      orderBy: { averageRating: 'desc' },
      include: {
        provider: { select: { id: true, name: true, profileImageUrl: true, city: true } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        _count: { select: { reviews: true, bookings: true } },
      },
      take: 50,
    });

    return c.json({ services });
  } catch (error: any) {
    console.error('Services error:', error);
    return c.json({ services: [] });
  }
});

app.get('/api/services/search', async (c) => {
  try {
    const q = c.req.query('q') || '';
    const categoryId = c.req.query('categoryId');
    const minPrice = c.req.query('minPrice');
    const maxPrice = c.req.query('maxPrice');
    const city = c.req.query('city');

    const where: any = { isActive: true, isApproved: true };
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (city) where.city = { equals: city, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }

    const services = await db.service.findMany({
      where,
      orderBy: { averageRating: 'desc' },
      include: {
        provider: { select: { id: true, name: true, profileImageUrl: true, city: true } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
      take: 50,
    });

    return c.json({ services });
  } catch (error: any) {
    console.error('Search error:', error);
    return c.json({ services: [] });
  }
});

app.get('/api/services/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const service = await db.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true, name: true, profileImageUrl: true, city: true, state: true,
            providerKyc: { select: { verificationStatus: true } },
            services: { select: { id: true, averageRating: true }, take: 5 },
          },
        },
        category: { select: { id: true, name: true, slug: true, icon: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        availability: { orderBy: { dayOfWeek: 'asc' } },
        reviews: {
          include: { reviewer: { select: { id: true, name: true, profileImageUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!service) return c.json({ error: 'Service not found' }, 404);
    return c.json(service);
  } catch (error: any) {
    console.error('Service detail error:', error);
    return c.json({ error: 'Failed to fetch service' }, 500);
  }
});

// ============================================================
// Bookings Routes
// ============================================================

app.get('/api/bookings', authMiddleware, async (c: any) => {
  try {
    const userId = c.get('user').id as string;
    const userRole = c.get('user').role as string;

    const where: any = {};
    if (userRole === 'CLIENT') where.clientId = userId;
    else if (userRole === 'PROVIDER') where.providerId = userId;

    const bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        service: { select: { id: true, title: true, basePrice: true, images: true } },
        client: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, name: true, phone: true } },
        review: true,
      },
      take: 50,
    });

    return c.json({ bookings });
  } catch (error: any) {
    console.error('Bookings error:', error);
    return c.json({ bookings: [] });
  }
});

app.post('/api/bookings', authMiddleware, async (c: any) => {
  try {
    const clientId = c.get('user').id as string;
    const body = await c.req.json();
    const { serviceId, scheduledDate, scheduledTime, serviceAddress, specialInstructions } = body;

    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (!service) return c.json({ error: 'Service not found' }, 404);

    const bookingNumber = `BYS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const finalPrice = service.basePrice;

    const booking = await db.booking.create({
      data: {
        bookingNumber,
        clientId,
        providerId: service.providerId,
        serviceId,
        scheduledDate,
        scheduledTime,
        serviceAddress,
        specialInstructions,
        basePrice: service.basePrice,
        finalPrice,
        platformFee: Math.round(finalPrice * 0.05),
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    });

    return c.json(booking, 201);
  } catch (error: any) {
    console.error('Create booking error:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

app.get('/api/bookings/:id', authMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id');
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        service: { include: { category: true } },
        client: { select: { id: true, name: true, phone: true, email: true } },
        provider: { select: { id: true, name: true, phone: true, email: true } },
        review: true,
        payment: true,
      },
    });
    if (!booking) return c.json({ error: 'Booking not found' }, 404);
    return c.json(booking);
  } catch (error: any) {
    console.error('Booking detail error:', error);
    return c.json({ error: 'Failed to fetch booking' }, 500);
  }
});

// Booking status updates
app.post('/api/bookings/:id/accept', authMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id');
    const booking = await db.booking.update({ where: { id }, data: { status: 'ACCEPTED' } });
    return c.json(booking);
  } catch (error: any) {
    return c.json({ error: 'Failed to accept booking' }, 500);
  }
});

app.post('/api/bookings/:id/reject', authMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const booking = await db.booking.update({
      where: { id },
      data: { status: 'REJECTED', cancellationReason: body.reason, cancelledBy: c.get('user').id },
    });
    return c.json(booking);
  } catch (error: any) {
    return c.json({ error: 'Failed to reject booking' }, 500);
  }
});

app.post('/api/bookings/:id/start', authMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id');
    const booking = await db.booking.update({ where: { id }, data: { status: 'IN_PROGRESS' } });
    return c.json(booking);
  } catch (error: any) {
    return c.json({ error: 'Failed to start booking' }, 500);
  }
});

app.post('/api/bookings/:id/complete', authMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id');
    const booking = await db.booking.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date(), paymentStatus: 'PAID' },
    });
    return c.json(booking);
  } catch (error: any) {
    return c.json({ error: 'Failed to complete booking' }, 500);
  }
});

app.post('/api/bookings/:id/cancel', authMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const booking = await db.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: body.reason,
        cancelledBy: c.get('user').id,
        cancelledAt: new Date(),
      },
    });
    return c.json(booking);
  } catch (error: any) {
    return c.json({ error: 'Failed to cancel booking' }, 500);
  }
});

// ============================================================
// Reviews Routes
// ============================================================

app.get('/api/reviews', async (c) => {
  try {
    const serviceId = c.req.query('serviceId');
    const reviewedId = c.req.query('reviewedId');

    const where: any = {};
    if (serviceId) where.serviceId = serviceId;
    if (reviewedId) where.reviewedId = reviewedId;

    const reviews = await db.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { id: true, name: true, profileImageUrl: true } },
        service: { select: { id: true, title: true } },
      },
      take: 50,
    });

    return c.json({ reviews });
  } catch (error: any) {
    console.error('Reviews error:', error);
    return c.json({ reviews: [] });
  }
});

app.post('/api/reviews', authMiddleware, async (c: any) => {
  try {
    const reviewerId = c.get('user').id as string;
    const { bookingId, serviceId, rating, comment } = await c.req.json();

    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return c.json({ error: 'Booking not found' }, 404);
    if (booking.clientId !== reviewerId) return c.json({ error: 'Not your booking' }, 403);

    const review = await db.review.create({
      data: {
        bookingId,
        reviewerId,
        reviewedId: booking.providerId,
        serviceId,
        rating,
        comment,
      },
    });

    return c.json(review, 201);
  } catch (error: any) {
    console.error('Create review error:', error);
    return c.json({ error: 'Failed to create review' }, 500);
  }
});

// ============================================================
// Favorites Routes
// ============================================================

app.get('/api/favorites', authMiddleware, async (c: any) => {
  try {
    const userId = c.get('user').id as string;
    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        service: {
          include: {
            provider: { select: { id: true, name: true } },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    return c.json({ favorites });
  } catch (error: any) {
    console.error('Favorites error:', error);
    return c.json({ favorites: [] });
  }
});

app.post('/api/favorites/:serviceId', authMiddleware, async (c: any) => {
  try {
    const userId = c.get('user').id as string;
    const serviceId = c.req.param('serviceId');

    const existing = await db.favorite.findUnique({
      where: { userId_serviceId: { userId, serviceId } },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return c.json({ favorited: false });
    }

    await db.favorite.create({ data: { userId, serviceId } });
    return c.json({ favorited: true }, 201);
  } catch (error: any) {
    console.error('Favorite toggle error:', error);
    return c.json({ error: 'Failed to toggle favorite' }, 500);
  }
});

// ============================================================
// Notifications Routes
// ============================================================

app.get('/api/notifications', authMiddleware, async (c: any) => {
  try {
    const userId = c.get('user').id as string;
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return c.json({ notifications });
  } catch (error: any) {
    console.error('Notifications error:', error);
    return c.json({ notifications: [] });
  }
});

app.post('/api/notifications/:id/read', authMiddleware, async (c: any) => {
  try {
    const id = c.req.param('id');
    await db.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// ============================================================
// FAQ Routes
// ============================================================

app.get('/api/faq', async (c) => {
  try {
    const category = c.req.query('category');
    const where: any = { isActive: true };
    if (category) where.category = category;

    const faqs = await db.faq.findMany({
      where,
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });
    return c.json({ faqs });
  } catch (error: any) {
    console.error('FAQ error:', error);
    return c.json({ faqs: [] });
  }
});

// ============================================================
// Legal Pages Routes
// ============================================================

app.get('/api/legal', async (c) => {
  try {
    const legalPages = await db.legalPage.findMany({ orderBy: { pageType: 'asc' } });
    return c.json({ legalPages });
  } catch (error: any) {
    console.error('Legal pages error:', error);
    return c.json({ legalPages: [] });
  }
});

app.get('/api/legal/:type', async (c) => {
  try {
    const pageType = c.req.param('type').toUpperCase();
    const legalPage = await db.legalPage.findUnique({ where: { pageType } });
    if (!legalPage) return c.json({ error: 'Legal page not found' }, 404);
    return c.json(legalPage);
  } catch (error: any) {
    console.error('Legal page detail error:', error);
    return c.json({ error: 'Failed to fetch legal page' }, 500);
  }
});

// ============================================================
// Contact Route
// ============================================================

app.post('/api/contact', async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json();
    if (!name || !email || !subject || !message) {
      return c.json({ error: 'All fields are required' }, 400);
    }
    await db.contactMessage.create({ data: { name, email, subject, message } });
    return c.json({ success: true, message: 'Message sent successfully' }, 201);
  } catch (error: any) {
    console.error('Contact error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// ============================================================
// Stats Routes
// ============================================================

app.post('/api/stats/visitor', async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, ipAddress, userAgent, page, referrer } = body;

    await db.visitorSession.upsert({
      where: { sessionId },
      create: { sessionId, ipAddress, userAgent, page, referrer, isActive: true },
      update: { lastActive: new Date(), isActive: true, page, ipAddress, userAgent },
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Visitor tracking error:', error);
    return c.json({ success: true });
  }
});

app.get('/api/stats/platform', async (c) => {
  try {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const activeVisitors = await db.visitorSession.count({
      where: { isActive: true, lastActive: { gte: thirtyMinAgo } },
    });
    const totalUsers = await db.user.count();
    const totalProviders = await db.user.count({ where: { roleId: 2 } });
    const totalBookings = await db.booking.count();
    const totalServices = await db.service.count({ where: { isActive: true } });

    return c.json({
      activeVisitors,
      totalUsers,
      totalProviders,
      totalBookings,
      totalServices,
    });
  } catch (error: any) {
    console.error('Platform stats error:', error);
    return c.json({ activeVisitors: 0, totalUsers: 0, totalProviders: 0, totalBookings: 0, totalServices: 0 });
  }
});

// ============================================================
// KYC Routes
// ============================================================

app.post('/api/kyc/submit', authMiddleware, async (c: any) => {
  try {
    const providerId = c.get('user').id as string;
    const body = await c.req.json();
    const { documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl } = body;

    const kyc = await db.providerKyc.upsert({
      where: { providerId },
      create: { providerId, documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl },
      update: { documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl, verificationStatus: 'PENDING' },
    });

    return c.json(kyc, 201);
  } catch (error: any) {
    console.error('KYC submit error:', error);
    return c.json({ error: 'Failed to submit KYC' }, 500);
  }
});

app.get('/api/kyc/status', authMiddleware, async (c: any) => {
  try {
    const providerId = c.get('user').id as string;
    const kyc = await db.providerKyc.findUnique({ where: { providerId } });
    if (!kyc) return c.json({ status: 'NOT_SUBMITTED' });
    return c.json(kyc);
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch KYC status' }, 500);
  }
});

// ============================================================
// Admin Routes
// ============================================================

app.get('/api/admin/dashboard', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);

    const [totalUsers, totalProviders, totalBookings, totalServices, totalRevenue] = await Promise.all([
      db.user.count({ where: { roleId: 1 } }),
      db.user.count({ where: { roleId: 2 } }),
      db.booking.count(),
      db.service.count(),
      db.booking.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { finalPrice: true } }),
    ]);

    return c.json({
      totalUsers,
      totalProviders,
      totalBookings,
      totalServices,
      totalRevenue: totalRevenue._sum.finalPrice || 0,
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

app.get('/api/admin/users', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { role: true, _count: { select: { clientBookings: true, providerBookings: true, services: true } } },
      take: 100,
    });

    return c.json({ users });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return c.json({ users: [] });
  }
});

app.get('/api/admin/users/:userId', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);

    const userId = c.req.param('userId');
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        providerKyc: true,
        _count: { select: { clientBookings: true, providerBookings: true, services: true, reviewsGiven: true, reviewsReceived: true } },
      },
    });

    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json(user);
  } catch (error: any) {
    console.error('Admin user detail error:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

app.get('/api/admin/services', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);

    const services = await db.service.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        provider: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
      take: 100,
    });

    return c.json({ services });
  } catch (error: any) {
    console.error('Admin services error:', error);
    return c.json({ services: [] });
  }
});

app.get('/api/admin/bookings', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);

    const bookings = await db.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, title: true } },
      },
      take: 100,
    });

    return c.json({ bookings });
  } catch (error: any) {
    console.error('Admin bookings error:', error);
    return c.json({ bookings: [] });
  }
});

app.get('/api/admin/revenue', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);

    const revenueData = await db.booking.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { finalPrice: true, platformFee: true, providerEarnings: true },
      _count: true,
    });

    return c.json({
      totalRevenue: revenueData._sum.finalPrice || 0,
      totalPlatformFee: revenueData._sum.platformFee || 0,
      totalProviderEarnings: revenueData._sum.providerEarnings || 0,
      totalPaidBookings: revenueData._count,
    });
  } catch (error: any) {
    console.error('Admin revenue error:', error);
    return c.json({ error: 'Failed to fetch revenue data' }, 500);
  }
});

app.get('/api/admin/disputes', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);

    const disputes = await db.dispute.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: { select: { id: true, bookingNumber: true } },
        raiser: { select: { id: true, name: true } },
      },
      take: 50,
    });

    return c.json({ disputes });
  } catch (error: any) {
    console.error('Admin disputes error:', error);
    return c.json({ disputes: [] });
  }
});

app.get('/api/admin/faq', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);

    const faqs = await db.faq.findMany({
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });

    return c.json(faqs);
  } catch (error: any) {
    console.error('Admin FAQ error:', error);
    return c.json([]);
  }
});

app.get('/api/admin/logs', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);

    const logs = await db.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { id: true, name: true, email: true } } },
      take: 100,
    });

    return c.json({ logs });
  } catch (error: any) {
    console.error('Admin logs error:', error);
    return c.json({ logs: [] });
  }
});

app.post('/api/admin/categories', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json();
    const category = await db.serviceCategory.create({ data: body });
    return c.json(category, 201);
  } catch (error: any) {
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

app.patch('/api/admin/categories', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json();
    const { id, ...data } = body;
    const category = await db.serviceCategory.update({ where: { id }, data });
    return c.json(category);
  } catch (error: any) {
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

app.post('/api/admin/faq', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json();
    const faq = await db.faq.create({ data: body });
    return c.json(faq, 201);
  } catch (error: any) {
    return c.json({ error: 'Failed to create FAQ' }, 500);
  }
});

app.patch('/api/admin/faq/:faqId', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);
    const faqId = parseInt(c.req.param('faqId'));
    const body = await c.req.json();
    const faq = await db.faq.update({ where: { id: faqId }, data: body });
    return c.json(faq);
  } catch (error: any) {
    return c.json({ error: 'Failed to update FAQ' }, 500);
  }
});

app.delete('/api/admin/faq/:faqId', authMiddleware, async (c: any) => {
  try {
    if (c.get('user').role !== 'ADMIN') return c.json({ error: 'Forbidden' }, 403);
    const faqId = parseInt(c.req.param('faqId'));
    await db.faq.delete({ where: { id: faqId } });
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: 'Failed to delete FAQ' }, 500);
  }
});

// ============================================================
// Disputes Routes
// ============================================================

app.get('/api/disputes', authMiddleware, async (c: any) => {
  try {
    const userId = c.get('user').id as string;
    const userRole = c.get('user').role as string;

    const where: any = {};
    if (userRole === 'CLIENT' || userRole === 'PROVIDER') where.raisedBy = userId;

    const disputes = await db.dispute.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { booking: { select: { id: true, bookingNumber: true } } },
      take: 50,
    });

    return c.json({ disputes });
  } catch (error: any) {
    return c.json({ disputes: [] });
  }
});

app.get('/api/disputes/:disputeId', authMiddleware, async (c: any) => {
  try {
    const disputeId = c.req.param('disputeId');
    const dispute = await db.dispute.findUnique({
      where: { id: disputeId },
      include: {
        booking: true,
        raiser: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!dispute) return c.json({ error: 'Dispute not found' }, 404);
    return c.json(dispute);
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch dispute' }, 500);
  }
});

// ============================================================
// Start Server
// ============================================================

const PORT = 3001;

console.log(`🚀 BookYourService API Server starting on port ${PORT}...`);
console.log(`📊 Database: PostgreSQL (${connectionString.includes('neon.tech') ? 'Neon' : connectionString.includes('supabase') ? 'Supabase' : connectionString.includes('railway') ? 'Railway' : 'Local'})`);

export default app;

// For bun --hot
if (import.meta.main) {
  const { serve } = await import('@hono/node-server');
  serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`✅ API Server running at http://localhost:${info.port}`);
  });
}
