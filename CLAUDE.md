# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Commands

Run commands from `frontend/`:

```bash
npm run dev       # Start Next.js development server at http://localhost:3000
npm run build     # Create a production build and type-check the app
npm run start     # Serve the production build
npm run lint      # Run ESLint
```

There is currently no test runner configured. Use `npm run lint` and `npm run build` as the verification checks for changes; there is no supported single-test command yet.

## Application architecture

PantauKelas is a mobile-first administrative workspace for madrasah/pesantren educators. It is a Next.js 16.3.8 App Router application using React 19, TypeScript, Tailwind CSS v4, Base UI/shadcn-style components, TanStack Table, and SheetJS (`xlsx`). Read the generated `AGENTS.md` and the relevant documentation under `node_modules/next/dist/docs/` before making Next.js-specific changes because this version has breaking changes.

### Routing and shell

- `src/app/page.tsx` is the dashboard.
- `src/app/presensi/page.tsx` is quick daily attendance; `src/app/presensi/rekap/page.tsx` is the period recap.
- `src/app/buku-nilai/page.tsx` is the dynamic grade sheet.
- `src/app/buku-santri/` contains the Student 360 profile UI.
- `src/components/app-shell.tsx` owns the responsive desktop sidebar/mobile bottom navigation and the active class state. Pages render inside it through a render-prop `children` function.
- `src/components/class-switcher.tsx` defines `ClassContext`, `getClassContext`, and display formatting for the two roles: `Wali Kelas` (full class administration) and `Guru Mapel` (subject-scoped grading/attendance).
- `/sinkronisasi` is linked by navigation but is not implemented yet.

### State and data

- `src/lib/mock-data.ts` is the current local data source and exports typed classes, students, assessments, grades, attendance records, and anecdotal notes. Backend persistence is not wired yet.
- `src/components/excel-import-dialog.tsx` handles client-side Excel preview/import behavior using `xlsx`; keep file parsing in the browser.
- The planned backend is Supabase/PostgreSQL with Auth and RLS. Planned entities include `teachers`, `classes`, `students`, `subjects`, `assessments`, `grades`, `attendance`, and `anecdotal_notes`.
- TanStack Table is version 9. Use its v9 API: `useTable`, a required `features` object created with `tableFeatures({ coreRowModel: createCoreRowModel() })`, and `row.getAllCells()`. Do not copy v8 examples using `useReactTable` or `getVisibleCells()`; inspect the installed type definitions when needed.

### UI conventions

- Shared UI primitives live in `src/components/ui/` and use `@base-ui/react` with shadcn conventions. Use the `@/*` alias for `src/*` imports and `cn` from `src/lib/utils.ts` for conditional classes.
- Design tokens and status badge utilities are defined in `src/app/globals.css`; the authoritative visual specifications are in the repository-level `DESIGN.md`. Preserve the deep-teal primary palette, Plus Jakarta Sans headings/body font, and JetBrains Mono for numeric values.
- Use `tabular-nums` for scores, NISN values, counts, and attendance percentages. Attendance badges use the semantic background/text/border triplets such as `bg-status-hadir-bg text-status-hadir-text border-status-hadir-border`.
- Keep tables usable on small screens: student identity columns stay sticky while assessment columns scroll horizontally. Follow the existing 48px table-row target and touch-friendly controls.

## Dependency notes

`package.json` contains accidental packages named `add`, `badge`, `button`, `card`, `cn`, `dialog`, `dropdown-menu`, `init`, `input`, and `npx` from mistyped shadcn commands. Do not import from them or add more of this kind; use the existing local UI components and installed intended dependencies.

## Current project status

The frontend UI roadmap tasks through Student 360 and Excel import are complete. Supabase schema, authentication/RLS, and API integration remain future work. The repository-level `checklist.md` is the source of truth for task order and verification criteria.
