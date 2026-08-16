const service = require("../services/scheduleService");
const { success, failure } = require("../utils/response");

async function list(req, res, next) {
  try { return success(res, await service.list(req.query)); } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const { classSubjectId, day, startTime, endTime } = req.body;
    if (!classSubjectId || !day || !startTime || !endTime) {
      return failure(res, "classSubjectId, day, startTime, endTime wajib diisi", 422);
    }
    return success(res, await service.create(req.body), "Jadwal dibuat", 201);
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    return success(res, null, "Jadwal dihapus");
  } catch (err) { return next(err); }
}

module.exports = { list, create, remove };
