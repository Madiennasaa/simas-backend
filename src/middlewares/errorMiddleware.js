const { failure } = require("../utils/response");

// Dipasang paling akhir di app.js. Nangkep semua error yang di-throw
// atau dipanggil lewat next(err) di controller/service.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Prisma unique constraint violation
  if (err.code === "P2002") {
    return failure(res, `Data sudah ada (duplikat pada: ${err.meta?.target})`, 409);
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return failure(res, "Data tidak ditemukan", 404);
  }

  return failure(res, err.message || "Terjadi kesalahan pada server", 500);
}

module.exports = errorHandler;
