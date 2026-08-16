const prisma = require("../config/db");

async function list(filters) {
  return prisma.classSubject.findMany({
    where: {
      classId: filters.classId ? Number(filters.classId) : undefined,
      teacherId: filters.teacherId ? Number(filters.teacherId) : undefined,
      academicYearId: filters.academicYearId ? Number(filters.academicYearId) : undefined,
    },
    include: {
      class: true,
      subject: true,
      teacher: {
        include: {
          // ⚠️ SELECT HANYA FIELD AMAN, SEMBUNYIKAN PASSWORD!
          user: {
            select: { id: true, username: true, name: true, role: true, phoneNumber: true },
          },
        },
      },
      academicYear: true,
    },
    orderBy: { id: "asc" },
  });
}

async function create(data) {
  const classId = Number(data.classId);
  const subjectId = Number(data.subjectId);
  const teacherId = Number(data.teacherId);
  const academicYearId = Number(data.academicYearId);

  // Cegah dobel penugasan
  const existing = await prisma.classSubject.findFirst({
    where: { classId, subjectId, academicYearId },
  });

  if (existing) {
    const err = new Error("Mapel ini di kelas tersebut sudah punya guru pengampu pada tahun ajaran ini");
    err.statusCode = 409;
    throw err;
  }

  return prisma.classSubject.create({
    data: { classId, subjectId, teacherId, academicYearId },
  });
}

async function remove(id) {
  return prisma.classSubject.delete({ where: { id: Number(id) } });
}

module.exports = { list, create, remove };