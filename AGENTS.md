# AGENTS.md

## Build Commands

- `pnpm dev` - Start dev server (Turbopack)
- `pnpm build` - Production build
- `pnpm lint` - Run ESLint
- No test framework configured

## Code Style

- **TypeScript strict mode** with `@/*` path aliases (e.g., `@/components/ui/button`)
- **Imports:** External packages first, then `@/` aliases, then relative imports
- **Formatting:** 2-space indent, double quotes, semicolons, trailing commas
- **Components:** PascalCase names, kebab-case files (e.g., `BillTracker` in `bill-tracker.tsx`)
- **Functions/hooks:** camelCase (e.g., `useAnimatedNumber`, `formatCurrency`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `CURRENCIES`)

## Framework Patterns

- **Next.js 15 App Router** with React 19
- Add `"use client"` directive for client components, `"use server"` for server actions
- **shadcn/ui** components in `components/ui/` - use `cn()` from `@/lib/utils` for class merging
- **Tailwind CSS v4** for styling with dark mode via `dark:` prefix
- **Upstash Redis** for data persistence

## Error Handling

- Use try/catch in API routes with `console.error` for logging
- Return `NextResponse.json()` with appropriate status codes
- Use `notFound()` from `next/navigation` for 404 cases
