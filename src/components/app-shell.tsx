"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  type ClassContext,
  ClassSwitcher,
  formatClassContext,
  getClassContext,
} from "@/components/class-switcher";
import { cn } from "@/lib/utils";

const navigation: { label: string; href: string; heading?: string; icon: typeof LayoutDashboard }[] = [
  { label: "Dashboard", href: "/", heading: "Ringkasan kelas", icon: LayoutDashboard },
  { label: "Presensi", href: "/presensi", icon: ClipboardCheck },
  { label: "Buku Nilai", href: "/buku-nilai", icon: BookOpen },
  { label: "Buku Santri", href: "/buku-santri", icon: UsersRound },
  { label: "Sinkronisasi", href: "/sinkronisasi", icon: RefreshCw },
];

type AppShellProps = {
  children: (context: ClassContext) => ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [activeClassId, setActiveClassId] = useState("class-9a");
  const pathname = usePathname();
  const activeNavigation =
    navigation.find((item) => item.href === pathname) ??
    navigation.find((item) => item.href !== "/" && pathname.startsWith(`${item.href}/`)) ??
    navigation[0];
  const context = getClassContext(activeClassId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <span className="font-mono text-sm font-bold">PK</span>
          </div>
          <div>
            <p className="font-heading text-base font-bold tracking-tight text-primary">PantauKelas</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Ruang kerja guru</p>
          </div>
        </div>

        <div className="border-b border-border px-4 py-5">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Navigasi utama</p>
          <nav className="mt-3 space-y-1" aria-label="Navigasi utama">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavigation.href === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                  {item.label}
                  {isActive && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <UserRound className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">Ust. Ahmad Fauzi</p>
              <p className="truncate text-[11px] text-muted-foreground">Wali kelas</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 py-3 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Buka menu">
                <Menu className="size-5" aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{activeNavigation.label}</p>
                <h1 className="truncate font-heading text-lg font-bold tracking-tight sm:text-xl">{activeNavigation.heading ?? activeNavigation.label}</h1>
              </div>
            </div>
            <ClassSwitcher value={activeClassId} onChange={setActiveClassId} />
          </div>
        </header>

        <main className="px-5 pb-28 pt-6 sm:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Beranda</span>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-primary">{formatClassContext(context)}</span>
            </div>
            {children(context)}
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md lg:hidden" aria-label="Navigasi mobile">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeNavigation.href === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-[18px]" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
