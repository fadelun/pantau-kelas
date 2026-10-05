"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
  scores: Record<string, number | undefined>;
};

// ponytail: v9 API — features objek wajib; sorting (bila perlu) via rowSortingFeature.
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

/** Derive initial rows from mock data for a given classId. */
function deriveRows(classId: string): GradeRow[] {
  const classStudents = students.filter((s) => s.classId === classId);
  const classAssessments = assessments.filter((a) => a.classId === classId);
  return classStudents.map((student) => {
    const scores: Record<string, number | undefined> = {};
    for (const assessment of classAssessments) {
      const grade = grades.find(
        (g) => g.studentId === student.id && g.assessmentId === assessment.id,
      );
      scores[assessment.id] = grade?.score;
    }
    return { student, scores };
  });
}

/** Compute weighted average for a row given current scores. Only assessed items count. */
function computeAverage(
  row: GradeRow,
  classAssessments: { id: string; weight: number }[],
): number | null {
  let weightedSum = 0;
  let weightSum = 0;
  for (const a of classAssessments) {
    const score = row.scores[a.id];
    if (score == null) continue;
    weightedSum += score * a.weight;
    weightSum += a.weight;
  }
  return weightSum === 0 ? null : Math.round(weightedSum / weightSum);
}

export default function BukuNilaiPage() {
  return (
    <AppShell>
      {(context) => (
        <GradeSheetBoard key={context.classId} classId={context.classId} className={context.className} />
      )}
    </AppShell>
  );
}

function GradeSheetBoard({ classId, className }: { classId: string; className: string }) {
  const classAssessments = useMemo(
    () => assessments.filter((a) => a.classId === classId),
    [classId],
  );
  const classStudents = useMemo(
    () => students.filter((s) => s.classId === classId),
    [classId],
  );

  // ponytail: mock statis — data dari Supabase (task 13) akan replace deriveRows.
  // key={classId} on GradeSheetBoard (in BukuNilaiPage) remounts this component on class switch,
  // so useState initializer runs fresh — no useEffect needed.
  const [rows, setRows] = useState<GradeRow[]>(() => deriveRows(classId));

  // Ref map for keyboard Enter navigation: key = `${studentId}:${assessmentId}`
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const updateScore = useCallback(
    (studentId: string, assessmentId: string, raw: string) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.student.id !== studentId) return row;
          const trimmed = raw.slice(0, 3); // max 3 digits
          const parsed = parseInt(trimmed, 10);
          const score =
            trimmed === ""
              ? undefined
              : isNaN(parsed)
                ? row.scores[assessmentId]
                : Math.min(100, Math.max(0, parsed));
          return { ...row, scores: { ...row.scores, [assessmentId]: score } };
        }),
      );
    },
    [],
  );

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      studentId: string,
      assessmentId: string,
    ) => {
      if (e.key === "Escape") {
        e.currentTarget.blur();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const currentRowIdx = rows.findIndex((r) => r.student.id === studentId);
        const delta = e.shiftKey ? -1 : 1;
        const nextRow = rows[currentRowIdx + delta];
        if (nextRow) {
          inputRefs.current.get(`${nextRow.student.id}:${assessmentId}`)?.focus();
        }
      }
    },
    [rows],
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
        cell: (info) => {
          const studentId = info.row.original.student.id;
          const assessmentId = assessment.id;
          const score = info.row.original.scores[assessmentId];
          const refKey = `${studentId}:${assessmentId}`;
          return (
            <input
              ref={(el) => {
                if (el) inputRefs.current.set(refKey, el);
                else inputRefs.current.delete(refKey);
              }}
              inputMode="numeric"
              placeholder="—"
              value={score ?? ""}
              onChange={(e) => updateScore(studentId, assessmentId, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, studentId, assessmentId)}
              className={cn(
                "w-14 rounded bg-transparent px-1 py-0.5 text-center tabular-nums outline-none",
                "placeholder:text-muted-foreground/40",
                "focus:bg-primary/10 focus:ring-1 focus:ring-primary/40",
              )}
            />
          );
        },
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
        // Compute live from current scores so re-renders pick up edits.
        accessorFn: (row) => computeAverage(row, classAssessments),
        cell: (info) => {
          const val = info.getValue<number | null>();
          return val != null ? (
            <span className="font-semibold">{val}</span>
          ) : (
            <MissingValue />
          );
        },
      },
    ];
  }, [classAssessments, updateScore, handleKeyDown]);

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
                          "px-3 py-2 tabular-nums",
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
