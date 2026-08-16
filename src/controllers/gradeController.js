const service = require("../services/gradeService");
const prisma = require("../config/db");
const { success, failure } = require("../utils/response");

async function create(req, res, next) {
  try {
    const { classSubjectId, scoreType, records, assignmentId } = req.body;
    if (!classSubjectId || !scoreType || !Array.isArray(records) || records.length === 0) {
      return failure(res, "classSubjectId, scoreType, dan records wajib diisi", 422);
    }

    const classSubject = await prisma.classSubject.findUnique({
      where: { id: classSubjectId },
      include: { teacher: true },
    });
    if (!classSubject || classSubject.teacher.userId !== req.user.userId) {
      return failure(res, "Anda tidak mengajar kelas/mapel ini", 403);
    }

    const result = await service.bulkCreate(classSubjectId, scoreType, records, assignmentId);
    return success(res, result, "Nilai berhasil disimpan", 201);
  } catch (err) { return next(err); }
}

async function myGrades(req, res, next) {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) return failure(res, "Data siswa tidak ditemukan", 404);

    const academicYearId = Number(req.query.academicYearId);
    return success(res, await service.findByStudent(student.id, academicYearId));
  } catch (err) { return next(err); }
}

async function childGrades(req, res, next) {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user.userId } });
    if (!parent) return failure(res, "Data wali murid tidak ditemukan", 404);

    const studentId = Number(req.params.studentId);
    const relation = await prisma.parentStudent.findUnique({
      where: { parentId_studentId: { parentId: parent.id, studentId } },
    });
    if (!relation) return failure(res, "Anda tidak punya akses ke data siswa ini", 403);

    const academicYearId = Number(req.query.academicYearId);
    return success(res, await service.findByStudent(studentId, academicYearId));
  } catch (err) { return next(err); }
}

async function byClassSubject(req, res, next) {
  try {
    const classSubjectId = Number(req.params.classSubjectId);
    return success(res, await service.findByClassSubject(classSubjectId, req.query.scoreType));
  } catch (err) { return next(err); }
}

module.exports = { create, myGrades, childGrades, byClassSubject };
