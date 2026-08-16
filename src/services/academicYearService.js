const prisma = require("../config/db");

async function list() {
  return prisma.academicYear.findMany({ orderBy: { id: "desc" } });
}

async function create(data) {
  return prisma.academicYear.create({
    data: {
      year: data.year,
      semester: data.semester,
      isActive: false,
      isLocked: false,
    },
  });
}

async function setActive(id) {
  const yearId = Number(id);
  return prisma.$transaction(async (tx) => {
    // Matikan & kunci semua semester lain
    await tx.academicYear.updateMany({
      where: { isActive: true },
      data: { isActive: false, isLocked: true },
    });

    // Aktifkan semester terpilih
    return tx.academicYear.update({
      where: { id: yearId },
      data: { isActive: true, isLocked: false },
    });
  });
}

async function remove(id) {
  return prisma.academicYear.delete({ where: { id: Number(id) } });
}

module.exports = { list, create, setActive, remove };