const express = require("express");
const router = express.Router();
const controller = require("../controllers/attendanceController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(authenticate); // semua route absensi wajib login

router.post("/", authorize("teacher"), controller.create);
router.get("/me", authorize("student"), controller.myAttendance);
router.get("/child/:studentId", authorize("parent"), controller.childAttendance);
router.get("/summary/:classId", authorize("headmaster", "admin"), controller.classSummary);

module.exports = router;
