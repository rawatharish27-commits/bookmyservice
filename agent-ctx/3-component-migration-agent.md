# Task 3: Component Migration Agent — Fix Next.js imports for Vite compatibility

## Summary
Migrated all component files from Next.js-specific patterns to Vite-compatible code.

## Changes Made

### 1. Removed 'use client' directives (83 files)
- All files in `src/components/ui/` (39 files)
- All files in `src/components/bys/` (30+ files)
- `src/contexts/app-context.tsx`, `src/contexts/auth-context.tsx`
- `src/hooks/use-api.ts`, `src/hooks/use-toast.ts`
- These are Next.js directives not needed in Vite

### 2. Fixed Next.js imports
- **`src/lib/middleware.ts`**: Replaced `import { NextRequest } from 'next/server'` with standard `Request` type. The `Request` type has the same `.headers.get()` API.
- **`src/components/ui/sonner.tsx`**: Replaced `import { useTheme } from "next-themes"` with native `window.matchMedia('(prefers-color-scheme: dark)')` for system theme detection.

### 3. Verified no other Next.js patterns remain
- No `next/image` imports (already using native `<img>`)
- No `next/link` imports (already using native `<a>`)
- No `next/navigation` imports (already using `useApp().navigate()`)
- No `next/router` imports
- auth-context.tsx uses only standard `fetch()`
- All remaining 'next' string references are benign (UI text, variable names, comments)

### 4. Build Verification
- `bun run build` succeeds in ~930ms
- Output: proper chunking (vendor, ui, charts, index)
- PWA service worker generated correctly
- 7 pre-existing lint errors unrelated to this migration
