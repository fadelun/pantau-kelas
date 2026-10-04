"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const modes = [
  { href: "/presensi", label: "Harian" },
  { href: "/presensi/rekap", label: "Rekap" },
];

export function PresensiModeSwitcher() {
  const pathname = usePathname();

  return (
    <div className="inline-flex gap-1 rounded-xl bg-muted p-1" role="group" aria-label="Mode presensi">
      {modes.map((mode) => (
        <Link
          key={mode.href}
          href={mode.href}
          aria-current={pathname === mode.href ? "page" : undefined}
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
            pathname === mode.href
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {mode.label}
        </Link>
      ))}
    </div>
  );
}
