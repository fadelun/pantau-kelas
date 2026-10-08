-- PantauKelas — Task 11: Core schema (copy of Supabase migration `create_core_schema`)
-- Membuat tabel teachers, classes, class_subjects, assessments, anecdotal_notes
-- + restrukturisasi students/grades/attendance/subjects, drop parents & behaviors.
-- Catatan: kebijakan RLS final ada di migration 0002 (placeholder "Allow all for
-- admin *" dari setup dashboard masih aktif sampai 0002 dijalankan).

-- 1. Teachers (pola profil: id = auth.users.id)
create table public.teachers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar not null,
  phone varchar,
  created_at timestamptz not null default now()
);
alter table public.teachers enable row level security;

-- 2. Classes (homeroom FK pakai SET NULL: guru dihapus, kelas tetap ada)
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  homeroom_teacher_id uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.classes enable row level security;

-- 3. Students: link kelas + field aplikasi
alter table public.students
  add column class_id uuid references public.classes(id) on delete set null,
  add column no_absen int,
  add column parent_phone varchar,
  add column ayah_nama varchar,
  add column ibu_nama varchar,
  add column asrama varchar,
  add column kamar varchar,
  add column musyrif varchar,
  add column emis varchar,
  add column tahfidz_target int default 30,
  add column tahfidz_progress int default 0,
  add column violation_points int default 0;

-- 4. Relasi kelas-mapel + guru pengampu
create table public.class_subjects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  unique (class_id, subject_id)
);

-- 5. Assessments (kolom pada buku nilai)
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  title varchar not null,
  category varchar check (category in ('tugas','kuis','pts','pas')),
  weight numeric not null default 1.0,
  created_at timestamptz not null default now()
);

-- 6. Grades: menunjuk ke assessment
alter table public.grades
  drop column if exists subject_id,
  drop column if exists assignment_type,
  drop column if exists weight,
  drop column if exists date;
alter table public.grades
  add column assessment_id uuid not null references public.assessments(id) on delete cascade,
  add constraint grades_unique_entry unique (student_id, assessment_id);

-- 7. Anecdotal notes (log sikap Student 360)
create table public.anecdotal_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null default current_date,
  category varchar check (category in ('Positif','Prestasi','Perhatian','Negatif')),
  tag varchar,
  content text not null,
  pencatat varchar,
  created_at timestamptz not null default now()
);

-- 8. Attendance: link kelas + constraint
-- (dashboard lama sudah punya unique (student_id, date) = attendance_student_id_date_key,
--  dan status check dengan nilai teks panjang — diganti ke H/S/I/A sesuai app)
alter table public.attendance
  add column class_id uuid references public.classes(id) on delete cascade;
alter table public.attendance drop constraint if exists attendance_status_check;
alter table public.attendance
  add constraint attendance_status_check check (status in ('H','S','I','A'));
alter table public.attendance alter column student_id set not null;

-- 9. Drop tabel/tak terpakai
drop table if exists public.parents cascade;
drop table if exists public.behaviors cascade;
alter table public.subjects drop column if exists teacher_name;

-- 9b. RLS untuk tabel baru (tabel existing sudah aktif dari dashboard)
alter table public.class_subjects enable row level security;
alter table public.assessments enable row level security;
alter table public.anecdotal_notes enable row level security;

-- 10. Indeks query
create index idx_students_class on public.students(class_id);
create index idx_attendance_class_date on public.attendance(class_id, date);
create index idx_grades_student on public.grades(student_id);
create index idx_grades_assessment on public.grades(assessment_id);
create index idx_assessments_class on public.assessments(class_id);
create index idx_class_subjects_class on public.class_subjects(class_id);
create index idx_class_subjects_teacher on public.class_subjects(teacher_id);
create index idx_anecdotal_student_date on public.anecdotal_notes(student_id, date);
