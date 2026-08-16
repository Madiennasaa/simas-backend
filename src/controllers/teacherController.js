const service = require("../services/teacherService");
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
    const { username, password, name, teacherType } = req.body;
    if (!username || !password || !name || !teacherType) {
      return failure(res, "username, password, name, teacherType wajib diisi", 422);
    }

    return success(res, await service.create(req.body), "Guru berhasil ditambahkan", 201);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return failure(res, "ID guru tidak valid", 400);

    return success(res, await service.update(id, req.body), "Data guru diperbarui");
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return failure(res, "ID guru tidak valid", 400);

    await service.remove(id);
    return success(res, null, "Guru dihapus");
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };