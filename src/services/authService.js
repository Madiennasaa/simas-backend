const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const { signToken } = require("../utils/jwt");

function formatUserResponse(user) {
  const { password, student, teacher, parent, ...rest } = user;
  return {
    ...rest,
    studentId: student?.id ?? null,
    teacherId: teacher?.id ?? null,
    parentId: parent?.id ?? null,
  };
}

async function login(username, password) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      student: { include: { class: true } },
      teacher: true,
      parent: { include: { children: true } },
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
      parent: { include: { children: true } },
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