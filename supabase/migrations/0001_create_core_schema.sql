-- PantauKelas — Task 11: Core schema
-- Tabel: teachers, classes, subjects, students, assessments, grades,
-- attendance, anecdotal_notes. Mapel bersifat per-kelas (bukan global).
-- RLS policies ada di 0002_rls_and_auth.sql.

create table public.teachers (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  full_name   text not null,
  created_at  timestamptz not null default now()
);

create table public.classes (
  id             uuid primary key default gen_random_uuid(),
  teacher_id     uuid not null references public.teachers(id) on delete restrict,
  name           text not null,
  grade_level    smallint not null,
  academic_year  text not null,
  created_at     timestamptz not null default now()
);

create index on public.classes (teacher_id);

create table public.subjects (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.classes(id) on delete cascade,
  teacher_id  uuid not null references public.teachers(id) on delete restrict,
  name        text not null,
  created_at  timestamptz not null default now()
);

create index on public.subjects (class_id);
create index on public.subjects (teacher_id);

create table public.students (
  id                uuid primary key default gen_random_uuid(),
  class_id          uuid not null references public.classes(id) on delete restrict,
  no_absen          smallint not null,
  name              text not null,
  nisn              text unique not null,
  parent_phone      text,
  emis             text,
  asrama           text,
  kamar            text,
  ayah_nama         text,
  ibu_nama          text,
  tahfidz_target    smallint default 0,
  tahfidz_progress  numeric(4,1) default 0,
  violation_points  smallint default 0,
  created_at        timestamptz not null default now(),
  unique (class_id, no_absen)
);

create index on public.students (class_id);

create table public.assessments (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references public.subjects(id) on delete cascade,
  title       text not null,
  category    text not null check (category in ('tugas','kuis','pts','pas')),
  weight      smallint not null,
  created_at  timestamptz not null default now()
);

create index on public.assessments (subject_id);

create table public.grades (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.students(id) on delete cascade,
  assessment_id  uuid not null references public.assessments(id) on delete cascade,
  score          numeric(5,2),
  unique (student_id, assessment_id)
);

create index on public.grades (assessment_id);

create table public.attendance (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students(id) on delete cascade,
  subject_id  uuid references public.subjects(id) on delete cascade,
  date        date not null,
  status      text not null check (status in ('H','S','I','A')),
  unique (student_id, subject_id, date)
);

create index on public.attendance (student_id, date);

create table public.anecdotal_notes (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students(id) on delete cascade,
  teacher_id  uuid not null references public.teachers(id) on delete restrict,
  date        date not null,
  category    text not null check (category in ('Positif','Prestasi','Perhatian','Negatif')),
  tag         text not null,
  content     text not null,
  pencatat    text not null,
  created_at  timestamptz not null default now()
);

create index on public.anecdotal_notes (student_id, date desc);

alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.students enable row level security;
alter table public.assessments enable row level security;
alter table public.grades enable row level security;
alter table public.attendance enable row level security;
alter table public.anecdotal_notes enable row level security;
