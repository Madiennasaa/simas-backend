const authService = require("../services/authService");
const { success, failure } = require("../utils/response");

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return failure(res, "Username dan password wajib diisi", 422);
    }

    const result = await authService.login(username, password);
    return success(res, result, "Login berhasil");
  } catch (err) {
    return next(err);
  }
}

// GET /api/auth/me - dipakai Flutter buat cek token masih valid + ambil data user
async function me(req, res, next) {
  try {
    const user = await authService.getById(req.user.userId);
    return success(res, user, "Data user berhasil diambil");
  } catch (err) {
    return next(err);
  }
}

module.exports = { login, me };
