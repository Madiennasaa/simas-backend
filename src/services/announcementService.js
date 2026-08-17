const prisma = require("../config/db");

async function list(role) {
  const whereCondition = role === "admin" 
    ? {} 
    : { OR: [{ targetRole: "all" }, { targetRole: role }] };

  return prisma.announcement.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
  });
}

async function create(data) {
  return prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      targetRole: data.targetRole || "all",
    },
  });
}

async function update(id, data) {
  return prisma.announcement.update({
    where: { id: Number(id) },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.content && { content: data.content }),
      ...(data.targetRole && { targetRole: data.targetRole }),
    },
  });
}

async function remove(id) {
  return prisma.announcement.delete({ where: { id: Number(id) } });
}

module.exports = { list, create, update, remove };