/**
 * Role-Based Access Control (RBAC) system
 * Provides fine-grained permission checking beyond simple role matching
 */

// Permission definitions
export enum Permission {
  // Booking permissions
  BOOKING_CREATE = 'booking:create',
  BOOKING_READ_OWN = 'booking:read:own',
  BOOKING_READ_ANY = 'booking:read:any',
  BOOKING_UPDATE_OWN = 'booking:update:own',
  BOOKING_UPDATE_ANY = 'booking:update:any',
  BOOKING_CANCEL_OWN = 'booking:cancel:own',
  BOOKING_CANCEL_ANY = 'booking:cancel:any',
  
  // Service permissions
  SERVICE_CREATE = 'service:create',
  SERVICE_READ = 'service:read',
  SERVICE_UPDATE_OWN = 'service:update:own',
  SERVICE_UPDATE_ANY = 'service:update:any',
  SERVICE_DELETE_OWN = 'service:delete:own',
  SERVICE_DELETE_ANY = 'service:delete:any',
  SERVICE_APPROVE = 'service:approve',
  
  // User permissions
  USER_READ_OWN = 'user:read:own',
  USER_READ_ANY = 'user:read:any',
  USER_UPDATE_OWN = 'user:update:own',
  USER_UPDATE_ANY = 'user:update:any',
  USER_DELETE = 'user:delete',
  
  // Admin permissions
  ADMIN_DASHBOARD = 'admin:dashboard',
  ADMIN_ANALYTICS = 'admin:analytics',
  ADMIN_REVENUE = 'admin:revenue',
  ADMIN_DISPUTE_MANAGE = 'admin:dispute:manage',
  ADMIN_PAYOUT_PROCESS = 'admin:payout:process',
  ADMIN_COUPON_MANAGE = 'admin:coupon:manage',
  ADMIN_BACKUP = 'admin:backup',
  ADMIN_SECRETS_VIEW = 'admin:secrets:view',
  
  // Payment permissions
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_READ_OWN = 'payment:read:own',
  PAYMENT_READ_ANY = 'payment:read:any',
  PAYMENT_CAPTURE = 'payment:capture',
  PAYMENT_REFUND = 'payment:refund',
  
  // Franchise permissions
  FRANCHISE_DASHBOARD = 'franchise:dashboard',
  FRANCHISE_MANAGE_VENDORS = 'franchise:manage:vendors',
  
  // Notification permissions
  NOTIFICATION_READ_OWN = 'notification:read:own',
  NOTIFICATION_SEND = 'notification:send',
}

// Role → Permission mapping
const ROLE_PERMISSIONS: Record<number, Set<Permission>> = {
  1: new Set([ // CLIENT
    Permission.BOOKING_CREATE, Permission.BOOKING_READ_OWN, Permission.BOOKING_CANCEL_OWN,
    Permission.SERVICE_READ, Permission.PAYMENT_CREATE, Permission.PAYMENT_READ_OWN,
    Permission.USER_READ_OWN, Permission.USER_UPDATE_OWN,
    Permission.NOTIFICATION_READ_OWN,
  ]),
  2: new Set([ // PROVIDER
    Permission.BOOKING_READ_OWN, Permission.BOOKING_UPDATE_OWN,
    Permission.SERVICE_CREATE, Permission.SERVICE_READ, Permission.SERVICE_UPDATE_OWN, Permission.SERVICE_DELETE_OWN,
    Permission.PAYMENT_READ_OWN,
    Permission.USER_READ_OWN, Permission.USER_UPDATE_OWN,
    Permission.NOTIFICATION_READ_OWN,
  ]),
  3: new Set([ // ADMIN — all permissions
    ...Object.values(Permission),
  ]),
  4: new Set([ // TECHNICIAN
    Permission.BOOKING_READ_OWN, Permission.BOOKING_UPDATE_OWN,
    Permission.SERVICE_READ,
    Permission.USER_READ_OWN, Permission.USER_UPDATE_OWN,
    Permission.NOTIFICATION_READ_OWN,
  ]),
  5: new Set([ // VENDOR
    Permission.BOOKING_READ_OWN, Permission.BOOKING_UPDATE_OWN,
    Permission.SERVICE_CREATE, Permission.SERVICE_READ, Permission.SERVICE_UPDATE_OWN, Permission.SERVICE_DELETE_OWN,
    Permission.PAYMENT_READ_OWN,
    Permission.USER_READ_OWN, Permission.USER_UPDATE_OWN,
    Permission.NOTIFICATION_READ_OWN,
  ]),
  6: new Set([ // FRANCHISE
    Permission.BOOKING_READ_OWN,
    Permission.SERVICE_READ,
    Permission.USER_READ_OWN, Permission.USER_UPDATE_OWN,
    Permission.FRANCHISE_DASHBOARD, Permission.FRANCHISE_MANAGE_VENDORS,
    Permission.NOTIFICATION_READ_OWN,
  ]),
  7: new Set([ // SUB_ADMIN — same as ADMIN
    ...Object.values(Permission),
  ]),
  8: new Set([ // AREA_MANAGER
    Permission.BOOKING_READ_OWN,
    Permission.SERVICE_READ,
    Permission.USER_READ_OWN, Permission.USER_UPDATE_OWN,
    Permission.NOTIFICATION_READ_OWN,
  ]),
  9: new Set([ // MANAGER
    Permission.BOOKING_READ_OWN, Permission.BOOKING_UPDATE_OWN,
    Permission.SERVICE_READ,
    Permission.USER_READ_OWN, Permission.USER_UPDATE_OWN,
    Permission.NOTIFICATION_READ_OWN,
  ]),
  10: new Set([ // LOCAL_ADMIN
    Permission.BOOKING_READ_OWN,
    Permission.SERVICE_READ,
    Permission.USER_READ_OWN, Permission.USER_UPDATE_OWN,
    Permission.NOTIFICATION_READ_OWN,
  ]),
}

export function hasPermission(roleId: number, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[roleId]
  return perms ? perms.has(permission) : false
}

export function checkPermission(roleId: number, permission: Permission): void {
  if (!hasPermission(roleId, permission)) {
    throw new PermissionDeniedError(roleId, permission)
  }
}

export function getRolePermissions(roleId: number): Permission[] {
  return Array.from(ROLE_PERMISSIONS[roleId] || [])
}

export class PermissionDeniedError extends Error {
  constructor(roleId: number, permission: Permission) {
    super(`Role ${roleId} does not have permission: ${permission}`)
    this.name = 'PermissionDeniedError'
  }
}
