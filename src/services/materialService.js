const prisma = require("../config/db");

async function list(classSubjectId) {
  return prisma.material.findMany({
    where: { classSubjectId: Number(classSubjectId) },
    orderBy: { createdAt: "desc" },
  });
}

async function create(data) {
  return prisma.material.create({
    data: {
      classSubjectId: Number(data.classSubjectId),
      title: data.title,
      description: data.description || null,
      linkUrl: data.linkUrl,
    },
  });
}

async function update(id, data) {
  return prisma.material.update({
    where: { id: Number(id) },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.linkUrl && { linkUrl: data.linkUrl }),
    },
  });
}

async function remove(id) {
  return prisma.material.delete({ where: { id: Number(id) } });
}

module.exports = { list, create, update, remove };