const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const { signToken } = require("../utils/jwt");

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

  // Buang password sebelum dikirim balik ke client
  const { password: _, ...safeUser } = user;

  return { token, user: safeUser };
}

module.exports = { login };
