const prisma = require("../config/db");

async function list() {
  return prisma.class.findMany({
    include: {
      homeroomTeacher: {
        include: {
          user: {
            select: { id: true, username: true, name: true, phoneNumber: true },
          },
        },
      },
      _count: { select: { students: true } },
    },
    orderBy: [{ gradeLevel: "asc" }, { className: "asc" }],
  });
}

async function create(data) {
  return prisma.class.create({
    data: {
      className: data.className,
      gradeLevel: Number(data.gradeLevel),
      phase: data.phase,
      homeroomTeacherId: data.homeroomTeacherId ? Number(data.homeroomTeacherId) : null,
    },
  });
}

async function update(id, data) {
  const classId = Number(id);
  const existing = await prisma.class.findUnique({ where: { id: classId } });
  if (!existing) {
    const err = new Error("Kelas tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  return prisma.class.update({
    where: { id: classId },
    data: {
      ...(data.className && { className: data.className }),
      ...(data.gradeLevel && { gradeLevel: Number(data.gradeLevel) }),
      ...(data.phase && { phase: data.phase }),
      ...(data.homeroomTeacherId !== undefined && {
        homeroomTeacherId: data.homeroomTeacherId ? Number(data.homeroomTeacherId) : null,
      }),
    },
  });
}

async function remove(id) {
  return prisma.class.delete({ where: { id: Number(id) } });
}

module.exports = { list, create, update, remove };