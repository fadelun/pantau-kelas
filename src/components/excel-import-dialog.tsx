"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { DownloadIcon, UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Assessment, type Student } from "@/lib/mock-data";

// ── Template downloader (exported so page keeps thin) ───────────────────────

export function downloadGradeTemplate(className: string, students: Student[]) {
  const aoa = [
    ["No Absen", "Nama Santri", "Nilai"],
    ...students.map((s) => [s.noAbsen, s.name, ""]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Nilai");
  XLSX.writeFile(wb, `template-nilai-${className}.xlsx`);
}

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedRow {
  noAbsen: number;
  name: string;
  score: number | null; // null = invalid/blank
}

interface ExcelImportDialogProps {
  students: Student[];
  assessments: Assessment[];
  onImport: (
    assessmentId: string,
    scores: { studentId: string; score: number }[],
    unmatched: number,
  ) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ExcelImportDialog({
  students,
  assessments,
  onImport,
}: ExcelImportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [parsed, setParsed] = React.useState<ParsedRow[] | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = React.useState(
    assessments[0]?.id ?? "",
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function reset() {
    setDragOver(false);
    setParseError(null);
    setParsed(null);
    setSelectedAssessmentId(assessments[0]?.id ?? "");
  }

  function handleOpenChange(next: boolean) {
    if (next) reset();
    setOpen(next);
  }

  // ── File parsing ──────────────────────────────────────────────────────────

  async function parseFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls") {
      setParseError("Format file tidak didukung. Gunakan .xlsx atau .xls.");
      setParsed(null);
      return;
    }
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
        header: 1,
        blankrows: false,
      });

      // Skip header row if first cell is the literal string "No Absen"
      const dataRows =
        String(rawRows[0]?.[0] ?? "").trim() === "No Absen"
          ? rawRows.slice(1)
          : rawRows;

      const result: ParsedRow[] = dataRows.map((row) => {
        const arr = row as unknown[];
        const noAbsen = parseInt(String(arr[0] ?? ""), 10);
        const name = String(arr[1] ?? "").trim();
        const scoreRaw = arr[2];
        const scoreNum =
          scoreRaw === "" || scoreRaw == null
            ? null
            : parseFloat(String(scoreRaw));
        const score =
          scoreNum == null || isNaN(scoreNum)
            ? null
            : Math.min(100, Math.max(0, scoreNum));
        return { noAbsen: isNaN(noAbsen) ? -1 : noAbsen, name, score };
      });

      setParseError(null);
      setParsed(result);
    } catch {
      setParseError("Gagal membaca file. Pastikan file tidak rusak.");
      setParsed(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  // ── Derived values ────────────────────────────────────────────────────────

  // Match parsed rows to students by noAbsen
  const matchedScores = React.useMemo(() => {
    if (!parsed) return [];
    return parsed.flatMap((row) => {
      const student = students.find((s) => s.noAbsen === row.noAbsen);
      if (!student || row.score == null) return [];
      return [{ studentId: student.id, score: row.score }];
    });
  }, [parsed, students]);

  const unmatchedCount = React.useMemo(() => {
    if (!parsed) return 0;
    return parsed.filter((row) => {
      const student = students.find((s) => s.noAbsen === row.noAbsen);
      return !student;
    }).length;
  }, [parsed, students]);

  const preview = parsed?.slice(0, 3) ?? [];
  const canSave = matchedScores.length > 0 && selectedAssessmentId !== "";

  function handleSave() {
    if (!canSave) return;
    onImport(selectedAssessmentId, matchedScores, unmatchedCount);
    setOpen(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="default"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <UploadIcon className="size-4" />
        Import Excel
      </Button>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Nilai dari Excel</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Drop zone */}
          <div
            className={[
              "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30",
            ].join(" ")}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <UploadIcon className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Seret file .xlsx/.xls ke sini, atau{" "}
              <button
                type="button"
                className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                onClick={() => fileInputRef.current?.click()}
              >
                pilih file
              </button>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              onChange={handleFileInput}
            />
          </div>

          {/* Error */}
          {parseError && (
            <p className="text-sm text-destructive">{parseError}</p>
          )}

          {/* Preview table */}
          {parsed && !parseError && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Pratinjau (3 baris pertama dari {parsed.length})
              </p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-center font-semibold">No</th>
                      <th className="px-3 py-2 text-left font-semibold">Nama</th>
                      <th className="px-3 py-2 text-center font-semibold">Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5 text-center tabular-nums">
                          {row.noAbsen > 0 ? row.noAbsen : "—"}
                        </td>
                        <td className="px-3 py-1.5">{row.name || "—"}</td>
                        <td className="px-3 py-1.5 text-center tabular-nums">
                          {row.score != null ? (
                            row.score
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {unmatchedCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unmatchedCount} baris tidak cocok dengan data santri kelas ini.
                </p>
              )}
            </div>
          )}

          {/* Assessment selector */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="import-assessment"
              className="text-xs font-medium text-muted-foreground"
            >
              Kolom tujuan
            </label>
            {assessments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tambahkan asesmen terlebih dahulu.
              </p>
            ) : (
              // ponytail: native select — no custom Select primitive; upgrade when styling needed.
              <select
                id="import-assessment"
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.category})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="default"
            disabled={!canSave}
            onClick={handleSave}
          >
            Simpan Nilai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Template download button (standalone, exported for use in page header) ──

export function DownloadTemplateButton({
  className,
  students,
}: {
  className: string;
  students: Student[];
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() => downloadGradeTemplate(className, students)}
    >
      <DownloadIcon className="size-4" />
      Unduh Template
    </Button>
  );
}
