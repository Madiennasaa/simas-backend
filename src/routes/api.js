const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/attendance", require("./attendanceRoutes"));
router.use("/academic-years", require("./academicYearRoutes"));
router.use("/classes", require("./classRoutes"));
router.use("/subjects", require("./subjectRoutes"));
router.use("/teachers", require("./teacherRoutes"));
router.use("/students", require("./studentRoutes"));
router.use("/class-subjects", require("./classSubjectRoutes"));
router.use("/schedules", require("./scheduleRoutes"));
router.use("/materials", require("./materialRoutes"));
router.use("/assignments", require("./assignmentRoutes"));
router.use("/grades", require("./gradeRoutes"));
router.use("/announcements", require("./announcementRoutes"));

// Modul lain tinggal ikutin pola di atas :
// router.use("/quizzes", require("./quizRoutes"));
// router.use("/report-cards", require("./reportCardRoutes"));

module.exports = router;
