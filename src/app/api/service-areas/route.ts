import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
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
    const city = searchParams.get('city');
    const pincode = searchParams.get('pincode');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // If city is provided, search by city
    if (city) {
      const whereClause: any = {
        city: { contains: city, mode: 'insensitive' },
      };

      // If pincode is also provided, add it to the filter
      if (pincode) {
        whereClause.pincode = pincode;
      }

      const serviceAreas = await db.serviceArea.findMany({
        where: whereClause,
        include: {
          areaManager: {
            select: {
              id: true,
              status: true,
              user: {
                select: { id: true, name: true, profileImageUrl: true },
              },
            },
          },
        },
      });

      // Add computed activation progress for each area
      const areasWithProgress = serviceAreas.map((area) => {
        const providerProgress = area.targetProviders > 0
          ? Math.round((area.providerCount / area.targetProviders) * 100)
          : 0;
        const customerProgress = area.targetCustomers > 0
          ? Math.round((area.customerCount / area.targetCustomers) * 100)
          : 0;
        const overallProgress = Math.round((providerProgress + customerProgress) / 2);

        return {
          ...area,
          providerProgress,
          customerProgress,
          overallProgress,
        };
      });

      return NextResponse.json(areasWithProgress);
    }

    // If lat/lng is provided, find nearest service areas
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Invalid latitude or longitude values' },
          { status: 400 }
        );
      }

      // Get all active service areas
      const allAreas = await db.serviceArea.findMany({
        where: { isActive: true },
        include: {
          areaManager: {
            select: {
              id: true,
              status: true,
              user: {
                select: { id: true, name: true, profileImageUrl: true },
              },
            },
          },
        },
      });

      // Calculate distance and filter by radius
      const nearbyAreas = allAreas
        .map((area) => {
          const distance =
            area.latitude && area.longitude
              ? calculateDistance(latitude, longitude, area.latitude, area.longitude)
              : null;

          const providerProgress = area.targetProviders > 0
            ? Math.round((area.providerCount / area.targetProviders) * 100)
            : 0;
          const customerProgress = area.targetCustomers > 0
            ? Math.round((area.customerCount / area.targetCustomers) * 100)
            : 0;
          const overallProgress = Math.round((providerProgress + customerProgress) / 2);

          return {
            ...area,
            distance,
            providerProgress,
            customerProgress,
            overallProgress,
          };
        })
        .filter((area) => area.distance !== null && area.distance <= (area.radiusKm || 20))
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

      return NextResponse.json(nearbyAreas);
    }

    // If no specific query, return all service areas
    const allServiceAreas = await db.serviceArea.findMany({
      include: {
        areaManager: {
          select: {
            id: true,
            status: true,
            user: {
              select: { id: true, name: true, profileImageUrl: true },
            },
          },
        },
      },
      orderBy: { city: 'asc' },
    });

    const areasWithProgress = allServiceAreas.map((area) => {
      const providerProgress = area.targetProviders > 0
        ? Math.round((area.providerCount / area.targetProviders) * 100)
        : 0;
      const customerProgress = area.targetCustomers > 0
        ? Math.round((area.customerCount / area.targetCustomers) * 100)
        : 0;
      const overallProgress = Math.round((providerProgress + customerProgress) / 2);

      return {
        ...area,
        providerProgress,
        customerProgress,
        overallProgress,
      };
    });

    return NextResponse.json(areasWithProgress);
  } catch (error) {
    console.error('Service areas fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
