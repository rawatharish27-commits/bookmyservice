# Task 4: WebSocket Stats Service

**Status**: COMPLETED

## What was done
- Created `/home/z/my-project/mini-services/stats-service/` directory as independent bun project
- Created `package.json` with `socket.io` dependency and `bun --hot index.ts` dev script
- Created `index.ts` with Socket.io server on port 3003

## Key Implementation Details

### Database Access
- Used `bun:sqlite` (Bun's built-in SQLite) instead of `better-sqlite3` because Bun does not support native C++ addons like `better-sqlite3` (see https://github.com/oven-sh/bun/issues/4290)
- Database path: `/home/z/my-project/db/custom.db` (opened in readonly mode)
- 5 prepared statements for stats queries

### Stats Broadcast
- Every 5 seconds, emits `stats:update` event with: `activeVisitors`, `totalVisitors`, `totalUsers`, `totalProviders`, `totalServices`, `totalBookings`, `timestamp`
- On client connect: emits `visitor:join` to all + sends immediate `stats:update` to new client
- On client disconnect: emits `visitor:leave` to all with updated count

### Events
- `stats:update` - every 5 seconds with full stats object
- `visitor:join` - on connect, broadcasts `{ activeVisitors }` to all
- `visitor:leave` - on disconnect, broadcasts `{ activeVisitors }` to all

### CORS & Path
- CORS: `origin: "*"` for development
- Path: `/` (required by Caddy gateway for proper routing)
- Frontend connects via: `io("/?XTransformPort=3003")`

### Service Status
- Running on port 3003 with `bun --hot index.ts`
- Auto-restart on file changes enabled
- Graceful shutdown on SIGTERM/SIGINT

### Database Queries
```sql
SELECT COUNT(*) as count FROM User WHERE roleId = (SELECT id FROM Role WHERE name = 'CLIENT')
SELECT COUNT(*) as count FROM User WHERE roleId = (SELECT id FROM Role WHERE name = 'PROVIDER')
SELECT COUNT(*) as count FROM Service WHERE isActive = 1 AND isApproved = 1
SELECT COUNT(*) as count FROM Booking
SELECT COUNT(*) as count FROM VisitorSession
```
