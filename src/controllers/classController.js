const service = require("../services/classService");
const { success, failure } = require("../utils/response");

async function list(req, res, next) {
  try { return success(res, await service.list()); } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const { className, gradeLevel, phase } = req.body;
    if (!className || !gradeLevel || !phase) {
      return failure(res, "className, gradeLevel, dan phase wajib diisi", 422);
    }
    return success(res, await service.create(req.body), "Kelas dibuat", 201);
  } catch (err) { return next(err); }
}

async function update(req, res, next) {
  try {
    return success(res, await service.update(Number(req.params.id), req.body), "Kelas diperbarui");
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(Number(req.params.id));
    return success(res, null, "Kelas dihapus");
  } catch (err) { return next(err); }
}

module.exports = { list, create, update, remove };
