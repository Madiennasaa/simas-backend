const express = require("express");
const router = express.Router();
const controller = require("../controllers/gradeController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(authenticate);
router.post("/", authorize("teacher"), controller.create);
router.get("/me", authorize("student"), controller.myGrades);
router.get("/child/:studentId", authorize("parent"), controller.childGrades);
router.get("/class-subject/:classSubjectId", authorize("teacher", "admin", "headmaster"), controller.byClassSubject);

module.exports = router;
