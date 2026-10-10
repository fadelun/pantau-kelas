-- NULLS NOT DISTINCT supaya upsert presensi wali (subject_id NULL) tetap menimpa baris hari yang sama.
alter table public.attendance
  drop constraint attendance_student_id_subject_id_date_key;
alter table public.attendance
  add constraint attendance_student_id_subject_id_date_key
  unique nulls not distinct (student_id, subject_id, date);
