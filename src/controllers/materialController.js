const service = require("../services/materialService");
const prisma = require("../config/db");
const { success, failure } = require("../utils/response");

async function assertOwnership(req, targetClassSubjectId = null) {
  const classSubjectId = targetClassSubjectId || Number(req.body.classSubjectId || req.query.classSubjectId);
  
  if (!classSubjectId || isNaN(classSubjectId)) {
    const err = new Error("classSubjectId tidak valid");
    err.statusCode = 422;
    throw err;
  }

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
    const classSubjectId = Number(req.query.classSubjectId);
    if (!classSubjectId || isNaN(classSubjectId)) {
      return failure(res, "classSubjectId wajib diisi dan berupa angka", 422);
    }
    return success(res, await service.list(classSubjectId));
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
    const id = Number(req.params.id);
    if (isNaN(id)) return failure(res, "ID materi tidak valid", 400);

    // ⚠️ CEK KEPEMILIKAN SEBELUM UPDATE
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) return failure(res, "Materi tidak ditemukan", 404);
    await assertOwnership(req, material.classSubjectId);

    return success(res, await service.update(id, req.body), "Materi diperbarui");
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return failure(res, "ID materi tidak valid", 400);

    // ⚠️ CEK KEPEMILIKAN SEBELUM HAPUS
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) return failure(res, "Materi tidak ditemukan", 404);
    await assertOwnership(req, material.classSubjectId);

    await service.remove(id);
    return success(res, null, "Materi dihapus");
  } catch (err) { return next(err); }
}

module.exports = { list, create, update, remove };