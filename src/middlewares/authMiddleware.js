const { verifyToken } = require("../utils/jwt");
const { failure } = require("../utils/response");

// Flutter kirim header: Authorization: Bearer <token>
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return failure(res, "Token tidak ditemukan, silakan login ulang", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    // decoded berisi: { userId, role, name }
    req.user = decoded;
    next();
  } catch (err) {
    return failure(res, "Token tidak valid atau sudah kedaluwarsa", 401);
  }
}

module.exports = authenticate;
