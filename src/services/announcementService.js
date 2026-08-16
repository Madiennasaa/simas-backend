const prisma = require("../config/db");

// Filter berdasarkan target_role: 'all' selalu ditampilin ke siapa pun,
// plus role spesifik si penanya.
async function list(role) {
  return prisma.announcement.findMany({
    where: { OR: [{ targetRole: "all" }, { targetRole: role }] },
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
