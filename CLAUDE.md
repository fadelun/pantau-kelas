# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Commands

```bash
npm run dev       # Start Next.js development server at http://localhost:3000
npm run build     # Create a production build and type-check the app
npm run start     # Serve the production build
npm run lint      # Run ESLint
```

No test runner is configured. Verify changes with `npm run lint` and `npm run build`; there is no single-test command. `npm run dev` requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, or every page redirects to `/login`.

## Application architecture

PantauKelas is a mobile-first administrative workspace for madrasah/pesantren educators. Next.js 16.3.8 App Router, React 19, TypeScript, Tailwind CSS v4, Base UI/shadcn-style components, TanStack Table, SheetJS (`xlsx`), and Supabase (`@supabase/ssr`). Before Next.js-specific changes, read the generated `AGENTS.md` and relevant docs under `node_modules/next/dist/docs/` — this version has breaking changes.

### Routing and shell

- `src/app/page.tsx` — dashboard. `src/app/presensi/page.tsx` — daily attendance; `src/app/presensi/rekap/page.tsx` — period recap. `src/app/buku-nilai/page.tsx` — dynamic grade sheet. `src/app/buku-santri/` — Student 360 profile (list + `[id]` detail). `src/app/data-master/page.tsx` — CRUD UI for classes, students, subjects (still mock-backed).
- `src/app/login/page.tsx` and `src/app/auth/callback/route.ts` handle Supabase Auth (Google OAuth / magic link).
- `src/proxy.ts` (root `src/`, **not** `middleware.ts` — Next 16 renamed it) delegates to `src/lib/supabase/proxy.ts`, which refreshes sessions via `auth.getClaims()` and redirects unauthenticated users to `/login` (except `/login` and `/auth/callback`).
- `src/components/app-shell.tsx` owns the desktop sidebar / mobile bottom nav and the active-class state. Pages render inside it through a render-prop `children` function.
- `src/components/class-switcher.tsx` defines `ClassContext`, `getClassContext`, and display formatting for the two roles: `Wali Kelas` (full class administration) and `Guru Mapel` (subject-scoped grading/attendance).

### Data layer — currently split between mock and Supabase

- `src/lib/mock-data.ts` still backs the grade sheet, attendance, and Student 360 UI.
- `src/lib/master-data.tsx` is a React context holding classes/students/subjects master data in session state (CRUD helpers: `getStudentsForSubject`, `getClassStudentCount`).
- `src/lib/supabase/` has three client factories: `client.ts` (browser, `createBrowserClient`), `server.ts` (RSC/server, cookie-based), and `proxy.ts` (`updateSession` used by `src/proxy.ts`). Always create a client per request — never module-level globals.
- `supabase/migrations/` holds applied schema: `0001_create_core_schema.sql` (tables `teachers`, `classes`, `students`, `subjects`, `class_subjects`, `assessments`, `grades`, `attendance`, `anecdotal_notes` with FKs/indices) and `0002_rls_and_auth.sql` (RLS scoping teachers to their own data). Remaining roadmap (tasks 13–15 in repo-level `checklist.md`): replace mock data in Presensi/Data Master, then grade sheet, then Student 360/anecdotal notes with Supabase queries. `checklist.md` is the source of truth for task order and verification criteria.
- `src/components/excel-import-dialog.tsx` parses Excel client-side with `xlsx`; keep file parsing in the browser.

### TanStack Table v9

Use the v9 API: `useTable` (not `useReactTable`), a required `features` object built with `tableFeatures({ coreRowModel: createCoreRowModel() })`, and `row.getAllCells()` (not `getVisibleCells()`). Do not copy v8 examples; inspect `node_modules/@tanstack/react-table/dist/` type definitions when unsure.

### UI conventions

- Shared primitives live in `src/components/ui/` on `@base-ui/react` with shadcn conventions. Use the `@/*` alias for `src/*` and `cn` from `src/lib/utils.ts`.
- Design tokens and status badge utilities are in `src/app/globals.css`; authoritative visual specs are in the repo-level `DESIGN.md`. Preserve the deep-teal primary, Plus Jakarta Sans headings/body, and JetBrains Mono for numerics.
- Use `tabular-nums` for scores, NISN, counts, and attendance percentages. Attendance badges use the semantic triplets, e.g. `bg-status-hadir-bg text-status-hadir-text border-status-hadir-border`.
- Mobile-first: student identity columns stay sticky while assessment columns scroll horizontally; keep the 48px row target and touch-friendly controls.

## Dependency notes

`package.json` contains accidental junk packages named `add`, `badge`, `button`, `card`, `cn`, `dialog`, `dropdown-menu`, `init`, `input`, `npx`, and `tabs` from mistyped shadcn commands. Never import from them or add more of this kind; use the local components in `src/components/ui/` and the intended dependencies.
