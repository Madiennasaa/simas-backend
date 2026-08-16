const prisma = require("../config/db");

async function list() {
  return prisma.subject.findMany({ orderBy: { subjectName: "asc" } });
}

async function create(data) {
  return prisma.subject.create({
    data: {
      subjectName: data.subjectName,
      type: data.type,
      kkm: data.kkm ? Number(data.kkm) : 70,
    },
  });
}

async function update(id, data) {
  const subjectId = Number(id);
  return prisma.subject.update({
    where: { id: subjectId },
    data: {
      ...(data.subjectName && { subjectName: data.subjectName }),
      ...(data.type && { type: data.type }),
      ...(data.kkm && { kkm: Number(data.kkm) }),
    },
  });
}

async function remove(id) {
  return prisma.subject.delete({ where: { id: Number(id) } });
}

module.exports = { list, create, update, remove };