const { failure } = require("../utils/response");

// Pemakaian: router.post("/", authenticate, authorize("admin", "teacher"), controller)
// Wajib dipasang SETELAH authenticate, karena butuh req.user.role
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return failure(res, "Belum terautentikasi", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return failure(
        res,
        `Role '${req.user.role}' tidak punya akses ke resource ini`,
        403
      );
    }

    next();
  };
}

module.exports = authorize;
