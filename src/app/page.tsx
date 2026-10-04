import { ArrowRight, BookOpen, CheckCircle2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { classes, students } from "@/lib/mock-data";

export default function Home() {
  const homeroomStudents = students.filter((student) => student.classId === "class-9a");

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground sm:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
              Setup berhasil
            </Badge>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ruang kerja wali kelas</p>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                PantauKelas
              </h1>
            </div>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Satu tempat untuk presensi, nilai, dan catatan perkembangan siswa.
            </p>
          </div>
          <Button className="w-fit gap-2">
            Buka Dashboard
            <ArrowRight className="size-4" />
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Ringkasan setup">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardDescription>Kelas aktif</CardDescription>
              <BookOpen className="size-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{classes[0].name}</p>
              <p className="mt-1 text-sm text-muted-foreground">Kelas perwalian</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardDescription>Total siswa</CardDescription>
              <Users className="size-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="tabular-nums text-2xl font-semibold">{homeroomStudents.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">Data mock siap digunakan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardDescription>Status sistem</CardDescription>
              <CheckCircle2 className="size-5 text-status-hadir-text" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">Siap</p>
              <p className="mt-1 text-sm text-muted-foreground">Project initialization selesai</p>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Komponen UI aktif</CardTitle>
            <CardDescription>Komponen dasar yang akan digunakan di seluruh aplikasi.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Badge className="border-status-hadir-border bg-status-hadir-bg text-status-hadir-text hover:bg-status-hadir-bg">
              H Hadir
            </Badge>
            <Badge className="border-status-izin-border bg-status-izin-bg text-status-izin-text hover:bg-status-izin-bg">
              I Izin
            </Badge>
            <Badge className="border-status-alfa-border bg-status-alfa-bg text-status-alfa-text hover:bg-status-alfa-bg">
              A Alfa
            </Badge>
            <Badge className="border-status-tahfidz-border bg-status-tahfidz-bg text-status-tahfidz-text hover:bg-status-tahfidz-bg">
              Tahfidz
            </Badge>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
