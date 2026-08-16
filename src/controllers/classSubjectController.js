const service = require("../services/classSubjectService");
const prisma = require("../config/db");
const { success, failure } = require("../utils/response");

async function list(req, res, next) {
  try {
    const filters = { ...req.query };

    // Guru cuma boleh lihat penugasan dirinya sendiri, gak bisa intip guru lain
    if (req.user.role === "teacher") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.userId } });
      filters.teacherId = teacher?.id;
    }

    return success(res, await service.list(filters));
  } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const { classId, subjectId, teacherId, academicYearId } = req.body;
    if (!classId || !subjectId || !teacherId || !academicYearId) {
      return failure(res, "classId, subjectId, teacherId, academicYearId wajib diisi", 422);
    }
    return success(res, await service.create(req.body), "Penugasan guru berhasil dibuat", 201);
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(Number(req.params.id));
    return success(res, null, "Penugasan guru dihapus");
  } catch (err) { return next(err); }
}

module.exports = { list, create, remove };
