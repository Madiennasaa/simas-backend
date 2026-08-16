const prisma = require("../config/db");

async function list(filters) {
  return prisma.schedule.findMany({
    where: {
      classSubjectId: filters.classSubjectId ? Number(filters.classSubjectId) : undefined,
      classSubject: filters.classId ? { classId: Number(filters.classId) } : undefined,
    },
    include: { classSubject: { include: { class: true, subject: true, teacher: { include: { user: true } } } } },
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });
}

async function create(data) {
  // Cegah bentrok jadwal: guru yang sama gak boleh punya 2 jadwal di hari & jam yang tumpang tindih
  const classSubject = await prisma.classSubject.findUnique({ where: { id: Number(data.classSubjectId) } });
  if (!classSubject) {
    const err = new Error("Kelas/mapel tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  const teacherSchedules = await prisma.schedule.findMany({
    where: { day: data.day, classSubject: { teacherId: classSubject.teacherId } },
  });

  const newStart = data.startTime;
  const newEnd = data.endTime;
  const isOverlap = teacherSchedules.some((s) => {
    const existingStart = s.startTime.toISOString().substr(11, 8);
    const existingEnd = s.endTime.toISOString().substr(11, 8);
    return newStart < existingEnd && newEnd > existingStart;
  });

  if (isOverlap) {
    const err = new Error("Guru ini sudah punya jadwal lain yang bentrok pada hari dan jam tersebut");
    err.statusCode = 409;
    throw err;
  }

  return prisma.schedule.create({
    data: {
      classSubjectId: Number(data.classSubjectId),
      day: data.day,
      startTime: new Date(`1970-01-01T${data.startTime}`),
      endTime: new Date(`1970-01-01T${data.endTime}`),
    },
  });
}

async function remove(id) {
  return prisma.schedule.delete({ where: { id: Number(id) } });
}

module.exports = { list, create, remove };
