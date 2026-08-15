const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/attendance", require("./attendanceRoutes"));

// Modul lain tinggal ikutin pola authRoutes.js / attendanceRoutes.js :
// router.use("/students", require("./studentRoutes"));
// router.use("/teachers", require("./teacherRoutes"));
// router.use("/schedules", require("./scheduleRoutes"));
// router.use("/grades", require("./gradeRoutes"));
// router.use("/materials", require("./materialRoutes"));
// router.use("/assignments", require("./assignmentRoutes"));
// router.use("/quizzes", require("./quizRoutes"));
// router.use("/announcements", require("./announcementRoutes"));
// router.use("/report-cards", require("./reportCardRoutes"));

module.exports = router;
