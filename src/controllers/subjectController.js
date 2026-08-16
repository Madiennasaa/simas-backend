const service = require("../services/subjectService");
const { success, failure } = require("../utils/response");

async function list(req, res, next) {
  try { return success(res, await service.list()); } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const { subjectName, type } = req.body;
    if (!subjectName || !type) return failure(res, "subjectName dan type wajib diisi", 422);
    return success(res, await service.create(req.body), "Mapel dibuat", 201);
  } catch (err) { return next(err); }
}

async function update(req, res, next) {
  try {
    return success(res, await service.update(Number(req.params.id), req.body), "Mapel diperbarui");
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(Number(req.params.id));
    return success(res, null, "Mapel dihapus");
  } catch (err) { return next(err); }
}

module.exports = { list, create, update, remove };
