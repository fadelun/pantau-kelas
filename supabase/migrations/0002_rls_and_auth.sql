-- PantauKelas — Task 12: RLS & auth (copy of Supabase migration `setup_rls_and_teacher_trigger`)
-- Drop policy placeholder dashboard, buat profil guru otomatis saat signup,
-- helper akses kelas, dan policy per-tabel (semua `to authenticated`).
-- Anon (belum login) ditolak default oleh RLS — tidak perlu policy anon.

-- 1. Hapus 6 policy placeholder dashboard
drop policy if exists "Allow all for admin students" on public.students;
drop policy if exists "Allow all for admin parents" on public.parents;
drop policy if exists "Allow all for admin subjects" on public.subjects;
drop policy if exists "Allow all for admin attendance" on public.attendance;
drop policy if exists "Allow all for admin grades" on public.grades;
drop policy if exists "Allow all for admin behaviors" on public.behaviors;

-- 2. Profil guru otomatis saat signup (nama fallback: prefix email)
create function public.handle_new_teacher()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.teachers (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_teacher();

-- 3. Helper: boleh akses kelas = wali kelas ATAU guru pengampu di kelas itu
create function public.can_access_class(p_class_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = p_class_id
      and (
        c.homeroom_teacher_id = auth.uid()
        or exists (
          select 1 from public.class_subjects cs
          where cs.class_id = c.id
            and cs.teacher_id = auth.uid()
        )
      )
  );
$$;

-- 4. Policies per tabel (semua `to authenticated`)

-- teachers: profil sendiri
create policy "teachers_select_own" on public.teachers
  for select to authenticated using (id = auth.uid());
create policy "teachers_update_own" on public.teachers
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- classes: baca kelas yang diakses, tulis hanya wali kelasnya
create policy "classes_select_accessible" on public.classes
  for select to authenticated using (can_access_class(id));
create policy "classes_insert_own" on public.classes
  for insert to authenticated with check (homeroom_teacher_id = auth.uid());
create policy "classes_update_own" on public.classes
  for update to authenticated using (homeroom_teacher_id = auth.uid())
  with check (homeroom_teacher_id = auth.uid());
create policy "classes_delete_own" on public.classes
  for delete to authenticated using (homeroom_teacher_id = auth.uid());

-- class_subjects: guru pengampu mengelola; terbaca bagi siapa pun yang mengakses kelas
create policy "class_subjects_select" on public.class_subjects
  for select to authenticated
  using (teacher_id = auth.uid() or can_access_class(class_id));
create policy "class_subjects_insert_own" on public.class_subjects
  for insert to authenticated with check (teacher_id = auth.uid());
create policy "class_subjects_update_own" on public.class_subjects
  for update to authenticated using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
create policy "class_subjects_delete_own" on public.class_subjects
  for delete to authenticated using (teacher_id = auth.uid());

-- subjects: katalog bersama antar guru (MVP satu sekolah)
create policy "subjects_all_authenticated" on public.subjects
  for all to authenticated using (true) with check (true);

-- students: ikut akses kelas
create policy "students_select_accessible" on public.students
  for select to authenticated using (can_access_class(class_id));
create policy "students_write_accessible" on public.students
  for all to authenticated
  using (can_access_class(class_id)) with check (can_access_class(class_id));

-- attendance: ikut akses kelas
create policy "attendance_select_accessible" on public.attendance
  for select to authenticated using (can_access_class(class_id));
create policy "attendance_write_accessible" on public.attendance
  for all to authenticated
  using (can_access_class(class_id)) with check (can_access_class(class_id));

-- assessments: ikut akses kelas
create policy "assessments_select_accessible" on public.assessments
  for select to authenticated using (can_access_class(class_id));
create policy "assessments_write_accessible" on public.assessments
  for all to authenticated
  using (can_access_class(class_id)) with check (can_access_class(class_id));

-- grades: lewat assessment milik kelas yang diakses
create policy "grades_select_accessible" on public.grades
  for select to authenticated
  using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and can_access_class(a.class_id)
    )
  );
create policy "grades_write_accessible" on public.grades
  for all to authenticated
  using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and can_access_class(a.class_id)
    )
  )
  with check (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id and can_access_class(a.class_id)
    )
  );

-- anecdotal_notes: ikut akses kelas siswa (join students)
create policy "anecdotal_select_accessible" on public.anecdotal_notes
  for select to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.id = student_id and can_access_class(s.class_id)
    )
  );
create policy "anecdotal_write_accessible" on public.anecdotal_notes
  for all to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.id = student_id and can_access_class(s.class_id)
    )
  )
  with check (
    exists (
      select 1 from public.students s
      where s.id = student_id and can_access_class(s.class_id)
    )
  );
