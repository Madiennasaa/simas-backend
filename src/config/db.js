const { PrismaClient } = require("@prisma/client");

// Singleton: satu instance dipakai di seluruh app, hindari exhaust koneksi DB
// saat hot-reload di development.
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

module.exports = prisma;
