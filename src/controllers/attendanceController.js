const attendanceService = require("../services/attendanceService");
const prisma = require("../config/db");
const { success, failure } = require("../utils/response");

// POST /api/attendance  (role: teacher)
async function create(req, res, next) {
  try {
    const { classSubjectId, date, records } = req.body;

    if (!classSubjectId || !date || !Array.isArray(records) || records.length === 0) {
      return failure(res, "classSubjectId, date, dan records wajib diisi", 422);
    }

    // Pastikan guru yang login memang pengampu class_subject ini
    const classSubject = await prisma.classSubject.findUnique({
      where: { id: classSubjectId },
      include: { teacher: true },
    });

    if (!classSubject || classSubject.teacher.userId !== req.user.userId) {
      return failure(res, "Anda tidak mengajar kelas/mapel ini", 403);
    }

    const result = await attendanceService.bulkCreate(classSubjectId, date, records);
    return success(res, result, "Absensi berhasil disimpan", 201);
  } catch (err) {
    return next(err);
  }
}

// GET /api/attendance/me  (role: student)
async function myAttendance(req, res, next) {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) return failure(res, "Data siswa tidak ditemukan", 404);

    const academicYearId = Number(req.query.academicYearId);
    const result = await attendanceService.findByStudent(student.id, academicYearId);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

// GET /api/attendance/child/:studentId  (role: parent)
async function childAttendance(req, res, next) {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user.userId } });
    if (!parent) return failure(res, "Data wali murid tidak ditemukan", 404);

    const studentId = Number(req.params.studentId);

    // Pastikan siswa ini memang anaknya, bukan asal tebak ID
    const relation = await prisma.parentStudent.findUnique({
      where: { parentId_studentId: { parentId: parent.id, studentId } },
    });
    if (!relation) return failure(res, "Anda tidak punya akses ke data siswa ini", 403);

    const academicYearId = Number(req.query.academicYearId);
    const result = await attendanceService.findByStudentForParent(studentId, academicYearId);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

// GET /api/attendance/summary/:classId  (role: headmaster, admin)
async function classSummary(req, res, next) {
  try {
    const classId = Number(req.params.classId);
    const academicYearId = Number(req.query.academicYearId);
    const result = await attendanceService.summaryByClass(classId, academicYearId);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { create, myAttendance, childAttendance, classSummary };
