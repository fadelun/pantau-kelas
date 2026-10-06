"use client";

import { ChevronDown, GraduationCap } from "lucide-react";

import type { SchoolClass } from "@/lib/mock-data";

export type ClassContext = {
  classId: string;
  role: "Wali Kelas" | "Guru Mapel";
  className: string;
  subject?: string;
};

export function getClassContext(classId: string, classes: SchoolClass[]) {
  const schoolClass = classes.find((item) => item.id === classId) ?? classes[0];
  if (!schoolClass) {
    return { classId: "", role: "Wali Kelas" as const, className: "Belum ada kelas" };
  }
  return {
    classId: schoolClass.id,
    role: schoolClass.type === "homeroom" ? "Wali Kelas" as const : "Guru Mapel" as const,
    className: schoolClass.name,
    subject: schoolClass.subject,
  };
}

type ClassSwitcherProps = {
  classes: SchoolClass[];
  value: string;
  onChange: (classId: string) => void;
};

export function ClassSwitcher({ classes, value, onChange }: ClassSwitcherProps) {
  return (
    <label className="group relative flex min-w-48 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <GraduationCap className="size-4" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Konteks kerja
        </span>
        <select
          aria-label="Pilih konteks kelas"
          className="w-full appearance-none truncate bg-transparent pr-5 text-xs font-semibold text-foreground outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {classes.map((schoolClass) => {
            const context = getClassContext(schoolClass.id, classes);
            return <option key={schoolClass.id} value={schoolClass.id}>{formatClassContext(context)}</option>;
          })}
        </select>
      </span>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-transform group-focus-within:rotate-180" aria-hidden="true" />
    </label>
  );
}

export function formatClassContext(context: ClassContext) {
  return `${context.role} · ${context.className}${context.subject ? ` · ${context.subject}` : ""}`;
}
