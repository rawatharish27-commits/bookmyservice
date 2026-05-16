# Task 4: Make Next.js page.tsx redirect to / show the Vite frontend

## Status: COMPLETED

## Problem
The sandbox preview panel shows the Next.js app on port 3000, but the actual BYS app is a Vite + React frontend running on port 5173, served through the Caddy gateway on port 81. Users seeing the Next.js page got a static "Loading..." message with no way to access the real app.

## Solution
Replaced `src/app/page.tsx` with a client component that embeds the Vite frontend in a full-page iframe, pointing to the Caddy gateway URL (`${protocol}//${hostname}:81`), with a branded loading overlay and fallback links.

## Changes Made

### src/app/page.tsx (replaced entirely)
- Changed from a static server component to a `'use client'` component
- Added branded loading overlay with:
  - "BookYourService" gradient title
  - "Loading your hyperlocal service marketplace..." message
  - Animated spinner
- Full-page `<iframe>` pointing to Caddy gateway (port 81) which proxies to Vite (port 5173)
- `onLoad` handler hides the loading overlay once the iframe content is ready
- Fallback UI appears after 6 seconds if iframe hasn't loaded:
  - Link to Caddy gateway (`hostname:81`)
  - Link to direct Vite frontend (`hostname:5173`)
- Iframe URL is constructed dynamically from `window.location.protocol` + `window.location.hostname` + `:81`

### src/app/layout.tsx (minor update)
- Added `m-0 p-0 overflow-hidden` to `<body>` class to prevent scrollbars/padding from interfering with the full-page iframe

## Architecture Notes
- **Caddy gateway (port 81)**: Routes `/api/*` → Hono API (port 3001), everything else → Vite (port 5173)
- **Next.js (port 3000)**: Now serves as a thin wrapper that embeds the Vite app via iframe
- **Iframe approach chosen** over redirect because:
  - Keeps the URL stable (user stays on port 3000)
  - Preview panel continues to work correctly
  - Fallback links are visible if the iframe can't load
  - No cross-origin issues for the main app functionality (Caddy handles API routing)

## Verification
- Caddy gateway confirmed accessible on `localhost:81` (returns Vite app HTML)
- No TypeScript errors in the updated page.tsx
- Dev services architecture intact (API 3001, Vite 5173, Next.js 3000, Caddy 81)
