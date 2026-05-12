import { queryOne, execute, query } from '../../../_shared/db';
import { requireAuth } from '../../../_shared/auth';
import { json, error } from '../../../_shared/response';
import { Env } from '../../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const { disputeId } = context.params;

    const dispute = await queryOne(context.env.DB, `
      SELECT d.*, b.bookingNumber, b.status as bookingStatus, b.finalPrice,
             ru.name as raiserName, ru.email as raiserEmail,
             au.name as assigneeName
      FROM Dispute d
      JOIN Booking b ON d.bookingId = b.id
      JOIN User ru ON d.raisedBy = ru.id
      LEFT JOIN User au ON d.assignedTo = au.id
      WHERE d.id = ?
    `, [disputeId]);

    if (!dispute) return error('Dispute not found', 404);

    const messages = await query(context.env.DB, `
      SELECT dm.*, u.name as senderName
      FROM DisputeMessage dm
      JOIN User u ON dm.senderId = u.id
      WHERE dm.disputeId = ?
      ORDER BY dm.createdAt
    `, [disputeId]);

    return json({ dispute, messages });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'ADMIN') return error('Admin access required', 403);

    const { disputeId } = context.params;
    const body = await context.request.json() as {
      status?: string; resolution?: string; assignedTo?: string;
    };

    const dispute = await queryOne(context.env.DB, 'SELECT id FROM Dispute WHERE id = ?', [disputeId]);
    if (!dispute) return error('Dispute not found', 404);

    const updates: string[] = [];
    const values: any[] = [];

    if (body.status) {
      updates.push('status = ?');
      values.push(body.status.toUpperCase());
    }
    if (body.resolution) {
      updates.push('resolution = ?');
      values.push(body.resolution);
      if (body.status === 'RESOLVED' || body.status === 'CLOSED') {
        updates.push('resolvedAt = datetime("now")');
      }
    }
    if (body.assignedTo) {
      updates.push('assignedTo = ?');
      values.push(body.assignedTo);
    }

    if (updates.length === 0) return error('No valid fields to update', 400);

    updates.push('updatedAt = datetime("now")');
    values.push(disputeId);

    await execute(context.env.DB, `UPDATE Dispute SET ${updates.join(', ')} WHERE id = ?`, values);

    return json({ message: 'Dispute updated successfully' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
