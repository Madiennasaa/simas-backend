const express = require("express");
const router = express.Router();
const controller = require("../controllers/subjectController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(authenticate);
router.get("/", controller.list);
router.post("/", authorize("admin"), controller.create);
router.put("/:id", authorize("admin"), controller.update);
router.delete("/:id", authorize("admin"), controller.remove);

module.exports = router;
