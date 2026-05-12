import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Record<string, unknown> = {
      isActive: true,
      isApproved: true,
    };

    if (category) {
      where.categoryId = parseInt(category);
    }

    if (subcategory) {
      where.subcategoryId = parseInt(subcategory);
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      where.basePrice = priceFilter;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              profileImageUrl: true,
            },
          },
          category: { select: { id: true, name: true, slug: true } },
          subcategory: subcategory
            ? { select: { id: true, name: true, slug: true } }
            : false,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.service.count({ where }),
    ]);

    // Filter by distance if lat/lng/radius provided
    let filteredServices = services;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = radius ? parseFloat(radius) : 50;

      filteredServices = services.filter((service) => {
        if (!service.latitude || !service.longitude) return true;
        const distance = haversineDistance(
          userLat,
          userLng,
          service.latitude,
          service.longitude
        );
        return distance <= maxRadius;
      });

      // Add distance to results
      filteredServices = filteredServices.map((service) => ({
        ...service,
        distanceKm:
          service.latitude && service.longitude
            ? Math.round(
                haversineDistance(
                  userLat,
                  userLng,
                  service.latitude,
                  service.longitude
                ) * 10
              ) / 10
            : null,
      }));
    }

    return NextResponse.json({
      services: filteredServices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (user.role !== 'PROVIDER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only providers can create services' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      basePrice,
      categoryId,
      subcategoryId,
      priceNegotiable,
      serviceDurationMinutes,
      serviceAreaRadiusKm,
      latitude,
      longitude,
      address,
      city,
      state,
      country,
      pincode,
      images,
    } = body;

    if (!title || !description || !basePrice || !categoryId) {
      return NextResponse.json(
        { error: 'Title, description, base price, and category are required' },
        { status: 400 }
      );
    }

    const service = await db.service.create({
      data: {
        providerId: user.userId,
        title,
        description,
        basePrice: parseFloat(basePrice),
        categoryId: parseInt(categoryId),
        subcategoryId: subcategoryId ? parseInt(subcategoryId) : null,
        priceNegotiable: priceNegotiable || false,
        serviceDurationMinutes: serviceDurationMinutes || null,
        serviceAreaRadiusKm: serviceAreaRadiusKm || 10,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address,
        city,
        state,
        country,
        pincode,
        images: images ? JSON.stringify(images) : null,
        isActive: false,
        isApproved: false,
        approvalStatus: 'PENDING',
      },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
