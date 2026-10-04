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

function createStudents(classId: string, nisnOffset: number): Student[] {
  return studentNames.map((name, index) => ({
    id: `${classId}-student-${index + 1}`,
    classId,
    noAbsen: index + 1,
    name,
    nisn: `00${nisnOffset + index + 1}42${String(index + 1).padStart(4, "0")}`,
    parentPhone: parentPhones[index],
    tahfidzTarget: [3, 5, 2, 4, 6, 3, 5, 2, 4, 6][index],
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

export function getStudentGrades(studentId: string) {
  return grades.filter((grade) => grade.studentId === studentId);
}

export function getStudentAttendance(studentId: string) {
  return attendance.filter((record) => record.studentId === studentId);
}
