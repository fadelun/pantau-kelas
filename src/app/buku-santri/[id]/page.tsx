"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { classes, students, type Student } from "@/lib/mock-data";

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

function StudentProfileBoard({ studentId }: { studentId: string }) {
  const student: Student | undefined = students.find((s) => s.id === studentId);
  if (!student) return <NotFoundPanel />;

  const className = classes.find((c) => c.id === student.classId)?.name ?? "-";
  const waLink = buildWaLink(student.parentPhone, student.name, className);

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
    </div>
  );
}
