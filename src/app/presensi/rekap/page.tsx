"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PresensiModeSwitcher } from "@/components/presensi-mode-switcher";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMasterData } from "@/lib/master-data";
import { createClient } from "@/lib/supabase/client";
import { fetchAttendanceRange } from "@/lib/supabase/queries";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Period = "weekly" | "monthly" | "semester";

const periods: { value: Period; label: string; days: number }[] = [
  { value: "weekly", label: "Pekanan", days: 7 },
  { value: "monthly", label: "Bulanan", days: 30 },
  { value: "semester", label: "Semesteran", days: 180 },
];

const statusColumn: { status: AttendanceStatus; label: string; textClass: string }[] = [
  { status: "H", label: "H", textClass: "text-status-hadir-text" },
  { status: "S", label: "S", textClass: "text-status-izin-text" },
  { status: "I", label: "I", textClass: "text-status-izin-text" },
  { status: "A", label: "A", textClass: "text-status-alfa-text" },
];

function todayWIB() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
}

function periodStart(days: number, today: string) {
  const d = new Date(today);
  d.setDate(d.getDate() - (days - 1));
  return d.toISOString().slice(0, 10);
}

export default function RekapPresensiPage() {
  return (
    <AppShell>
      {(context) => <RecapBoard classId={context.classId} className={context.className} />}
    </AppShell>
  );
}

function RecapBoard({ classId, className }: { classId: string; className: string }) {
  const { students } = useMasterData();
  const classStudents = students.filter((student) => student.classId === classId);

  const [period, setPeriod] = useState<Period>("weekly");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const today = useMemo(() => todayWIB(), []);
  const start = useMemo(
    () => periodStart(periods.find((p) => p.value === period)!.days, today),
    [period, today],
  );

  useEffect(() => {
    if (!classId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const supabase = createClient();
    fetchAttendanceRange(supabase, classId, start, today)
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [classId, start, today]);

  const rows = useMemo(() => {
    const byStudent = new Map<string, AttendanceRecord[]>();
    for (const record of records) {
      const list = byStudent.get(record.studentId) ?? [];
      list.push(record);
      byStudent.set(record.studentId, list);
    }
    return classStudents.map((student) => {
      const studentRecords = byStudent.get(student.id) ?? [];
      const counts: Record<AttendanceStatus, number> = { H: 0, S: 0, I: 0, A: 0 };
      for (const r of studentRecords) counts[r.status] += 1;
      const total = studentRecords.length;
      const percentage = total === 0 ? 0 : Math.round((counts.H / total) * 1000) / 10;
      return { student, counts, total, percentage };
    });
  }, [classStudents, records]);

  const totals = useMemo(() => {
    const sums: Record<AttendanceStatus, number> = { H: 0, S: 0, I: 0, A: 0 };
    let total = 0;
    for (const row of rows) {
      sums.H += row.counts.H;
      sums.S += row.counts.S;
      sums.I += row.counts.I;
      sums.A += row.counts.A;
      total += row.total;
    }
    return { sums, percentage: total === 0 ? 0 : Math.round((sums.H / total) * 1000) / 10 };
  }, [rows]);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Rekapitulasi kehadiran</p>
          <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Kelas {className}
          </h2>
        </div>
        <PresensiModeSwitcher />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)}>
          <TabsList>
            {periods.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground">
          Periode: {start} s.d. {today}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Ringkasan periode">
        <div className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
          <p className="text-xl font-bold tabular-nums text-primary">{totals.percentage}%</p>
          <p className="text-[11px] font-medium text-muted-foreground">Kehadiran</p>
        </div>
        {statusColumn.map(({ status, label, textClass }) => (
          <div key={status} className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
            <p className={cn("text-xl font-bold tabular-nums", textClass)}>{totals.sums[status]}</p>
            <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Memuat rekap…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">No</th>
                  <th className="px-4 py-3 font-semibold">Nama Santri</th>
                  {statusColumn.map(({ status, label }) => (
                    <th key={status} className="px-3 py-3 text-center font-semibold">
                      {label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ student, counts, percentage }, index) => (
                  <tr key={student.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{student.name}</td>
                    {statusColumn.map(({ status, textClass }) => (
                      <td
                        key={status}
                        className={cn(
                          "px-3 py-3 text-center tabular-nums",
                          counts[status] === 0 ? "text-muted-foreground/50" : textClass,
                        )}
                      >
                        {counts[status]}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-14 text-right text-xs font-semibold tabular-nums">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Belum ada data presensi untuk periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
