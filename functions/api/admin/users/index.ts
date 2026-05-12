/**
 * GET /api/admin/users - List all users with pagination
 * Requires ADMIN role
 * Query: page, limit, role, status, search
 */

import { createSupabaseClient, Env } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden } from '../../../_shared/response';
import { sanitizeString } from '../../../_shared/security';

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
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const role = url.searchParams.get('role');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  const supabase = createSupabaseClient(context.env);

  // Resolve role to roleId if filtering by role
  let roleId: number | null = null;
  if (role) {
    const { data: roleData } = await supabase
      .from('Role')
      .select('id')
      .eq('name', sanitizeString(role))
      .maybeSingle();
    roleId = roleData ? Number((roleData as Record<string, unknown>).id) : null;
  }

  // For search, find matching user IDs first
  let searchUserIds: string[] | null = null;
  if (search) {
    const sanitizedSearch = sanitizeString(search);
    const searchPattern = `%${sanitizedSearch}%`;

    const [nameResults, emailResults, phoneResults] = await Promise.all([
      supabase.from('User').select('id').ilike('name', searchPattern),
      supabase.from('User').select('id').ilike('email', searchPattern),
      supabase.from('User').select('id').ilike('phone', searchPattern),
    ]);

    const idSet = new Set<string>();
    for (const u of (nameResults.data ?? [])) { idSet.add(String(u.id)); }
    for (const u of (emailResults.data ?? [])) { idSet.add(String(u.id)); }
    for (const u of (phoneResults.data ?? [])) { idSet.add(String(u.id)); }
    searchUserIds = [...idSet];

    if (searchUserIds.length === 0) {
      return json({
        users: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }
  }

  // Build count query
  let countQuery = supabase.from('User').select('id', { count: 'exact' });

  // Build data query
  let dataQuery = supabase
    .from('User')
    .select('id, email, phone, name, status, emailVerified, phoneVerified, profileImageUrl, city, state, createdAt, lastLoginAt, roleId')
    .order('createdAt', { ascending: false })
    .range((page - 1) * limit, (page - 1) * limit + limit - 1);

  if (roleId !== null) {
    countQuery = countQuery.eq('roleId', roleId);
    dataQuery = dataQuery.eq('roleId', roleId);
  } else if (role) {
    // Role was specified but not found — return empty
    return json({
      users: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }

  if (status) {
    const sanitizedStatus = sanitizeString(status);
    countQuery = countQuery.eq('status', sanitizedStatus);
    dataQuery = dataQuery.eq('status', sanitizedStatus);
  }

  if (searchUserIds !== null) {
    countQuery = countQuery.in('id', searchUserIds);
    dataQuery = dataQuery.in('id', searchUserIds);
  }

  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

  const total = countResult.count ?? 0;
  const users = (dataResult.data ?? []) as Record<string, unknown>[];

  // Enrich with role info
  const enrichedUsers = await enrichUsersWithRoles(supabase, users);

  return json({
    users: enrichedUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function enrichUsersWithRoles(
  supabase: ReturnType<typeof createSupabaseClient>,
  users: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> {
  if (users.length === 0) return [];

  const roleIds = [...new Set(users.map((u) => Number(u.roleId)))];

  const { data: roles } = await supabase
    .from('Role')
    .select('id, name')
    .in('id', roleIds);

  const roleMap = new Map(
    (roles ?? []).map((r: Record<string, unknown>) => [Number(r.id), r])
  );

  return users.map((u) => {
    const role = roleMap.get(Number(u.roleId)) as Record<string, unknown> | undefined;
    return {
      ...u,
      role: role?.name ?? null,
    };
  });
}
