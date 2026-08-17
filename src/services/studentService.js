const bcrypt = require("bcrypt");
const prisma = require("../config/db");

async function list(classId) {
  return prisma.student.findMany({
    where: classId ? { classId: Number(classId) } : undefined,
    include: {
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

  // 2. Ambil info kelas untuk validasi NISN requirement
  const klass = await prisma.class.findUnique({ where: { id: Number(data.classId) } });
  if (!klass) {
    const err = new Error("Kelas tidak ditemukan");
    err.statusCode = 422;
    throw err;
  }

  // Bersihkan nilai nisn & phoneNumber
  const cleanNisn = data.nisn && data.nisn.trim() !== "" ? data.nisn.trim() : null;
  const cleanPhone = data.phoneNumber && data.phoneNumber.trim() !== "" ? data.phoneNumber.trim() : null;

  // Jika kelas grade 2 ke atas, NISN wajib
  if ((klass.gradeLevel ?? 0) >= 2 && !cleanNisn) {
    const err = new Error("NISN wajib diisi untuk siswa kelas 2 ke atas");
    err.statusCode = 422;
    throw err;
  }

  // 3. Cek duplikasi NISN hanya jika diberikan
  if (cleanNisn) {
    const existingNisn = await prisma.student.findUnique({ where: { nisn: cleanNisn } });
    if (existingNisn) {
      const err = new Error("NISN sudah terdaftar");
      err.statusCode = 409;
      throw err;
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Gunakan transaksi biar struktur balasan seragam (Object Student)
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name,
        role: "student",
        phoneNumber: cleanPhone,
        student: {
          create: {
            nisn: cleanNisn,
            classId: Number(data.classId),
          },
        },
      },
      include: { student: true },
    });

    // Kembalikan format Student utuh (include user & class)
    return tx.student.findUnique({
      where: { id: user.student.id },
      include: {
        user: {
          select: { id: true, username: true, name: true, role: true, phoneNumber: true },
        },
        class: true,
      },
    });
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

  const cleanNisn = data.nisn !== undefined ? (data.nisn && data.nisn.trim() !== "" ? data.nisn.trim() : null) : undefined;
  const cleanPhone = data.phoneNumber !== undefined ? (data.phoneNumber && data.phoneNumber.trim() !== "" ? data.phoneNumber.trim() : null) : undefined;

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: student.userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(cleanPhone !== undefined && { phoneNumber: cleanPhone }),
      },
    });

    return tx.student.update({
      where: { id: sId },
      data: {
        ...(cleanNisn !== undefined && { nisn: cleanNisn }),
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

  return prisma.user.delete({ where: { id: student.userId } });
}

module.exports = { list, create, update, remove };