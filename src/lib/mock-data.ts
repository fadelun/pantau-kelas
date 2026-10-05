export type ClassType = "homeroom" | "subject";
export type AttendanceStatus = "H" | "S" | "I" | "A";

export type SchoolClass = {
  id: string;
  name: string;
  type: ClassType;
  subject?: string;
};

export type Student = {
  id: string;
  classId: string;
  noAbsen: number;
  name: string;
  nisn: string;
  parentPhone: string;
  tahfidzTarget: number;
  emis: string;
  asrama: string;
  kamar: string;
  musyrif: string;
  ayahNama: string;
  ibuNama: string;
  tahfidzProgress: number;
  violationPoints: number;
};

export type Assessment = {
  id: string;
  classId: string;
  title: string;
  category: "tugas" | "kuis" | "pts" | "pas";
  weight: number;
};

export type Grade = {
  studentId: string;
  assessmentId: string;
  score: number;
};

export type AttendanceRecord = {
  studentId: string;
  date: string;
  status: AttendanceStatus;
};

export const classes: SchoolClass[] = [
  { id: "class-9a", name: "9A", type: "homeroom" },
  { id: "class-8b-fiqih", name: "8B - Fiqih", type: "subject", subject: "Fiqih" },
];

const studentNames = [
  "Ahmad Fauzan",
  "Aisyah Rahma",
  "Bagas Pratama",
  "Citra Lestari",
  "Daffa Maulana",
  "Hana Zahra",
  "Ilham Ramadhan",
  "Kirana Putri",
  "M. Rizky Hidayat",
  "Nabila Salsabila",
];

const parentPhones = [
  "6281210010001",
  "6281210010002",
  "6281210010003",
  "6281210010004",
  "6281210010005",
  "6281210010006",
  "6281210010007",
  "6281210010008",
  "6281210010009",
  "6281210010010",
];

const ayahNames = [
  "H. Bambang Sutrisno", "Ahmad Yusuf", "Sutrisno Ali", "H. Mahmud Karim",
  "Rahmat Hidayat", "Sulaiman A.", "H. Abdullah S.", "Zainal Arifin",
  "Hasan Basri", "M. Nur Hidayat",
];

const ibuNames = [
  "Hj. Nurul Hidayati", "Siti Aminah", "Dewi Kartika", "Hj. Fatimah",
  "Rina Marlina", "Sri Wahyuni", "Hj. Aisyah", "Lilis Suryani",
  "Umi Kulsum", "Nia Kurnia",
];

function createStudents(classId: string, nisnOffset: number): Student[] {
  return studentNames.map((name, index) => ({
    id: `${classId}-student-${index + 1}`,
    classId,
    noAbsen: index + 1,
    name,
    nisn: `00${nisnOffset + index + 1}42${String(index + 1).padStart(4, "0")}`,
    parentPhone: parentPhones[index],
    tahfidzTarget: [3, 5, 2, 4, 6, 3, 5, 2, 4, 6][index],
    emis: `3171${String(nisnOffset).padStart(3, "0")}${String(index + 1).padStart(2, "0")}`,
    asrama: "Asrama Putra Al-Ghazali",
    kamar: `Lt. 2 - Kamar ${String(index + 1).padStart(2, "0")}`,
    musyrif: "Ust. Fauzi",
    ayahNama: ayahNames[index],
    ibuNama: ibuNames[index],
    tahfidzProgress: [2.8, 4.5, 1.6, 3.2, 5.2, 2.1, 4.4, 1.5, 3.3, 5.5][index],
    violationPoints: [0, 0, 10, 0, 5, 0, 0, 15, 0, 0][index],
  }));
}

export const students: Student[] = [
  ...createStudents("class-9a", 100),
  ...createStudents("class-8b-fiqih", 200),
];

export const assessments: Assessment[] = [
  { id: "assessment-tugas-1", classId: "class-9a", title: "Tugas 1", category: "tugas", weight: 20 },
  { id: "assessment-kuis-1", classId: "class-9a", title: "Kuis 1", category: "kuis", weight: 20 },
  { id: "assessment-pts", classId: "class-9a", title: "PTS", category: "pts", weight: 30 },
  { id: "assessment-pas", classId: "class-9a", title: "PAS", category: "pas", weight: 30 },
];

export const grades: Grade[] = students.flatMap((student, studentIndex) =>
  assessments.map((assessment, assessmentIndex) => ({
    studentId: student.id,
    assessmentId: assessment.id,
    score: 68 + ((studentIndex * 7 + assessmentIndex * 5) % 28),
  })),
);

const attendanceStatuses: AttendanceStatus[] = ["H", "H", "H", "H", "H", "S", "I", "A"];

export const attendance: AttendanceRecord[] = students.flatMap((student, studentIndex) =>
  Array.from({ length: 10 }, (_, dayIndex) => ({
    studentId: student.id,
    date: `2026-10-${String(dayIndex + 1).padStart(2, "0")}`,
    status: attendanceStatuses[(studentIndex + dayIndex) % attendanceStatuses.length],
  })),
);

export type AnecdotalCategory = "Positif" | "Prestasi" | "Perhatian" | "Negatif";

export type AnecdotalNote = {
  id: string;
  studentId: string;
  date: string;
  category: AnecdotalCategory;
  tag: string;
  content: string;
  pencatat: string;
};

export const anecdotalNotes: AnecdotalNote[] = [
  { id: "note-1", studentId: "class-9a-student-1", date: "2026-10-03", category: "Positif", tag: "Kedisiplinan", content: "Datang lebih awal ke madrasah selama seminggu dan memimpin barisan pagi dengan tertib.", pencatat: "Ust. Fauzi (Musyrif)" },
  { id: "note-2", studentId: "class-9a-student-1", date: "2026-09-28", category: "Prestasi", tag: "Tahfidz", content: "Menyelesaikan ziyadah 0.5 juz dan mendapat predikat Mumtaz pada tasmi'.", pencatat: "Tim Kesiswaan" },
  { id: "note-3", studentId: "class-9a-student-1", date: "2026-09-20", category: "Perhatian", tag: "Akademik", content: "Nilai Matematika menurun; perlu pendampingan belajar tambahan pekan ini.", pencatat: "Wali Kelas" },
  { id: "note-4", studentId: "class-9a-student-2", date: "2026-10-01", category: "Prestasi", tag: "Akademik", content: "Juara 2 lomba Bahasa Arab tingkat madrasah se-kabupaten.", pencatat: "Tim Kesiswaan" },
  { id: "note-5", studentId: "class-9a-student-2", date: "2026-09-25", category: "Positif", tag: "Akhlak", content: "Suka menolong teman yang kesulitan menghafal, sikap santun kepada guru.", pencatat: "Ust. Fauzi (Musyrif)" },
  { id: "note-6", studentId: "class-9a-student-3", date: "2026-09-30", category: "Negatif", tag: "Ketertiban", content: "Terlambat masuk asrama 3 kali pekan ini; telah ditegur musyrif.", pencatat: "Ust. Fauzi (Musyrif)" },
];

export function getStudentNotes(studentId: string) {
  return anecdotalNotes
    .filter((note) => note.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getStudentGrades(studentId: string) {
  return grades.filter((grade) => grade.studentId === studentId);
}

export function getStudentAttendance(studentId: string) {
  return attendance.filter((record) => record.studentId === studentId);
}
