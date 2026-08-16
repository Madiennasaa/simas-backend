const express = require("express");
const router = express.Router();
const controller = require("../controllers/scheduleController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(authenticate);
router.get("/", controller.list); // semua role boleh lihat jadwal
router.post("/", authorize("admin"), controller.create);
router.delete("/:id", authorize("admin"), controller.remove);

module.exports = router;
