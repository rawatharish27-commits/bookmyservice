/**
 * GET /api/bookings - Returns user's bookings
 *   - Client sees own bookings
 *   - Provider sees assigned bookings
 *   - Admin sees all bookings
 *
 * POST /api/bookings - Create a new booking
 *   - Client only (requireRole CLIENT)
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, error, unauthorized, forbidden } from '../../_shared/response';
import { sanitizeString, sanitizeObject, validatePrice } from '../../_shared/security';

// Generate a unique booking number
function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BYS-${timestamp}-${random}`;
}

// Generate a unique ID
function generateId(): string {
  return `bkg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    const supabase = createSupabaseClient(context.env);

    const url = new URL(context.request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    let bookingsData: Record<string, unknown>[] = [];
    let total = 0;

    if (user.role === 'ADMIN') {
      // Admin sees all bookings
      const selectColumns = '*,service:Service!Booking_serviceId_fkey(title,basePrice),client:User!Booking_clientId_fkey(name,email,phone),provider:User!Booking_providerId_fkey(name,email,phone)';

      let query = supabase
        .from('Booking')
        .select(selectColumns, { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, count, error: fetchError } = await query
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) {
        console.error('Get bookings error:', fetchError);
        return error('Failed to fetch bookings', 500);
      }

      bookingsData = (data || []) as Record<string, unknown>[];
      total = count ?? 0;
    } else if (user.role === 'PROVIDER') {
      // Provider sees assigned bookings
      const selectColumns = '*,service:Service!Booking_serviceId_fkey(title,basePrice),client:User!Booking_clientId_fkey(name,email,phone)';

      let query = supabase
        .from('Booking')
        .select(selectColumns, { count: 'exact' })
        .eq('providerId', user.userId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, count, error: fetchError } = await query
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) {
        console.error('Get bookings error:', fetchError);
        return error('Failed to fetch bookings', 500);
      }

      bookingsData = (data || []) as Record<string, unknown>[];
      total = count ?? 0;
    } else {
      // Client sees own bookings
      const selectColumns = '*,service:Service!Booking_serviceId_fkey(title,basePrice),provider:User!Booking_providerId_fkey(name,email,phone)';

      let query = supabase
        .from('Booking')
        .select(selectColumns, { count: 'exact' })
        .eq('clientId', user.userId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, count, error: fetchError } = await query
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) {
        console.error('Get bookings error:', fetchError);
        return error('Failed to fetch bookings', 500);
      }

      bookingsData = (data || []) as Record<string, unknown>[];
      total = count ?? 0;
    }

    // Transform nested objects into flat format for backward compatibility
    const formattedBookings = bookingsData.map((b) => {
      const service = (b.service as Record<string, unknown>) || {};
      const client = (b.client as Record<string, unknown>) || {};
      const provider = (b.provider as Record<string, unknown>) || {};

      return {
        ...b,
        serviceTitle: service.title ?? null,
        serviceBasePrice: service.basePrice ?? null,
        ...(Object.keys(client).length > 0 ? {
          clientName: client.name ?? null,
          clientEmail: client.email ?? null,
          clientPhone: client.phone ?? null,
        } : {}),
        ...(Object.keys(provider).length > 0 ? {
          providerName: provider.name ?? null,
          providerEmail: provider.email ?? null,
          providerPhone: provider.phone ?? null,
        } : {}),
        // Remove nested objects to keep response clean
        service: undefined,
        client: undefined,
        provider: undefined,
      };
    });

    return json({
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(Number(total) / limit),
      },
    });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Get bookings error:', err);
    return error('Failed to fetch bookings', 500);
  }
}

export async function onRequestPost(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    // Client only
    if (!requireRole(user, 'CLIENT')) {
      return forbidden('Only clients can create bookings');
    }

    const body = await context.request.json() as Record<string, unknown>;
    const sanitized = sanitizeObject(body);

    const serviceId = sanitized.serviceId as string;
    const scheduledDate = sanitized.scheduledDate as string;
    const scheduledTime = sanitized.scheduledTime as string;
    const address = sanitizeString(String(sanitized.address || ''));
    const city = sanitizeString(String(sanitized.city || ''));
    const pincode = sanitizeString(String(sanitized.pincode || ''));
    const notes = sanitized.notes ? sanitizeString(String(sanitized.notes)) : null;

    // Validate required fields
    if (!serviceId) return error('serviceId is required');
    if (!scheduledDate) return error('scheduledDate is required');
    if (!scheduledTime) return error('scheduledTime is required');
    if (!address) return error('address is required');
    if (!city) return error('city is required');
    if (!pincode) return error('pincode is required');

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
      return error('scheduledDate must be in YYYY-MM-DD format');
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(scheduledTime)) {
      return error('scheduledTime must be in HH:MM format');
    }

    // Validate pincode (6 digits for India)
    if (!/^\d{6}$/.test(pincode)) {
      return error('pincode must be a 6-digit number');
    }

    const supabase = createSupabaseClient(context.env);

    // Look up the service to get basePrice and providerId
    const { data: service, error: svcError } = await supabase
      .from('Service')
      .select('id,providerId,basePrice,title,city')
      .eq('id', serviceId)
      .eq('isActive', true)
      .eq('approvalStatus', 'APPROVED')
      .maybeSingle();

    if (svcError) {
      console.error('Lookup service error:', svcError);
      return error('Failed to verify service', 500);
    }

    if (!service) {
      return error('Service not found or not available', 404);
    }

    const serviceData = service as Record<string, unknown>;
    const basePrice = Number(serviceData.basePrice);
    const providerId = String(serviceData.providerId);

    // Validate price
    if (!validatePrice(basePrice)) {
      return error('Service price is outside the allowed range (₹199-₹499)');
    }

    // Prevent client from booking their own service (if they're also a provider)
    if (user.userId === providerId) {
      return error('You cannot book your own service');
    }

    // Check that the scheduled date is not in the past
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime < new Date()) {
      return error('Scheduled date and time cannot be in the past');
    }

    const bookingId = generateId();
    const bookingNumber = generateBookingNumber();
    const serviceAddress = [address, city, pincode].filter(Boolean).join(', ');
    const platformFee = 5.0;
    const finalPrice = basePrice;
    const providerEarnings = basePrice - platformFee;
    const now = new Date().toISOString();

    // Insert the booking
    const { error: insertError } = await supabase
      .from('Booking')
      .insert({
        id: bookingId,
        bookingNumber,
        clientId: user.userId,
        providerId,
        serviceId,
        status: 'PENDING',
        scheduledDate,
        scheduledTime,
        serviceAddress,
        basePrice,
        finalPrice,
        platformFee,
        providerEarnings,
        specialInstructions: notes,
        paymentStatus: 'PENDING',
        createdAt: now,
        updatedAt: now,
      });

    if (insertError) {
      console.error('Create booking error:', insertError);
      return error('Failed to create booking', 500);
    }

    // Create notification for the provider
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await supabase
      .from('Notification')
      .insert({
        id: notifId,
        userId: providerId,
        type: 'BOOKING',
        title: 'New Booking Request',
        message: `You have a new booking request for ${String(serviceData.title)}`,
        actionUrl: `/bookings/${bookingId}`,
        createdAt: now,
      });

    // Fetch the created booking with service info
    const { data: booking, error: fetchError } = await supabase
      .from('Booking')
      .select('*,service:Service!Booking_serviceId_fkey(title)')
      .eq('id', bookingId)
      .maybeSingle();

    if (fetchError) {
      console.error('Fetch created booking error:', fetchError);
    }

    // Flatten service info for backward compatibility
    const bookingData = (booking || {}) as Record<string, unknown>;
    const serviceInfo = (bookingData.service as Record<string, unknown>) || {};
    const flatBooking = {
      ...bookingData,
      serviceTitle: serviceInfo.title ?? null,
      service: undefined,
    };

    return json({ booking: flatBooking }, 201);
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Create booking error:', err);
    return error('Failed to create booking', 500);
  }
}
