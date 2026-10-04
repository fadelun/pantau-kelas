"use client";

import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Users } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { students } from "@/lib/mock-data";

export default function Home() {
  return (
    <AppShell>
      {(context) => {
        const classStudents = students.filter((student) => student.classId === context.classId);

        return (
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/15">Selamat datang kembali</Badge>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ringkasan aktivitas untuk</p>
                  <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {context.role} {context.className}
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                  Pantau kehadiran, nilai, dan perkembangan santri dari satu ruang kerja yang ringkas.
                </p>
              </div>
              <Button className="w-fit gap-2">
                Mulai presensi
                <ArrowRight className="size-4" />
              </Button>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan kelas">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardDescription>Total santri</CardDescription>
                  <Users className="size-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="tabular-nums text-2xl font-semibold">{classStudents.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Terdaftar di kelas aktif</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardDescription>Kehadiran hari ini</CardDescription>
                  <ClipboardCheck className="size-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="tabular-nums text-2xl font-semibold">92%</p>
                  <p className="mt-1 text-xs text-status-hadir-text">9 hadir · 1 izin</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardDescription>Rata-rata nilai</CardDescription>
                  <BookOpen className="size-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="tabular-nums text-2xl font-semibold">84.6</p>
                  <p className="mt-1 text-xs text-muted-foreground">Semester ganjil 2026/2027</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardDescription>Status sistem</CardDescription>
                  <CheckCircle2 className="size-5 text-status-hadir-text" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">Siap</p>
                  <p className="mt-1 text-xs text-muted-foreground">Data terakhir tersinkron</p>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas berikutnya</CardTitle>
                  <CardDescription>Prioritas pekerjaan di kelas aktif.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ["Presensi harian", "Belum disimpan untuk hari ini", "Mulai", "bg-primary/10 text-primary"],
                    ["Input nilai Kuis 1", "7 dari 10 santri belum memiliki nilai", "Lanjutkan", "bg-secondary text-secondary-foreground"],
                    ["Catatan wali santri", "2 catatan menunggu tindak lanjut", "Buka", "bg-status-izin-bg text-status-izin-text"],
                  ].map(([title, detail, action, tone]) => (
                    <div key={title} className="flex items-center gap-3 rounded-xl border border-border p-3">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                        <span className="size-2 rounded-full bg-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="truncate text-xs text-muted-foreground">{detail}</p>
                      </div>
                      <button type="button" className="text-xs font-semibold text-primary hover:underline">{action}</button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Konteks aktif</CardTitle>
                  <CardDescription>Gunakan switcher di header untuk berpindah kelas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl bg-primary p-5 text-primary-foreground">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground/70">Akses saat ini</p>
                    <p className="mt-2 text-xl font-semibold">{context.role}</p>
                    <p className="mt-1 text-sm text-primary-foreground/80">
                      Kelas {context.className}{context.subject ? ` · ${context.subject}` : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        );
      }}
    </AppShell>
  );
}
