import { Hono } from 'hono'
import { query } from '../../shared/db.ts'
import { comparePassword, createAccessToken, hashPassword, type UserRecord } from '../../shared/auth.ts'

const app = new Hono()

// POST /api/auth/login
app.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    if (!email || !password) return c.json({ error: 'Email and password are required' }, 400)

    const result = await query<UserRecord & { passwordHash: string; roleName?: string }>(
      'SELECT u.id, u.email, u.phone, u.name, u."roleId", u.status, u."profileImageUrl", u.city, u.state, u.country, u."passwordHash", r.name AS "roleName" FROM "User" u JOIN "Role" r ON r.id = u."roleId" WHERE u.email = $1',
      [email]
    )
    const user = result.rows[0]
    if (!user) return c.json({ error: 'Invalid email or password' }, 401)

    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) return c.json({ error: 'Invalid email or password' }, 401)

    const token = await createAccessToken(user)
    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          roleId: user.roleId,
          role: user.roleName || 'CUSTOMER',
          status: user.status,
          profileImageUrl: user.profileImageUrl,
          city: user.city,
          state: user.state,
          country: user.country,
        },
      },
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// POST /api/auth/register
app.post('/register', async (c) => {
  try {
    const { email, password, name, phone, role = 'CUSTOMER' } = await c.req.json()
    if (!email || !password || !name || !phone) return c.json({ error: 'Name, email, phone, and password are required' }, 400)

    const normalizedRole = ['CUSTOMER', 'TECHNICIAN', 'VENDOR', 'FRANCHISE', 'ADMIN', 'SUB_ADMIN', 'AREA_MANAGER'].includes(role)
      ? role
      : 'CUSTOMER'

    const roleQuery = await query('SELECT id FROM "Role" WHERE name = $1 LIMIT 1', [normalizedRole])
    const roleId = roleQuery.rows[0]?.id
    if (!roleId) return c.json({ error: 'Invalid role selected' }, 400)

    const existing = await query('SELECT id FROM "User" WHERE email = $1 OR phone = $2', [email, phone])
    if (existing.rows.length > 0) return c.json({ error: 'User with this email or phone already exists' }, 409)

    const passwordHash = await hashPassword(password)
    const insert = await query<UserRecord>(
      'INSERT INTO "User" (email, phone, name, "passwordHash", "roleId", status, "emailVerified", "phoneVerified", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,true,true,now(),now()) RETURNING id, email, phone, name, "roleId", status, "profileImageUrl", city, state, country',
      [email, phone, name, passwordHash, roleId, 'ACTIVE']
    )
    const user = insert.rows[0]

    await query('INSERT INTO "Wallet" ("userId", balance, pending, currency, "createdAt", "updatedAt") VALUES ($1, 0, 0, $2, now(), now())', [user.id, 'INR'])

    const token = await createAccessToken(user)
    return c.json({ success: true, data: { token, user } })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Invalid request' }, 400)
  }
})

// POST /api/auth/logout
app.post('/logout', async (c) => {
  return c.json({ success: true, message: 'Logged out successfully' })
})

// POST /api/auth/forgot-password
app.post('/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email || typeof email !== 'string') return c.json({ error: 'Email is required' }, 400)
    return c.json({ success: true, message: 'Password reset instructions have been sent if the email exists.' })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Invalid request' }, 400)
  }
})

export default app
