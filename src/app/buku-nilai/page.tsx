"use client";

import { useMemo } from "react";
import {
  createCoreRowModel,
  flexRender,
  tableFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { AppShell } from "@/components/app-shell";
import { assessments, grades, students, type Student } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type GradeRow = {
  student: Student;
  scores: Record<string, number>;
  average: number | null;
};

// ponytail: v9 API — features objek wajib; inline-editing (task 6) tinggal
// tambah state + cell editor, sorting (bila perlu) via rowSortingFeature.
const features = tableFeatures({ coreRowModel: createCoreRowModel() });

const stickyThClass: Record<string, string> = {
  no: "sticky left-0 z-20 bg-muted",
  nama: "sticky left-12 z-20 bg-muted shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]",
  average: "sticky right-0 z-20 bg-muted shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]",
};

const stickyTdClass: Record<string, string> = {
  no: "sticky left-0 z-10 bg-card group-hover:bg-muted/40",
  nama: "sticky left-12 z-10 bg-card group-hover:bg-muted/40 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]",
  average: "sticky right-0 z-10 bg-card group-hover:bg-muted/40 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]",
};

const thAlign: Record<string, string> = { nama: "text-left", average: "text-right" };
const tdAlign: Record<string, string> = { no: "text-center", nama: "text-left", average: "text-right" };
const thWidth: Record<string, string> = { no: "w-12", nama: "min-w-40", average: "min-w-24" };

function MissingValue() {
  return <span className="text-muted-foreground/50">—</span>;
}

export default function BukuNilaiPage() {
  return (
    <AppShell>
      {(context) => <GradeSheetBoard classId={context.classId} className={context.className} />}
    </AppShell>
  );
}

function GradeSheetBoard({ classId, className }: { classId: string; className: string }) {
  const classAssessments = useMemo(
    () => assessments.filter((assessment) => assessment.classId === classId),
    [classId],
  );
  const classStudents = useMemo(
    () => students.filter((student) => student.classId === classId),
    [classId],
  );

  const rows = useMemo<GradeRow[]>(
    () =>
      classStudents.map((student) => {
        const scores: Record<string, number> = {};
        let weightedSum = 0;
        let weightSum = 0;
        for (const assessment of classAssessments) {
          const grade = grades.find(
            (g) => g.studentId === student.id && g.assessmentId === assessment.id,
          );
          if (!grade) continue;
          scores[assessment.id] = grade.score;
          weightedSum += grade.score * assessment.weight;
          weightSum += assessment.weight;
        }
        return {
          student,
          scores,
          average: weightSum === 0 ? null : Math.round(weightedSum / weightSum),
        };
      }),
    // ponytail: mock statis — data dari Supabase (task 13) jadikan dependency.
    [classStudents, classAssessments],
  );

  const columns = useMemo<ColumnDef<typeof features, GradeRow>[]>(() => {
    const assessmentColumns: ColumnDef<typeof features, GradeRow>[] = classAssessments.map(
      (assessment) => ({
        id: assessment.id,
        header: () => (
          <div className="flex flex-col items-center gap-0.5">
            <span>{assessment.title}</span>
            <span className="text-[9px] font-medium normal-case tracking-normal text-muted-foreground/70">
              Bobot {assessment.weight}%
            </span>
          </div>
        ),
        accessorFn: (row) => row.scores[assessment.id] ?? null,
        cell: (info) => info.getValue() ?? <MissingValue />,
      }),
    );

    return [
      {
        id: "no",
        header: "No",
        accessorFn: (row) => row.student.noAbsen,
      },
      {
        id: "nama",
        header: "Nama Santri",
        accessorFn: (row) => row.student.name,
      },
      ...assessmentColumns,
      {
        id: "average",
        header: "Rata-rata",
        accessorFn: (row) => row.average,
        cell: (info) => info.getValue() ?? <MissingValue />,
      },
    ];
  }, [classAssessments]);

  const table = useTable({ features, columns, data: rows });

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-sm font-medium text-muted-foreground">Buku nilai</p>
        <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Kelas {className}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {classAssessments.length} asesmen · {classStudents.length} santri
        </p>
      </section>

      {classAssessments.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <p className="font-medium">Belum ada asesmen</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Asesmen untuk kelas ini belum ditambahkan, jadi lembar nilai masih kosong.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-border bg-muted text-[11px] uppercase tracking-wider text-muted-foreground"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(
                          "px-3 py-3 text-center font-semibold",
                          thAlign[header.column.id],
                          thWidth[header.column.id],
                          stickyThClass[header.column.id],
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="group transition-colors hover:bg-muted/40">
                    {row.getAllCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-3 py-3 tabular-nums",
                          tdAlign[cell.column.id],
                          stickyTdClass[cell.column.id],
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
