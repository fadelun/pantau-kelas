"use client";

import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getClassStudentCount,
  getStudentsForSubject,
  getSubjectClassNames,
  useMasterData,
  type MasterSubject,
} from "@/lib/master-data";
import type { SchoolClass, Student } from "@/lib/mock-data";

export default function DataMasterPage() {
  return (
    <AppShell>
      {() => <MasterDataBoard />}
    </AppShell>
  );
}

function MasterDataBoard() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Administrasi dasar</p>
        <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight">Data Master</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Kelola kelas perwalian, kelas mapel yang Anda ajar, siswa, dan mata pelajaran dalam satu ruang kerja.</p>
      </header>
      <Tabs defaultValue="students" className="space-y-5">
        <TabsList className="w-full max-w-xl">
          <TabsTrigger value="students">Siswa</TabsTrigger>
          <TabsTrigger value="subjects">Mata Pelajaran</TabsTrigger>
          <TabsTrigger value="classes">Kelas</TabsTrigger>
        </TabsList>
        <TabsContent value="students"><StudentsTab /></TabsContent>
        <TabsContent value="subjects"><SubjectsTab /></TabsContent>
        <TabsContent value="classes"><ClassesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

type ModalProps = { title: string; onClose: () => void; children: React.ReactNode };
function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-xl ring-1 ring-foreground/10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="font-heading text-lg font-bold">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Tutup</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormActions({ onClose, label = "Simpan" }: { onClose: () => void; label?: string }) {
  return <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit">{label}</Button></div>;
}

function StudentsTab() {
  const { classes, students, addStudent, updateStudent, deleteStudent } = useMasterData();
  const [query, setQuery] = useState("");
  const [classId, setClassId] = useState("all");
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const filtered = students.filter((student) => {
    const matchesClass = classId === "all" || student.classId === classId;
    return matchesClass && `${student.name} ${student.nisn}`.toLowerCase().includes(query.toLowerCase());
  });

  return <section className="space-y-4">
    <Toolbar title="Daftar siswa" description={`${students.length} siswa terdaftar`} action={<Button onClick={() => setEditing({ ...emptyStudent(classes[0]?.id ?? "") })}><Plus />Tambah siswa</Button>}>
      <div className="relative min-w-52 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Cari nama atau NISN" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <select className="h-9 rounded-md border border-border bg-background px-3 text-sm" value={classId} onChange={(event) => setClassId(event.target.value)}><option value="all">Semua kelas</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
    </Toolbar>
    <div className="overflow-x-auto rounded-xl bg-card shadow-xs ring-1 ring-foreground/10"><table className="w-full min-w-[720px] text-sm"><thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">No</th><th className="px-4 py-3">Nama</th><th className="px-4 py-3">NISN</th><th className="px-4 py-3">Kelas</th><th className="px-4 py-3">Kontak orang tua</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead><tbody>{filtered.map((student) => <tr key={student.id} className="border-t border-border"><td className="px-4 py-3 tabular-nums">{student.noAbsen}</td><td className="px-4 py-3 font-semibold">{student.name}</td><td className="px-4 py-3 font-mono text-xs tabular-nums">{student.nisn}</td><td className="px-4 py-3">{classes.find((item) => item.id === student.classId)?.name ?? "-"}</td><td className="px-4 py-3 font-mono text-xs tabular-nums">{student.parentPhone}</td><td className="px-4 py-3"><RowActions onEdit={() => setEditing(student)} onDelete={() => setDeleting(student)} /></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState label="Siswa tidak ditemukan." />}</div>
    {editing && <StudentForm value={editing} classes={classes} onClose={() => setEditing(null)} onSubmit={(value) => { if (editing.id) updateStudent(editing.id, value); else addStudent(value); setEditing(null); }} />}
    {deleting && <Confirm title="Hapus siswa?" message={`Data ${deleting.name} akan dihapus dari daftar siswa.`} onClose={() => setDeleting(null)} onConfirm={() => { deleteStudent(deleting.id); setDeleting(null); }} />}
  </section>;
}

function SubjectsTab() {
  const { classes, students, subjects, addSubject, updateSubject, deleteSubject } = useMasterData();
  const [editing, setEditing] = useState<MasterSubject | null>(null);
  const [deleting, setDeleting] = useState<MasterSubject | null>(null);
  return <section className="space-y-4"><Toolbar title="Mata pelajaran" description={`${subjects.length} mata pelajaran terdaftar`} action={<Button onClick={() => setEditing({ id: "", name: "", code: "", classIds: classes[0] ? [classes[0].id] : [] })}><Plus />Tambah mapel</Button>} />
    <div className="grid gap-4 md:grid-cols-2">{subjects.map((subject) => <article key={subject.id} className="rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10"><div className="flex items-start justify-between gap-3"><div><p className="font-heading font-bold">{subject.name}</p><p className="font-mono text-xs text-muted-foreground">{subject.code}</p></div><RowActions onEdit={() => setEditing(subject)} onDelete={() => setDeleting(subject)} /></div><div className="mt-4 flex flex-wrap gap-1.5">{getSubjectClassNames(subject, classes).map((name) => <span key={name} className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{name}</span>)}</div><p className="mt-4 text-sm text-muted-foreground"><span className="font-mono font-semibold tabular-nums text-foreground">{getStudentsForSubject(subject.id, { subjects, students }).length}</span> siswa dari kelas terpilih</p></article>)}{subjects.length === 0 && <EmptyState label="Belum ada mata pelajaran." />}</div>
    {editing && <SubjectForm value={editing} classes={classes} onClose={() => setEditing(null)} onSubmit={(value) => { if (editing.id) updateSubject(editing.id, value); else addSubject(value); setEditing(null); }} />}
    {deleting && <Confirm title="Hapus mata pelajaran?" message={`Data ${deleting.name} akan dihapus.`} onClose={() => setDeleting(null)} onConfirm={() => { deleteSubject(deleting.id); setDeleting(null); }} />}
  </section>;
}

function ClassesTab() {
  const { classes, students, subjects, addClass, updateClass, deleteClass } = useMasterData();
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [error, setError] = useState("");
  return <section className="space-y-4"><Toolbar title="Daftar kelas" description={`${classes.length} konteks kelas tersedia`} action={<Button onClick={() => setEditing({ id: "", name: "", type: "subject", subject: "" })}><Plus />Tambah kelas</Button>} /><div className="grid gap-4 md:grid-cols-2">{classes.map((item) => <article key={item.id} className="rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10"><div className="flex items-start justify-between"><div><p className="font-heading font-bold">{item.name}</p><span className="text-xs text-muted-foreground">{item.type === "homeroom" ? "Kelas perwalian" : `Guru Mapel · ${item.subject}`}</span></div><RowActions onEdit={() => { setError(""); setEditing(item); }} onDelete={() => { const hasStudents = students.some((student) => student.classId === item.id); const hasSubjects = subjects.some((subject) => subject.classIds.includes(item.id)); if (hasStudents || hasSubjects) setError(`Kelas ${item.name} masih memiliki siswa atau mapel terkait. Pindahkan relasi tersebut terlebih dahulu.`); else deleteClass(item.id); }} /></div><p className="mt-4 text-sm text-muted-foreground"><span className="font-mono font-semibold tabular-nums text-foreground">{getClassStudentCount(item.id, students)}</span> siswa terdaftar</p></article>)}{classes.length === 0 && <EmptyState label="Belum ada kelas." />}</div>{error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}{editing && <ClassForm value={editing} onClose={() => setEditing(null)} onSubmit={(value) => { if (editing.id) updateClass(editing.id, value); else addClass(value); setEditing(null); }} />}</section>;
}

function Toolbar({ title, description, action, children }: { title: string; description: string; action: React.ReactNode; children?: React.ReactNode }) { return <div className="flex flex-wrap items-end gap-3"><div className="mr-auto"><h3 className="font-heading text-lg font-bold">{title}</h3><p className="text-sm text-muted-foreground">{description}</p></div>{children}{action}</div>; }
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div className="flex justify-end gap-1"><Button size="icon-sm" variant="ghost" onClick={onEdit} aria-label="Edit"><Pencil /></Button><Button size="icon-sm" variant="ghost" onClick={onDelete} aria-label="Hapus"><Trash2 className="text-destructive" /></Button></div>; }
function EmptyState({ label }: { label: string }) { return <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{label}</p>; }
function Confirm({ title, message, onClose, onConfirm }: { title: string; message: string; onClose: () => void; onConfirm: () => void }) { return <Modal title={title} onClose={onClose}><p className="text-sm text-muted-foreground">{message}</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Batal</Button><Button variant="destructive" onClick={onConfirm}>Hapus</Button></div></Modal>; }

function StudentForm({ value, classes, onClose, onSubmit }: { value: Student; classes: SchoolClass[]; onClose: () => void; onSubmit: (value: Omit<Student, "id">) => void }) { const [form, setForm] = useState(value); return <Modal title={value.id ? "Edit siswa" : "Tambah siswa"} onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); if (!form.name.trim() || !form.classId || !/^\d+$/.test(form.nisn) || form.noAbsen < 1) return; onSubmit(omitId(form)); }} className="space-y-4"><Field label="Nama siswa"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="NISN"><Input required inputMode="numeric" value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })} /></Field><Field label="No. absen"><Input required type="number" min="1" value={form.noAbsen} onChange={(e) => setForm({ ...form, noAbsen: Number(e.target.value) })} /></Field></div><Field label="Kelas"><select required className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Kontak orang tua"><Input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} /></Field><FormActions onClose={onClose} /></form></Modal>; }
function SubjectForm({ value, classes, onClose, onSubmit }: { value: MasterSubject; classes: SchoolClass[]; onClose: () => void; onSubmit: (value: Omit<MasterSubject, "id">) => void }) { const [form, setForm] = useState(value); return <Modal title={value.id ? "Edit mata pelajaran" : "Tambah mata pelajaran"} onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); if (!form.name.trim() || !form.code.trim() || form.classIds.length === 0) return; onSubmit(omitId(form)); }} className="space-y-4"><Field label="Nama mata pelajaran"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Kode"><Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></Field><fieldset><legend className="mb-2 text-sm font-medium">Kelas yang diajar</legend><div className="grid gap-2 sm:grid-cols-2">{classes.map((item) => <label key={item.id} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm"><input type="checkbox" checked={form.classIds.includes(item.id)} onChange={(e) => setForm({ ...form, classIds: e.target.checked ? [...form.classIds, item.id] : form.classIds.filter((id) => id !== item.id) })} />{item.name}</label>)}</div></fieldset><FormActions onClose={onClose} /></form></Modal>; }
function ClassForm({ value, onClose, onSubmit }: { value: SchoolClass; onClose: () => void; onSubmit: (value: Omit<SchoolClass, "id">) => void }) { const [form, setForm] = useState(value); return <Modal title={value.id ? "Edit kelas" : "Tambah kelas"} onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); if (!form.name.trim() || (form.type === "subject" && !form.subject?.trim())) return; const input = omitId(form); onSubmit(form.type === "homeroom" ? { ...input, subject: undefined } : input); }} className="space-y-4"><Field label="Nama kelas"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Jenis kelas"><select className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SchoolClass["type"] })}><option value="homeroom">Kelas perwalian</option><option value="subject">Kelas mapel</option></select></Field>{form.type === "subject" && <Field label="Mata pelajaran"><Input required value={form.subject ?? ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>}<FormActions onClose={onClose} /></form></Modal>; }
function omitId<T extends { id: string }>(value: T): Omit<T, "id"> { const copy = { ...value }; Reflect.deleteProperty(copy, "id"); return copy; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>; }
function emptyStudent(classId: string): Student { return { id: "", classId, noAbsen: 1, name: "", nisn: "", parentPhone: "", tahfidzTarget: 0, emis: "", asrama: "", kamar: "", musyrif: "", ayahNama: "", ibuNama: "", tahfidzProgress: 0, violationPoints: 0 }; }
