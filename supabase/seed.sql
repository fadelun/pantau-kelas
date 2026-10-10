-- frontend/supabase/seed.sql
-- Jalankan sekali di Supabase SQL Editor.
-- Ganti <TEACHER_UUID> dengan UUID dari auth.users (lihat Authentication > Users).

do $$
declare
  v_teacher uuid := '<TEACHER_UUID>';
  v_class   uuid;
begin
  -- teacher profile (sudah dibuat otomatis oleh trigger, tapi pastikan ada)
  insert into public.teachers (id, email, full_name)
  values (v_teacher, 'guru@example.com', 'Ust. Ahmad Fauzi')
  on conflict (id) do nothing;

  -- kelas homeroom 9A
  insert into public.classes (teacher_id, name, grade_level, academic_year)
  values (v_teacher, '9A', 9, '2026/2027')
  returning id into v_class;

  -- 10 siswa
  insert into public.students (class_id, no_absen, name, nisn, parent_phone)
  values
    (v_class, 1,  'Ahmad Fauzan',       '0010042001', '6281210010001'),
    (v_class, 2,  'Aisyah Rahma',       '0010042002', '6281210010002'),
    (v_class, 3,  'Bagas Pratama',      '0010042003', '6281210010003'),
    (v_class, 4,  'Citra Lestari',      '0010042004', '6281210010004'),
    (v_class, 5,  'Daffa Maulana',      '0010042005', '6281210010005'),
    (v_class, 6,  'Hana Zahra',         '0010042006', '6281210010006'),
    (v_class, 7,  'Ilham Ramadhan',     '0010042007', '6281210010007'),
    (v_class, 8,  'Kirana Putri',       '0010042008', '6281210010008'),
    (v_class, 9,  'M. Rizky Hidayat',   '0010042009', '6281210010009'),
    (v_class, 10, 'Nabila Salsabila',   '0010042010', '6281210010010');

  -- 1 subject Matematika di kelas 9A
  insert into public.subjects (class_id, teacher_id, name)
  values (v_class, v_teacher, 'Matematika');
end $$;
