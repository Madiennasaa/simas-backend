const service = require("../services/academicYearService");
const { success, failure } = require("../utils/response");

async function list(req, res, next) {
  try {
    return success(res, await service.list());
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { year, semester } = req.body;
    if (!year || !semester) return failure(res, "year dan semester wajib diisi", 422);
    return success(res, await service.create(req.body), "Tahun ajaran dibuat", 201);
  } catch (err) {
    return next(err);
  }
}

async function setActive(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return failure(res, "ID tahun ajaran tidak valid", 400);

    const result = await service.setActive(id);
    return success(res, result, "Semester aktif berhasil diganti, semester lama dikunci");
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return failure(res, "ID tahun ajaran tidak valid", 400);

    await service.remove(id);
    return success(res, null, "Tahun ajaran dihapus");
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, setActive, remove };