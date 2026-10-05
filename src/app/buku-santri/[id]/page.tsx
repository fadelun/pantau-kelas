"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  assessments,
  classes,
  getStudentAttendance,
  getStudentGrades,
  students,
  type Student,
} from "@/lib/mock-data";

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell>
      {() => <StudentProfileBoard studentId={id} />}
    </AppShell>
  );
}

/** Sanitasi nomor & bangun link wa.me dengan template teks baku. */
function buildWaLink(phone: string, studentName: string, className: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "62");
  const text = encodeURIComponent(
    `Assalamu'alaikum Bapak/Ibu wali dari ${studentName}. Saya wali kelas ${className} ingin menyampaikan kabar terkait putra/putri Anda. Terima kasih.`,
  );
  return `https://wa.me/${digits}?text=${text}`;
}

function NotFoundPanel() {
  return (
    <div className="space-y-4">
      <Link href="/buku-santri" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke Buku Santri
      </Link>
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Santri tidak ditemukan.
      </div>
    </div>
  );
}

function hafalanPredikat(progress: number, target: number): string {
  const pct = target > 0 ? (progress / target) * 100 : 0;
  if (pct >= 90) return "Mumtaz";
  if (pct >= 75) return "Jayyid Jiddan";
  if (pct >= 60) return "Jayyid";
  return "Perlu Bimbingan";
}

function nilaiPredikat(score: number): string {
  if (score >= 90) return "Mumtaz";
  if (score >= 85) return "Sangat Baik";
  if (score >= 80) return "Baik Sekali";
  if (score >= 75) return "Baik";
  return "Di Bawah KKM";
}

function AttendanceRing({ rate }: { rate: number }) {
  const circumference = 2 * Math.PI * 42;
  const dash = (Math.min(100, Math.max(0, rate)) / 100) * circumference;
  return (
    <svg viewBox="0 0 100 100" className="size-28 shrink-0" role="img" aria-label={`Kehadiran ${rate} persen`}>
      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-muted" />
      <circle
        cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform="rotate(-90 50 50)"
        className="stroke-primary"
      />
      <text x="50" y="55" textAnchor="middle" className="fill-foreground text-[15px] font-bold tabular-nums">
        {rate}%
      </text>
    </svg>
  );
}

function StudentProfileBoard({ studentId }: { studentId: string }) {
  const student: Student | undefined = students.find((s) => s.id === studentId);
  if (!student) return <NotFoundPanel />;

  const className = classes.find((c) => c.id === student.classId)?.name ?? "-";
  const waLink = buildWaLink(student.parentPhone, student.name, className);

  const attendanceRecords = getStudentAttendance(student.id);
  const hadirCount = attendanceRecords.filter((r) => r.status === "H").length;
  const izinCount = attendanceRecords.filter((r) => r.status === "I").length;
  const sakitCount = attendanceRecords.filter((r) => r.status === "S").length;
  const alfaCount = attendanceRecords.filter((r) => r.status === "A").length;
  const attendanceRate = attendanceRecords.length
    ? Math.round((hadirCount / attendanceRecords.length) * 100)
    : 0;
  const studentGrades = getStudentGrades(student.id).map((grade) => ({
    ...grade,
    assessment: assessments.find((a) => a.id === grade.assessmentId)!,
  }));
  const weightedAverage = studentGrades.length
    ? Math.round(
        studentGrades.reduce((sum, g) => sum + g.score * g.assessment.weight, 0) /
          studentGrades.reduce((sum, g) => sum + g.assessment.weight, 0),
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-3">
        <Link href="/buku-santri" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> Buku Santri
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium">Aktif</span>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium">Mukim</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
            <span className="size-1.5 rounded-full bg-status-hadir-text" aria-hidden="true" />
            EMIS {student.emis}
          </span>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{student.name}</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            NISN {student.nisn} • Kelas {className} • Absen {String(student.noAbsen).padStart(2, "0")}
          </p>
        </div>
      </header>

      {/* Section 1: Identitas + Wali */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">Identitas Santri</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Asrama</dt>
              <dd className="text-right font-medium">{student.asrama}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Kamar</dt>
              <dd className="text-right font-medium">{student.kamar}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Musyrif</dt>
              <dd className="text-right font-medium">{student.musyrif}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">Data Orang Tua / Wali</h2>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium">Keluarga Inti</span>
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Ayah</dt>
              <dd className="text-right font-medium">{student.ayahNama}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Ibu</dt>
              <dd className="text-right font-medium">{student.ibuNama}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Kontak</dt>
              <dd className="text-right font-medium tabular-nums">{student.parentPhone}</dd>
            </div>
          </dl>
          <div className="mt-4 flex gap-2">
            {/* ponytail: link statis wa.me — verifikasi checklist task 9. */}
            <Button className="flex-1 gap-2" render={<a href={waLink} target="_blank" rel="noopener noreferrer" />}>
              <MessageCircle className="size-4" aria-hidden="true" /> Hubungi WA
            </Button>
            <Button variant="outline" className="gap-2" render={<a href={`tel:${student.parentPhone}`} />}>
              <Phone className="size-4" aria-hidden="true" /> Telepon
            </Button>
          </div>
        </div>
      </section>

      {/* Section 2: Ringkasan Hafalan */}
      <section className="rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">Ringkasan Hafalan Al-Qur&apos;an</h2>
          <span className="rounded-full border border-status-tahfidz-border bg-status-tahfidz-bg px-2 py-0.5 text-xs font-semibold text-status-tahfidz-text">
            {hafalanPredikat(student.tahfidzProgress, student.tahfidzTarget)}
          </span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="rounded-xl bg-primary px-6 py-4 text-center text-primary-foreground">
            <p className="font-heading text-3xl font-bold tabular-nums">{student.tahfidzProgress.toFixed(1)}</p>
            <p className="text-xs opacity-80">dari {student.tahfidzTarget} Juz</p>
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progres Target</span>
              <span className="font-semibold tabular-nums">
                {Math.round((student.tahfidzProgress / student.tahfidzTarget) * 100)}%
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (student.tahfidzProgress / student.tahfidzTarget) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Presensi & Akademik */}
      <section className="rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">Presensi &amp; Capaian Akademik</h2>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">Semester Ganjil 25/26</span>
        </div>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="flex items-center gap-4">
            <AttendanceRing rate={attendanceRate} />
            <div className="space-y-1.5 text-sm">
              <p className="font-semibold">Kehadiran 10 hari terakhir</p>
              <p className="text-muted-foreground tabular-nums">
                {hadirCount} Hadir • {sakitCount} Sakit • {izinCount} Izin • {alfaCount} Alfa
              </p>
              <p className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${
                student.violationPoints === 0
                  ? "border-status-hadir-border bg-status-hadir-bg text-status-hadir-text"
                  : "border-status-alfa-border bg-status-alfa-bg text-status-alfa-text"
              }`}>
                {student.violationPoints} Poin Pelanggaran
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Rata-rata tertimbang</span>
              <span className="font-heading text-2xl font-bold tabular-nums">{weightedAverage}<span className="text-sm font-normal text-muted-foreground">/100</span></span>
            </div>
            <ul className="mt-3 space-y-2.5">
              {studentGrades.map(({ assessment, score }) => (
                <li key={assessment.id} className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{assessment.title}</span>
                    <span className="shrink-0 tabular-nums">
                      {score} <span className="text-xs text-muted-foreground">• {nilaiPredikat(score)}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${score >= 75 ? "bg-primary" : "bg-status-alfa-text"}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">KKM Madrasah: 75.0</p>
          </div>
        </div>
      </section>
    </div>
  );
}
