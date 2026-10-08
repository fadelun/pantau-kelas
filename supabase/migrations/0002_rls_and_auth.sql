-- PantauKelas — Task 12: RLS & auth (untuk schema 0001: subjects per-kelas)
-- Profil guru otomatis saat signup, helper akses kelas, policy per-tabel
-- (semua `to authenticated`). Anon ditolak default oleh RLS.

-- 1. Profil guru otomatis saat signup (email NOT NULL di teachers)
create or replace function public.handle_new_teacher()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.teachers (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_teacher();

-- 2. Helper: boleh akses kelas = wali kelasnya ATAU guru pengampu mapel di kelas itu
create or replace function public.can_access_class(p_class_id uuid)
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
        c.teacher_id = auth.uid()
        or exists (
          select 1 from public.subjects s
          where s.class_id = c.id
            and s.teacher_id = auth.uid()
        )
      )
  );
$$;

-- 3. Policies per tabel

-- teachers: profil sendiri
create policy "teachers_select_own" on public.teachers
  for select to authenticated using (id = auth.uid());
create policy "teachers_update_own" on public.teachers
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- classes: baca kelas yang diakses, tulis hanya wali kelasnya
create policy "classes_select_accessible" on public.classes
  for select to authenticated using (can_access_class(id));
create policy "classes_insert_own" on public.classes
  for insert to authenticated with check (teacher_id = auth.uid());
create policy "classes_update_own" on public.classes
  for update to authenticated using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
create policy "classes_delete_own" on public.classes
  for delete to authenticated using (teacher_id = auth.uid());

-- subjects: tulis hanya guru pengampunya, baca siapa pun yang akses kelasnya
create policy "subjects_select_accessible" on public.subjects
  for select to authenticated
  using (teacher_id = auth.uid() or can_access_class(class_id));
create policy "subjects_insert_own" on public.subjects
  for insert to authenticated with check (teacher_id = auth.uid());
create policy "subjects_update_own" on public.subjects
  for update to authenticated using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
create policy "subjects_delete_own" on public.subjects
  for delete to authenticated using (teacher_id = auth.uid());

-- students: ikut akses kelas
create policy "students_select_accessible" on public.students
  for select to authenticated using (can_access_class(class_id));
create policy "students_write_accessible" on public.students
  for all to authenticated
  using (can_access_class(class_id)) with check (can_access_class(class_id));

-- assessments: lewat subject milik kelas yang diakses
create policy "assessments_select_accessible" on public.assessments
  for select to authenticated
  using (
    exists (
      select 1 from public.subjects s
      where s.id = subject_id and can_access_class(s.class_id)
    )
  );
create policy "assessments_write_accessible" on public.assessments
  for all to authenticated
  using (
    exists (
      select 1 from public.subjects s
      where s.id = subject_id and can_access_class(s.class_id)
    )
  )
  with check (
    exists (
      select 1 from public.subjects s
      where s.id = subject_id and can_access_class(s.class_id)
    )
  );

-- grades: lewat assessment → subject → kelas yang diakses
create policy "grades_select_accessible" on public.grades
  for select to authenticated
  using (
    exists (
      select 1
      from public.assessments a
      join public.subjects s on s.id = a.subject_id
      where a.id = assessment_id and can_access_class(s.class_id)
    )
  );
create policy "grades_write_accessible" on public.grades
  for all to authenticated
  using (
    exists (
      select 1
      from public.assessments a
      join public.subjects s on s.id = a.subject_id
      where a.id = assessment_id and can_access_class(s.class_id)
    )
  )
  with check (
    exists (
      select 1
      from public.assessments a
      join public.subjects s on s.id = a.subject_id
      where a.id = assessment_id and can_access_class(s.class_id)
    )
  );

-- attendance: presensi wali (subject_id null) atau mapel — ikut akses kelas siswa
create policy "attendance_select_accessible" on public.attendance
  for select to authenticated
  using (
    exists (
      select 1 from public.students s
      where s.id = student_id and can_access_class(s.class_id)
    )
  );
create policy "attendance_write_accessible" on public.attendance
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

-- anecdotal_notes: ikut akses kelas siswa
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
