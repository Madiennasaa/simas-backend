const prisma = require("../config/db");

// Input nilai per kelas sekaligus (mirip pola attendance), guru pilih scoreType
// (task_manual/cbt/uts/uas). Kalau task_manual, assignmentId opsional dikaitkan.
async function bulkCreate(classSubjectId, scoreType, records, assignmentId) {
  const classSubject = await prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    include: { academicYear: true },
  });

  if (!classSubject) {
    const err = new Error("Kelas/mapel tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  if (classSubject.academicYear.isLocked) {
    const err = new Error("Semester ini sudah dikunci, tidak bisa input nilai baru");
    err.statusCode = 403;
    throw err;
  }

  const validStudents = await prisma.student.findMany({
    where: { classId: classSubject.classId },
    select: { id: true },
  });
  const validStudentIds = new Set(validStudents.map((s) => s.id));
  const invalidIds = records.map((r) => r.studentId).filter((id) => !validStudentIds.has(id));
  if (invalidIds.length > 0) {
    const err = new Error(`Siswa dengan ID ${invalidIds.join(", ")} bukan bagian dari kelas ini`);
    err.statusCode = 422;
    throw err;
  }

  return prisma.$transaction(
    records.map((r) =>
      prisma.grade.create({
        data: {
          studentId: r.studentId,
          classSubjectId,
          assignmentId: assignmentId || null,
          scoreType,
          score: r.score,
          note: r.note || null,
        },
      })
    )
  );
}

// Dipakai siswa: lihat nilai diri sendiri
async function findByStudent(studentId, academicYearId) {
  return prisma.grade.findMany({
    where: { studentId, classSubject: { academicYearId } },
    include: { classSubject: { include: { subject: true } }, assignment: true },
    orderBy: { id: "desc" },
  });
}

// Dipakai guru: rekap nilai satu kelas/mapel per jenis nilai
async function findByClassSubject(classSubjectId, scoreType) {
  return prisma.grade.findMany({
    where: { classSubjectId, ...(scoreType && { scoreType }) },
    include: { student: { include: { user: true } }, assignment: true },
    orderBy: { studentId: "asc" },
  });
}

module.exports = { bulkCreate, findByStudent, findByClassSubject };
