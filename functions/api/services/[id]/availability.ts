import { query } from '../../../_shared/db';
import { json, error } from '../../../_shared/response';
import { Env } from '../../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { id } = context.params;

    const availability = await query(context.env.DB,
      'SELECT * FROM ServiceAvailability WHERE serviceId = ? ORDER BY dayOfWeek, startTime',
      [id]
    );

    const formatted = availability.map((a: any) => ({
      id: a.id,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
      isAvailable: a.isAvailable,
      maxBookingsPerSlot: a.maxBookingsPerSlot,
    }));

    return json({ availability: formatted });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
