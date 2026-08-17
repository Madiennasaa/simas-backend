const prisma = require("../config/db");

async function bulkCreate(classSubjectId, scoreType, records, assignmentId) {
  const cSubId = Number(classSubjectId);
  const assignId = assignmentId ? Number(assignmentId) : null;

  const classSubject = await prisma.classSubject.findUnique({
    where: { id: cSubId },
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
      prisma.grade.upsert({
        where: {
          studentId_classSubjectId_scoreType_assignmentId: {
            studentId: Number(r.studentId),
            classSubjectId: cSubId,
            scoreType,
            assignmentId: assignId,
          },
        },
        update: {
          score: Number(r.score),
          note: r.note || null,
        },
        create: {
          studentId: Number(r.studentId),
          classSubjectId: cSubId,
          assignmentId: assignId,
          scoreType,
          score: Number(r.score),
          note: r.note || null,
        },
      })
    )
  );
}

async function findByStudent(studentId, academicYearId) {
  return prisma.grade.findMany({
    where: {
      studentId: Number(studentId),
      ...(academicYearId && { classSubject: { academicYearId: Number(academicYearId) } }),
    },
    include: {
      classSubject: { include: { subject: true } },
      assignment: true,
    },
    orderBy: { id: "desc" },
  });
}

async function findByClassSubject(classSubjectId, scoreType) {
  return prisma.grade.findMany({
    where: {
      classSubjectId: Number(classSubjectId),
      ...(scoreType && { scoreType }),
    },
    include: {
      student: {
        include: {
          user: {
            select: { id: true, username: true, name: true, phoneNumber: true },
          },
        },
      },
      assignment: true,
    },
    orderBy: { studentId: "asc" },
  });
}

module.exports = { bulkCreate, findByStudent, findByClassSubject };