import { Hono } from 'hono'
import { query } from '../../shared/db.ts'
import { getCurrentUser } from '../../shared/auth.ts'

const app = new Hono()

app.get('/', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const result = await query('SELECT id, "userId", balance, currency, pending, "createdAt", "updatedAt" FROM "Wallet" WHERE "userId" = $1', [user.id])
    let wallet = result.rows[0]
    if (!wallet) {
      const insert = await query('INSERT INTO "Wallet" ("userId", balance, pending, currency, "createdAt", "updatedAt") VALUES ($1, 0, 0, $2, now(), now()) RETURNING id, "userId", balance, currency, pending, "createdAt", "updatedAt"', [user.id, 'INR'])
      wallet = insert.rows[0]
    }
    return c.json({ success: true, data: wallet })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to load wallet' }, 500)
  }
})

app.post('/adjust', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const { amount, type } = await c.req.json()
    if (typeof amount !== 'number' || !['credit', 'debit'].includes(type)) {
      return c.json({ error: 'Invalid adjustment payload' }, 400)
    }

    const existing = await query('SELECT id, balance, pending FROM "Wallet" WHERE "userId" = $1', [user.id])
    let wallet = existing.rows[0]
    if (!wallet) {
      const insert = await query('INSERT INTO "Wallet" ("userId", balance, pending, currency, "createdAt", "updatedAt") VALUES ($1, 0, 0, $2, now(), now()) RETURNING id, balance, pending', [user.id, 'INR'])
      wallet = insert.rows[0]
    }

    let newBalance = wallet.balance
    if (type === 'credit') {
      newBalance += amount
    } else {
      if (wallet.balance - amount < 0) return c.json({ error: 'Insufficient wallet balance' }, 400)
      newBalance -= amount
    }

    await query('UPDATE "Wallet" SET balance = $1, "updatedAt" = now() WHERE id = $2', [newBalance, wallet.id])
    return c.json({ success: true, data: { id: wallet.id, balance: newBalance } })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Unable to update wallet' }, 500)
  }
})

export default app
