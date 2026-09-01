const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const { signToken } = require("../utils/jwt");

function formatUserResponse(user) {
  const { password, student, teacher, parent, ...rest } = user;
  return {
    ...rest,
    studentId: student?.id ?? null,
    // Kelas siswa dibutuhkan Flutter buat filter jadwal/materi/tugas/absensi
    // dia sendiri — sebelumnya ke-drop di sini padahal udah di-query di atas.
    classId: student?.classId ?? null,
    className: student?.class?.className ?? null,
    teacherId: teacher?.id ?? null,
    parentId: parent?.id ?? null,
    // Daftar anak buat wali murid pilih mau lihat data siapa.
    children: parent?.children?.map((c) => ({
      id: c.id,
      classId: c.classId,
      name: c.user?.name ?? null,
      className: c.class?.className ?? null,
    })) ?? null,
  };
}

async function login(username, password) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      student: { include: { class: true } },
      teacher: true,
      parent: { include: { children: { include: { user: true, class: true } } } },
    },
  });

  if (!user) {
    const err = new Error("Username atau password salah");
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const err = new Error("Username atau password salah");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    name: user.name,
  });

  return { token, user: formatUserResponse(user) };
}

async function getById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: { include: { class: true } },
      teacher: true,
      parent: { include: { children: { include: { user: true, class: true } } } },
    },
  });

  if (!user) {
    const err = new Error("User tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  return formatUserResponse(user);
}

module.exports = { login, getById };
