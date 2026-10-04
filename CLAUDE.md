# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PantauKelas is a lightweight, mobile-first administrative workspace designed for madrasah/pesantren educators and homeroom teachers (*Wali Kelas*). It consolidates student attendance, dynamic grade sheets, Tahfidz/hafalan progress, and anecdotal behavioral logs into a single responsive interface.

## Commands

All development commands should be executed from within the `pantau-kelas/` directory:

- **Start dev server**: `npm run dev` (runs on `http://localhost:3000`)
- **Production build**: `npm run build`
- **Run production server**: `npm run start`
- **Lint code**: `npm run lint`
- **Single test / test suite**: No test framework is currently installed; verify changes via `npm run build` or `npm run lint`.

## Architecture & Code Structure

### 1. Dual-Role Class Context
- The app operates around two primary contexts:
  - **Wali Kelas (Homeroom)**: Full administrative access (attendance, full student 360 profile, hafalan tracking, anecdotal logs).
  - **Guru Mapel (Subject Teacher)**: Scoped access for grading and attendance of specific subjects in assigned classes.
- Context switching is handled via `ClassSwitcher` (`src/components/class-switcher.tsx`) and consumed via render prop in `AppShell` (`src/components/app-shell.tsx`).

### 2. State & Data Layer
- **Mock Data**: Located in `src/lib/mock-data.ts`, providing typed mock structures for `SchoolClass`, `Student`, `Assessment`, `Grade`, and `AttendanceRecord`.
- **Planned Backend**: Supabase (PostgreSQL tables: `classes`, `students`, `subjects`, `assessments`, `grades`, `attendance`, `anecdotal_notes`) with Row Level Security (RLS) and Supabase Auth.
- **Excel Import/Export**: Handled client-side via `xlsx` (SheetJS) for bulk grading templates.

### 3. Component Architecture & UI
- **Framework**: Next.js 16 (App Router, React 19, TypeScript).
- **Styling**: Tailwind CSS v4 with custom semantic color tokens defined in `src/app/globals.css` (primary emerald `#0F766E`, attendance statuses: hadir `#10B981`, sakit/izin `#F59E0B`, alfa `#EF4444`, tahfidz `#6366F1`).
- **UI Components**: Located in `src/components/ui/` built with `@base-ui/react` and shadcn conventions. Path aliases are configured as `@/*` pointing to `src/*`.
- **Layout**: `AppShell` provides a desktop left sidebar and mobile bottom navigation bar with responsive breakpoints.
- **Numbers & Scores**: Use `tabular-nums` class (JetBrains Mono / monospace alignment) for numeric scores, NISN, and attendance percentages.
