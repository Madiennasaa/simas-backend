const service = require("../services/studentService");
const { success, failure } = require("../utils/response");

async function list(req, res, next) {
  try {
    const classId = req.query.classId ? Number(req.query.classId) : undefined;
    return success(res, await service.list(classId));
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { username, password, name, nisn, classId } = req.body;
    if (!username || !password || !name || !classId) {
      return failure(res, "Nama, Username, Password, dan Kelas wajib diisi", 422);
    }
    // service will validate NISN based on class grade level
    return success(res, await service.create(req.body), "Siswa berhasil ditambahkan", 201);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return failure(res, "ID siswa tidak valid", 400);

    return success(res, await service.update(id, req.body), "Data siswa diperbarui");
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return failure(res, "ID siswa tidak valid", 400);

    await service.remove(id);
    return success(res, null, "Siswa dihapus");
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };