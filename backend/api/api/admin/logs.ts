/**
 * GET /api/admin/logs - Audit logs
 * Requires ADMIN role
 * Returns recent activity logs
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

interface EventContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  if (!requireRole(user, 'ADMIN')) {
    return forbidden('Admin access required');
  }

  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
  const action = url.searchParams.get('action');
  const targetType = url.searchParams.get('targetType');
  const adminId = url.searchParams.get('adminId');

  const supabase = createSupabaseClient(context.env);

  // Build count query
  let countQuery = supabase.from('AdminLog').select('id', { count: 'exact' });

  // Build data query
  let dataQuery = supabase
    .from('AdminLog')
    .select('id, action, targetType, targetId, details, ipAddress, userAgent, createdAt, adminId')
    .order('createdAt', { ascending: false })
    .range((page - 1) * limit, (page - 1) * limit + limit - 1);

  if (action) {
    const sanitizedAction = sanitizeString(action);
    countQuery = countQuery.eq('action', sanitizedAction);
    dataQuery = dataQuery.eq('action', sanitizedAction);
  }

  if (targetType) {
    const sanitizedTargetType = sanitizeString(targetType);
    countQuery = countQuery.eq('targetType', sanitizedTargetType);
    dataQuery = dataQuery.eq('targetType', sanitizedTargetType);
  }

  if (adminId) {
    const sanitizedAdminId = sanitizeString(adminId);
    countQuery = countQuery.eq('adminId', sanitizedAdminId);
    dataQuery = dataQuery.eq('adminId', sanitizedAdminId);
  }

  // Execute queries in parallel
  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

  const total = countResult.count ?? 0;
  const logs = dataResult.data ?? [];

  // Enrich logs with admin user info
  const adminIds = [...new Set(logs.map((l: Record<string, unknown>) => String(l.adminId)))];
  let adminMap = new Map<string, Record<string, unknown>>();

  if (adminIds.length > 0) {
    const { data: adminUsers } = await supabase
      .from('User')
      .select('id, name, email')
      .in('id', adminIds);
    adminMap = new Map(
      (adminUsers ?? []).map((u: Record<string, unknown>) => [String(u.id), u])
    );
  }

  const enrichedLogs = logs.map((l: Record<string, unknown>) => {
    const admin = adminMap.get(String(l.adminId)) as Record<string, unknown> | undefined;
    return {
      ...l,
      adminName: admin?.name ?? null,
      adminEmail: admin?.email ?? null,
    };
  });

  // Fetch available action types for filtering
  const { data: allLogs } = await supabase
    .from('AdminLog')
    .select('action');

  const actionTypes = [...new Set((allLogs ?? []).map((l: Record<string, unknown>) => String(l.action)))].sort();

  // Fetch available target types for filtering
  const { data: allLogTypes } = await supabase
    .from('AdminLog')
    .select('targetType');

  const targetTypes = [...new Set(
    (allLogTypes ?? [])
      .map((l: Record<string, unknown>) => l.targetType)
      .filter((t): t is string => t != null)
  )].sort();

  return json({
    logs: enrichedLogs,
    filters: {
      actionTypes,
      targetTypes,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
