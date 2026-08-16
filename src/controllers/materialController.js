const service = require("../services/materialService");
const prisma = require("../config/db");
const { success, failure } = require("../utils/response");

// Pastiin guru yang login memang pengampu class_subject ini sebelum ubah data
async function assertOwnership(req) {
  const classSubjectId = Number(req.body.classSubjectId || req.query.classSubjectId);
  const classSubject = await prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    include: { teacher: true },
  });
  if (!classSubject || classSubject.teacher.userId !== req.user.userId) {
    const err = new Error("Anda tidak mengajar kelas/mapel ini");
    err.statusCode = 403;
    throw err;
  }
}

async function list(req, res, next) {
  try {
    if (!req.query.classSubjectId) return failure(res, "classSubjectId wajib diisi", 422);
    return success(res, await service.list(req.query.classSubjectId));
  } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const { classSubjectId, title, linkUrl } = req.body;
    if (!classSubjectId || !title || !linkUrl) {
      return failure(res, "classSubjectId, title, linkUrl wajib diisi", 422);
    }
    await assertOwnership(req);
    return success(res, await service.create(req.body), "Materi berhasil diunggah", 201);
  } catch (err) { return next(err); }
}

async function update(req, res, next) {
  try {
    return success(res, await service.update(req.params.id, req.body), "Materi diperbarui");
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    return success(res, null, "Materi dihapus");
  } catch (err) { return next(err); }
}

module.exports = { list, create, update, remove };
