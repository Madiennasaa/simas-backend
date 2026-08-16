const bcrypt = require("bcrypt");
const prisma = require("../config/db");

async function list(classId) {
  return prisma.student.findMany({
    where: classId ? { classId: Number(classId) } : undefined,
    include: {
      // ⚠️ SEMBUNYIKAN HASH PASSWORD DARI RESPONSE LIST SISWA
      user: {
        select: { id: true, username: true, name: true, role: true, phoneNumber: true },
      },
      class: true,
    },
    orderBy: { id: "asc" },
  });
}

async function create(data) {
  // 1. Cek duplikasi Username
  const existingUser = await prisma.user.findUnique({ where: { username: data.username } });
  if (existingUser) {
    const err = new Error("Username sudah digunakan");
    err.statusCode = 409;
    throw err;
  }

  // 2. Cek duplikasi NISN
  const existingNisn = await prisma.student.findUnique({ where: { nisn: data.nisn } });
  if (existingNisn) {
    const err = new Error("NISN sudah terdaftar");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      name: data.name,
      role: "student",
      phoneNumber: data.phoneNumber || null,
      student: {
        create: {
          nisn: data.nisn,
          classId: Number(data.classId),
        },
      },
    },
    include: {
      student: true,
    },
  });
}

async function update(studentId, data) {
  const sId = Number(studentId);
  const student = await prisma.student.findUnique({ where: { id: sId } });
  
  if (!student) {
    const err = new Error("Siswa tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    // Partial update buat User
    await tx.user.update({
      where: { id: student.userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
      },
    });

    // Partial update buat Student
    return tx.student.update({
      where: { id: sId },
      data: {
        ...(data.nisn && { nisn: data.nisn }),
        ...(data.classId && { classId: Number(data.classId) }),
      },
      include: {
        user: {
          select: { id: true, username: true, name: true, role: true, phoneNumber: true },
        },
        class: true,
      },
    });
  });
}

async function remove(studentId) {
  const sId = Number(studentId);
  const student = await prisma.student.findUnique({ where: { id: sId } });
  
  if (!student) {
    const err = new Error("Siswa tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  // Menghapus User otomatis menghapus Student (Cascade Delete)
  return prisma.user.delete({ where: { id: student.userId } });
}

module.exports = { list, create, update, remove };