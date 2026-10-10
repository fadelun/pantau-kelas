"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCheck, Loader2, Save } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PresensiModeSwitcher } from "@/components/presensi-mode-switcher";
import { Button } from "@/components/ui/button";
import { useMasterData } from "@/lib/master-data";
import { createClient } from "@/lib/supabase/client";
import { fetchAttendanceForDate, upsertAttendanceBatch } from "@/lib/supabase/queries";
import type { AttendanceStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: "H", label: "H" },
  { value: "S", label: "S" },
  { value: "I", label: "I" },
  { value: "A", label: "A" },
];

const statusStyles: Record<AttendanceStatus, string> = {
  H: "bg-status-hadir-bg text-status-hadir-text border-status-hadir-border",
  S: "bg-status-izin-bg text-status-izin-text border-status-izin-border",
  I: "bg-status-izin-bg text-status-izin-text border-status-izin-border",
  A: "bg-status-alfa-bg text-status-alfa-text border-status-alfa-border",
};

const statusCountsLabels: Record<AttendanceStatus, string> = {
  H: "Hadir",
  S: "Sakit",
  I: "Izin",
  A: "Alfa",
};

type SaveState = "idle" | "saving" | "saved" | "error";

// Tanggal hari ini dalam format YYYY-MM-DD timezone WIB
function todayWIB() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
}

export default function PresensiPage() {
  return (
    <AppShell>
      {(context) => <AttendanceBoard classId={context.classId} className={context.className} />}
    </AppShell>
  );
}

function AttendanceBoard({ classId, className }: { classId: string; className: string }) {
  const { students } = useMasterData();
  const classStudents = students.filter((student) => student.classId === classId);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date()),
    [],
  );

  const todayDate = useMemo(() => todayWIB(), []);

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Load existing attendance for today from DB
  useEffect(() => {
    if (!classId) return;
    const supabase = createClient();
    fetchAttendanceForDate(supabase, classId, todayDate)
      .then((existing) => {
        // Default semua siswa = H; timpa dengan data DB yang ada
        setStatuses(() => {
          const defaults = Object.fromEntries(
            classStudents.map((s) => [s.id, "H" as AttendanceStatus]),
          );
          return { ...defaults, ...existing };
        });
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, todayDate]);

  const counts = useMemo(() => {
    const result: Record<AttendanceStatus, number> = { H: 0, S: 0, I: 0, A: 0 };
    for (const student of classStudents) {
      const s = statuses[student.id] ?? "H";
      result[s] += 1;
    }
    return result;
  }, [classStudents, statuses]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
    setSaveState("idle");
  };

  const markAllPresent = () => {
    setStatuses((prev) =>
      Object.fromEntries(Object.keys(prev).map((id) => [id, "H" as AttendanceStatus])),
    );
    setSaveState("idle");
  };

  const save = async () => {
    setSaveState("saving");
    try {
      const supabase = createClient();
      await upsertAttendanceBatch(supabase, classId, todayDate, statuses);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1800);
    } catch (err) {
      console.error(err);
      setSaveState("error");
      window.setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Memuat data presensi…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Presensi harian</p>
          <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Kelas {className}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{todayLabel}</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <PresensiModeSwitcher />
          <Button variant="outline" className="w-fit gap-2" onClick={markAllPresent}>
            <CheckCheck className="size-4" />
            Tandai Semua Hadir
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3" aria-label="Ringkasan status">
        {statusOptions.map(({ value, label }) => (
          <div key={value} className={cn("rounded-xl border p-3 text-center", statusStyles[value])}>
            <p className="text-xl font-bold tabular-nums">{counts[value]}</p>
            <p className="text-[11px] font-medium">{statusCountsLabels[value]}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <ul className="divide-y divide-border">
          {classStudents.map((student, index) => {
            const active = statuses[student.id] ?? "H";
            return (
              <li key={student.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <p className="truncate text-sm font-medium">{student.name}</p>
                </div>
                <div
                  className="inline-flex shrink-0 gap-1 self-start rounded-xl bg-muted p-1 sm:self-auto"
                  role="group"
                  aria-label={`Status kehadiran ${student.name}`}
                >
                  {statusOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active === value}
                      onClick={() => setStatus(student.id, value)}
                      className={cn(
                        "min-w-10 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
                        active === value
                          ? statusStyles[value]
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 px-4 lg:static lg:px-0 lg:pb-2">
        <div className="mx-auto w-full max-w-7xl">
          <Button
            className="w-full gap-2 shadow-lg lg:w-fit"
            size="lg"
            onClick={() => void save()}
            disabled={saveState === "saving"}
          >
            {saveState === "saving" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saveState === "saved" ? (
              <Save className="size-4" />
            ) : (
              <CheckCheck className="size-4" />
            )}
            {saveState === "saving"
              ? "Menyimpan..."
              : saveState === "saved"
                ? "Tersimpan"
                : saveState === "error"
                  ? "Gagal, coba lagi"
                  : "Simpan Presensi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
