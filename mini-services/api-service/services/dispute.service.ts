// ─── services/dispute.service.ts ──────────────────────────────────────
// Pure business logic extracted from routes/booking.routes.ts (disputes section)
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── List Disputes ────────────────────────────────────────────────────

export async function listDisputes(userId: string, limit: number, offset: number): Promise<{
  disputes: any[]; total: number; limit: number; offset: number
}> {
  const result = await pool.query('SELECT d.*, b."bookingNumber" FROM "Dispute" d LEFT JOIN "Booking" b ON d."bookingId" = b.id WHERE d."raisedBy" = $1 OR d."assignedTo" = $1 ORDER BY d."createdAt" DESC LIMIT $2 OFFSET $3', [userId, limit, offset]).catch(() => ({ rows: [] }))
  return { disputes: result.rows, total: result.rows.length, limit, offset }
}

// ─── Create Dispute ───────────────────────────────────────────────────

export async function createDispute(userId: string, data: { bookingId: string; assignedTo?: string; disputeType: string; description: string; evidence?: any }): Promise<{
  success: true; dispute: { id: string; status: string; disputeType: string }
} | { success: false; error: string; status: number }> {
  const { bookingId, assignedTo, disputeType, description, evidence } = data
  if (!bookingId || !disputeType || !description) return { success: false, error: 'bookingId, disputeType, and description are required', status: 400 }
  const id = 'dsp_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "Dispute" (id, "bookingId", "raisedBy", "assignedTo", "disputeType", description, evidence, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, \'OPEN\', NOW(), NOW())', [id, bookingId, userId, assignedTo || null, disputeType || 'OTHER', description, evidence || null])
  return { success: true, dispute: { id, status: 'OPEN', disputeType } }
}

// ─── Update Dispute ───────────────────────────────────────────────────

export async function updateDispute(disputeId: string, userId: string, roleId: number, fields: { status?: string; resolution?: string; adminNotes?: string }): Promise<{
  success: true
} | { success: false; error: string; status: number }> {
  const disputeCheck = await pool.query('SELECT "raisedBy", "assignedTo" FROM "Dispute" WHERE id = $1', [disputeId])
  if (disputeCheck.rows.length === 0) return { success: false, error: 'Dispute not found', status: 404 }
  if (disputeCheck.rows[0].raisedBy !== userId && disputeCheck.rows[0].assignedTo !== userId && roleId !== 1 && roleId !== 3 && roleId !== 7) return { success: false, error: 'Not authorized', status: 403 }
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  for (const f of ['status', 'resolution', 'adminNotes'] as const) {
    if (fields[f] !== undefined) { updates.push(`"${f}" = $${idx}`); values.push(fields[f]); idx++ }
  }
  if (updates.length === 0) return { success: false, error: 'No fields', status: 400 }
  updates.push('"updatedAt" = NOW()')
  values.push(disputeId)
  await pool.query(`UPDATE "Dispute" SET ${updates.join(', ')} WHERE id = $${idx}`, values)
  return { success: true }
}
