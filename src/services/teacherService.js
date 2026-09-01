const bcrypt = require("bcrypt");
const prisma = require("../config/db");

async function list() {
  return prisma.teacher.findMany({
    include: {
      // ⚠️ SEMBUNYIKAN HASH PASSWORD
      user: {
        select: { id: true, username: true, name: true, role: true, phoneNumber: true },
      },
      homeroomOfClasses: true,
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

  // 2. Cek duplikasi NIP (jika NIP diisi)
  if (data.nip) {
    const existingNip = await prisma.teacher.findUnique({ where: { nip: data.nip } });
    if (existingNip) {
      const err = new Error("NIP sudah terdaftar");
      err.statusCode = 409;
      throw err;
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      name: data.name,
      role: "teacher",
      phoneNumber: data.phoneNumber || null,
      teacher: {
        create: {
          nip: data.nip || null,
          teacherType: data.teacherType,
        },
      },
    },
    include: {
      teacher: true,
    },
  });

  // ⚠️ Balikin bentuk Teacher (bukan User) biar konsisten sama list()/update()
  // yang dipakai Flutter — sebelumnya balikin User dengan `teacher` nested di
  // dalam, padahal TeacherModel di Flutter ngarepin sebaliknya (`user` nested
  // di dalam Teacher), bikin field userId/nip/teacherType null semua.
  return prisma.teacher.findUnique({
    where: { id: newUser.teacher.id },
    include: {
      user: {
        select: { id: true, username: true, name: true, role: true, phoneNumber: true },
      },
    },
  });
}

async function update(teacherId, data) {
  const tId = Number(teacherId);
  const teacher = await prisma.teacher.findUnique({ where: { id: tId } });
  if (!teacher) {
    const err = new Error("Guru tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: teacher.userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
      },
    });

    return tx.teacher.update({
      where: { id: tId },
      data: {
        ...(data.nip !== undefined && { nip: data.nip || null }),
        ...(data.teacherType && { teacherType: data.teacherType }),
      },
      include: {
        user: {
          select: { id: true, username: true, name: true, role: true, phoneNumber: true },
        },
      },
    });
  });
}

async function remove(teacherId) {
  const tId = Number(teacherId);
  const teacher = await prisma.teacher.findUnique({ where: { id: tId } });
  if (!teacher) {
    const err = new Error("Guru tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }
  return prisma.user.delete({ where: { id: teacher.userId } });
}

module.exports = { list, create, update, remove };
