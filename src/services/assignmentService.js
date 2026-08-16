const prisma = require("../config/db");

async function list(classSubjectId) {
  return prisma.assignment.findMany({
    where: { classSubjectId: Number(classSubjectId) },
    orderBy: { dueDate: "asc" },
  });
}

async function create(data) {
  return prisma.assignment.create({
    data: {
      classSubjectId: Number(data.classSubjectId),
      title: data.title,
      description: data.description || null,
      attachmentUrl: data.attachmentUrl || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });
}

async function update(id, data) {
  return prisma.assignment.update({
    where: { id: Number(id) },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.attachmentUrl !== undefined && { attachmentUrl: data.attachmentUrl }),
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
    },
  });
}

async function remove(id) {
  return prisma.assignment.delete({ where: { id: Number(id) } });
}

module.exports = { list, create, update, remove };
