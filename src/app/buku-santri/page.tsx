"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { getStudentAttendance, students } from "@/lib/mock-data";

export default function BukuSantriPage() {
  return (
    <AppShell>
      {(context) => <StudentRosterBoard classId={context.classId} className={context.className} />}
    </AppShell>
  );
}

function attendanceRate(studentId: string): number {
  const records = getStudentAttendance(studentId);
  if (records.length === 0) return 0;
  const hadir = records.filter((record) => record.status === "H").length;
  return Math.round((hadir / records.length) * 100);
}

function StudentRosterBoard({ classId, className }: { classId: string; className: string }) {
  const classStudents = students.filter((student) => student.classId === classId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Buku Santri</h1>
        <p className="text-sm text-muted-foreground">
          {classStudents.length} santri terdaftar di kelas {className}
        </p>
      </header>

      {classStudents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Belum ada santri di kelas ini.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classStudents.map((student) => (
            <Link
              key={student.id}
              href={`/buku-santri/${student.id}`}
              className="group flex items-center gap-4 rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary tabular-nums">
                {String(student.noAbsen).padStart(2, "0")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold">{student.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">NISN {student.nisn}</p>
                <div className="mt-1.5 flex gap-1.5">
                  <span className="rounded-md border border-status-tahfidz-border bg-status-tahfidz-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-tahfidz-text tabular-nums">
                    {student.tahfidzProgress.toFixed(1)} / {student.tahfidzTarget} Juz
                  </span>
                  <span className="rounded-md border border-status-hadir-border bg-status-hadir-bg px-1.5 py-0.5 text-[10px] font-semibold text-status-hadir-text tabular-nums">
                    {attendanceRate(student.id)}% Hadir
                  </span>
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
