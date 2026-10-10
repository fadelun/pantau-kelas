// src/lib/supabase/queries.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SchoolClass, Student, AttendanceStatus, AttendanceRecord } from "@/lib/mock-data";
import type { MasterSubject } from "@/lib/master-data";

// ─── Classes ────────────────────────────────────────────────────────────────

export async function fetchClasses(supabase: SupabaseClient): Promise<SchoolClass[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("id, name")
    .order("name");
  if (error) throw error;
  // ponytail: type="homeroom" hardcoded — lihat Task B catatan mapping.
  // Untuk support "Guru Mapel" context dari DB, join subjects di Task 14.
  return (data ?? []).map((row) => ({ id: row.id, name: row.name, type: "homeroom" as const }));
}

export async function upsertClass(
  supabase: SupabaseClient,
  input: Omit<SchoolClass, "id">,
  id?: string,
): Promise<SchoolClass> {
  // teacher_id diisi otomatis lewat RLS (auth.uid()) tapi harus eksplisit untuk insert
  const { data: me } = await supabase.auth.getUser();
  const teacher_id = me.user?.id;
  const payload = { name: input.name, grade_level: 9, academic_year: "2026/2027", teacher_id };
  const { data, error } = id
    ? await supabase.from("classes").update(payload).eq("id", id).select("id, name").single()
    : await supabase.from("classes").insert(payload).select("id, name").single();
  if (error) throw error;
  return { id: data.id, name: data.name, type: input.type, subject: input.subject };
}

export async function deleteClass(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw error;
}

// ─── Students ────────────────────────────────────────────────────────────────

function dbToStudent(row: Record<string, unknown>): Student {
  return {
    id: row.id as string,
    classId: row.class_id as string,
    noAbsen: row.no_absen as number,
    name: row.name as string,
    nisn: row.nisn as string,
    parentPhone: (row.parent_phone as string) ?? "",
    tahfidzTarget: (row.tahfidz_target as number) ?? 0,
    emis: (row.emis as string) ?? "",
    asrama: (row.asrama as string) ?? "",
    kamar: (row.kamar as string) ?? "",
    musyrif: "", // kolom belum ada di DB
    ayahNama: (row.ayah_nama as string) ?? "",
    ibuNama: (row.ibu_nama as string) ?? "",
    tahfidzProgress: Number(row.tahfidz_progress ?? 0),
    violationPoints: (row.violation_points as number) ?? 0,
  };
}

export async function fetchStudents(supabase: SupabaseClient): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id, class_id, no_absen, name, nisn, parent_phone, tahfidz_target, emis, asrama, kamar, ayah_nama, ibu_nama, tahfidz_progress, violation_points")
    .order("class_id")
    .order("no_absen");
  if (error) throw error;
  return (data ?? []).map(dbToStudent);
}

export async function upsertStudent(
  supabase: SupabaseClient,
  input: Omit<Student, "id">,
  id?: string,
): Promise<Student> {
  const payload = {
    class_id: input.classId,
    no_absen: input.noAbsen,
    name: input.name,
    nisn: input.nisn,
    parent_phone: input.parentPhone,
    tahfidz_target: input.tahfidzTarget,
    emis: input.emis,
    asrama: input.asrama,
    kamar: input.kamar,
    ayah_nama: input.ayahNama,
    ibu_nama: input.ibuNama,
    tahfidz_progress: input.tahfidzProgress,
    violation_points: input.violationPoints,
  };
  const cols = "id, class_id, no_absen, name, nisn, parent_phone, tahfidz_target, emis, asrama, kamar, ayah_nama, ibu_nama, tahfidz_progress, violation_points";
  const { data, error } = id
    ? await supabase.from("students").update(payload).eq("id", id).select(cols).single()
    : await supabase.from("students").insert(payload).select(cols).single();
  if (error) throw error;
  return dbToStudent(data);
}

export async function deleteStudent(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

// ─── Subjects ────────────────────────────────────────────────────────────────

export async function fetchSubjects(supabase: SupabaseClient): Promise<MasterSubject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, class_id, name")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    code: "", // kolom tidak ada di DB
    classIds: [row.class_id as string],
  }));
}

export async function upsertSubject(
  supabase: SupabaseClient,
  input: Omit<MasterSubject, "id">,
  id?: string,
): Promise<MasterSubject> {
  const { data: me } = await supabase.auth.getUser();
  const teacher_id = me.user?.id;
  const payload = {
    class_id: input.classIds[0], // 1:1 per keputusan rencana
    name: input.name,
    teacher_id,
  };
  const { data, error } = id
    ? await supabase.from("subjects").update(payload).eq("id", id).select("id, class_id, name").single()
    : await supabase.from("subjects").insert(payload).select("id, class_id, name").single();
  if (error) throw error;
  return { id: data.id, name: data.name, code: input.code, classIds: [data.class_id] };
}

export async function deleteSubject(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw error;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

/** Ambil presensi untuk satu kelas pada satu tanggal. Return map studentId→status */
export async function fetchAttendanceForDate(
  supabase: SupabaseClient,
  classId: string,
  date: string,
): Promise<Record<string, AttendanceStatus>> {
  // Ambil student IDs untuk kelas ini dulu (RLS sudah filter)
  const { data: studentRows, error: sErr } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId);
  if (sErr) throw sErr;
  const studentIds = (studentRows ?? []).map((r) => r.id as string);
  if (studentIds.length === 0) return {};

  const { data, error } = await supabase
    .from("attendance")
    .select("student_id, status")
    .in("student_id", studentIds)
    .eq("date", date)
    .is("subject_id", null); // presensi wali (tanpa subject)
  if (error) throw error;

  return Object.fromEntries(
    (data ?? []).map((r) => [r.student_id as string, r.status as AttendanceStatus]),
  );
}

/** Upsert batch presensi seluruh kelas untuk satu tanggal */
export async function upsertAttendanceBatch(
  supabase: SupabaseClient,
  classId: string,
  date: string,
  statuses: Record<string, AttendanceStatus>,
): Promise<void> {
  const rows = Object.entries(statuses).map(([student_id, status]) => ({
    student_id,
    date,
    status,
    subject_id: null,
  }));
  if (rows.length === 0) return;
  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,subject_id,date" });
  if (error) throw error;
}

/** Ambil rekap attendance untuk satu kelas dalam rentang tanggal */
export async function fetchAttendanceRange(
  supabase: SupabaseClient,
  classId: string,
  from: string,
  to: string,
): Promise<AttendanceRecord[]> {
  const { data: studentRows, error: sErr } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId);
  if (sErr) throw sErr;
  const studentIds = (studentRows ?? []).map((r) => r.id as string);
  if (studentIds.length === 0) return [];

  const { data, error } = await supabase
    .from("attendance")
    .select("student_id, date, status")
    .in("student_id", studentIds)
    .gte("date", from)
    .lte("date", to)
    .is("subject_id", null);
  if (error) throw error;

  return (data ?? []).map((r) => ({
    studentId: r.student_id as string,
    date: r.date as string,
    status: r.status as AttendanceStatus,
  }));
}
