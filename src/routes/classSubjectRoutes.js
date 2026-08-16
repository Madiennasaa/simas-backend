const express = require("express");
const router = express.Router();
const controller = require("../controllers/classSubjectController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(authenticate);
router.get("/", authorize("admin", "teacher", "headmaster"), controller.list);
router.post("/", authorize("admin"), controller.create);
router.delete("/:id", authorize("admin"), controller.remove);

module.exports = router;
