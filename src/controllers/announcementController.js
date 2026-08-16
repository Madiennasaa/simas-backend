const service = require("../services/announcementService");
const { success, failure } = require("../utils/response");

async function list(req, res, next) {
  try { return success(res, await service.list(req.user.role)); } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const { title, content } = req.body;
    if (!title || !content) return failure(res, "title dan content wajib diisi", 422);
    return success(res, await service.create(req.body), "Pengumuman dibuat", 201);
  } catch (err) { return next(err); }
}

async function update(req, res, next) {
  try {
    return success(res, await service.update(req.params.id, req.body), "Pengumuman diperbarui");
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    return success(res, null, "Pengumuman dihapus");
  } catch (err) { return next(err); }
}

module.exports = { list, create, update, remove };
