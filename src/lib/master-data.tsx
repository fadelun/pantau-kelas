"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import {
  classes as initialClasses,
  students as initialStudents,
  type SchoolClass,
  type Student,
} from "@/lib/mock-data";

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
  addClass: (input: Omit<SchoolClass, "id">) => void;
  updateClass: (id: string, input: Omit<SchoolClass, "id">) => void;
  deleteClass: (id: string) => void;
  addStudent: (input: Omit<Student, "id">) => void;
  updateStudent: (id: string, input: Omit<Student, "id">) => void;
  deleteStudent: (id: string) => void;
  addSubject: (input: Omit<MasterSubject, "id">) => void;
  updateSubject: (id: string, input: Omit<MasterSubject, "id">) => void;
  deleteSubject: (id: string) => void;
};

const initialSubjects: MasterSubject[] = [
  { id: "subject-fiqih", name: "Fiqih", code: "FQH", classIds: ["class-8b-fiqih"] },
  { id: "subject-matematika", name: "Matematika", code: "MTK", classIds: ["class-9a"] },
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getStudentsForSubject(subjectId: string, state: Pick<MasterDataState, "subjects" | "students">) {
  const subject = state.subjects.find((item) => item.id === subjectId);
  if (!subject) return [];
  const classIds = new Set(subject.classIds);
  return state.students.filter((student) => classIds.has(student.classId));
}

export function getClassStudentCount(classId: string, students: Student[]) {
  return students.filter((student) => student.classId === classId).length;
}

export function getSubjectClassNames(subject: MasterSubject, classes: SchoolClass[]) {
  const names = new Map(classes.map((schoolClass) => [schoolClass.id, schoolClass.name]));
  return subject.classIds.map((classId) => names.get(classId)).filter((name): name is string => Boolean(name));
}

const MasterDataContext = createContext<MasterDataState | null>(null);

export function MasterDataProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState(initialClasses);
  const [students, setStudents] = useState(initialStudents);
  const [subjects, setSubjects] = useState(initialSubjects);

  const value = useMemo<MasterDataState>(() => ({
    classes,
    students,
    subjects,
    addClass: (input) => setClasses((current) => [...current, { ...input, id: createId("class") }]),
    updateClass: (id, input) => setClasses((current) => current.map((item) => item.id === id ? { ...input, id } : item)),
    deleteClass: (id) => setClasses((current) => current.filter((item) => item.id !== id)),
    addStudent: (input) => setStudents((current) => [...current, { ...input, id: createId("student") }]),
    updateStudent: (id, input) => setStudents((current) => current.map((item) => item.id === id ? { ...input, id } : item)),
    deleteStudent: (id) => setStudents((current) => current.filter((item) => item.id !== id)),
    addSubject: (input) => setSubjects((current) => [...current, { ...input, id: createId("subject") }]),
    updateSubject: (id, input) => setSubjects((current) => current.map((item) => item.id === id ? { ...input, id } : item)),
    deleteSubject: (id) => setSubjects((current) => current.filter((item) => item.id !== id)),
  }), [classes, students, subjects]);

  return <MasterDataContext.Provider value={value}>{children}</MasterDataContext.Provider>;
}

export function useMasterData() {
  const value = useContext(MasterDataContext);
  if (!value) throw new Error("useMasterData must be used inside MasterDataProvider");
  return value;
}
