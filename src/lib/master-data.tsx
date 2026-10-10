"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchClasses,
  fetchStudents,
  fetchSubjects,
  upsertClass,
  upsertStudent,
  upsertSubject,
  deleteClass as dbDeleteClass,
  deleteStudent as dbDeleteStudent,
  deleteSubject as dbDeleteSubject,
} from "@/lib/supabase/queries";
import type { SchoolClass, Student } from "@/lib/mock-data";

export type MasterSubject = {
  id: string;
  name: string;
  code: string;
  classIds: string[];
};

export type MasterDataState = {
  classes: SchoolClass[];
  students: Student[];
  subjects: MasterSubject[];
  addClass: (input: Omit<SchoolClass, "id">) => Promise<void>;
  updateClass: (id: string, input: Omit<SchoolClass, "id">) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  addStudent: (input: Omit<Student, "id">) => Promise<void>;
  updateStudent: (id: string, input: Omit<Student, "id">) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addSubject: (input: Omit<MasterSubject, "id">) => Promise<void>;
  updateSubject: (id: string, input: Omit<MasterSubject, "id">) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
};

// Helper tetap tersedia untuk consumer yang sudah ada
export function getStudentsForSubject(
  subjectId: string,
  state: Pick<MasterDataState, "subjects" | "students">,
) {
  const subject = state.subjects.find((item) => item.id === subjectId);
  if (!subject) return [];
  const classIds = new Set(subject.classIds);
  return state.students.filter((student) => classIds.has(student.classId));
}

export function getClassStudentCount(classId: string, students: Student[]) {
  return students.filter((student) => student.classId === classId).length;
}

export function getSubjectClassNames(subject: MasterSubject, classes: SchoolClass[]) {
  const names = new Map(classes.map((c) => [c.id, c.name]));
  return subject.classIds
    .map((id) => names.get(id))
    .filter((n): n is string => Boolean(n));
}

const MasterDataContext = createContext<MasterDataState | null>(null);

export function MasterDataProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<MasterSubject[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([fetchClasses(supabase), fetchStudents(supabase), fetchSubjects(supabase)])
      .then(([c, s, sub]) => {
        setClasses(c);
        setStudents(s);
        setSubjects(sub);
      })
      .catch(console.error)
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<MasterDataState>(
    () => ({
      classes,
      students,
      subjects,

      addClass: async (input) => {
        const supabase = createClient();
        const created = await upsertClass(supabase, input);
        setClasses((prev) => [...prev, created]);
      },
      updateClass: async (id, input) => {
        const supabase = createClient();
        const updated = await upsertClass(supabase, input, id);
        setClasses((prev) => prev.map((item) => (item.id === id ? updated : item)));
      },
      deleteClass: async (id) => {
        const supabase = createClient();
        await dbDeleteClass(supabase, id);
        setClasses((prev) => prev.filter((item) => item.id !== id));
      },

      addStudent: async (input) => {
        const supabase = createClient();
        const created = await upsertStudent(supabase, input);
        setStudents((prev) => [...prev, created]);
      },
      updateStudent: async (id, input) => {
        const supabase = createClient();
        const updated = await upsertStudent(supabase, input, id);
        setStudents((prev) => prev.map((item) => (item.id === id ? updated : item)));
      },
      deleteStudent: async (id) => {
        const supabase = createClient();
        await dbDeleteStudent(supabase, id);
        setStudents((prev) => prev.filter((item) => item.id !== id));
      },

      addSubject: async (input) => {
        const supabase = createClient();
        const created = await upsertSubject(supabase, input);
        setSubjects((prev) => [...prev, created]);
      },
      updateSubject: async (id, input) => {
        const supabase = createClient();
        const updated = await upsertSubject(supabase, input, id);
        setSubjects((prev) => prev.map((item) => (item.id === id ? updated : item)));
      },
      deleteSubject: async (id) => {
        const supabase = createClient();
        await dbDeleteSubject(supabase, id);
        setSubjects((prev) => prev.filter((item) => item.id !== id));
      },
    }),
    [classes, students, subjects],
  );

  // Render null saat loading awal agar tidak flash data kosong lalu data DB
  if (!ready) return null;

  return <MasterDataContext.Provider value={value}>{children}</MasterDataContext.Provider>;
}

export function useMasterData() {
  const value = useContext(MasterDataContext);
  if (!value) throw new Error("useMasterData must be used inside MasterDataProvider");
  return value;
}
