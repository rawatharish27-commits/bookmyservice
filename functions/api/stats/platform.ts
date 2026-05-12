import { queryOne } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const stats = await queryOne(context.env.DB,
      'SELECT totalVisitors, totalUsers, totalProviders, totalBookings, totalServices, activeVisitors, updatedAt FROM PlatformStats ORDER BY id DESC LIMIT 1'
    );

    if (!stats) {
      return json({
        stats: {
          totalVisitors: 0,
          totalUsers: 0,
          totalProviders: 0,
          totalBookings: 0,
          totalServices: 0,
          activeVisitors: 0,
        },
      });
    }

    return json({
      stats: {
        totalVisitors: stats.totalVisitors,
        totalUsers: stats.totalUsers,
        totalProviders: stats.totalProviders,
        totalBookings: stats.totalBookings,
        totalServices: stats.totalServices,
        activeVisitors: stats.activeVisitors,
        updatedAt: stats.updatedAt,
      },
    });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
