// Konfigurasi JWT terpusat di sini. Konsumsi env var sekali di tempat ini,
// biar utils/jwt.js dan bagian lain tinggal import konstanta, bukan process.env langsung.
module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
