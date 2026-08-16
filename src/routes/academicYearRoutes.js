const express = require("express");
const router = express.Router();
const controller = require("../controllers/academicYearController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(authenticate);
router.get("/", controller.list); // semua role boleh lihat (buat filter tahun ajaran)
router.post("/", authorize("admin"), controller.create);
router.patch("/:id/set-active", authorize("admin"), controller.setActive);
router.delete("/:id", authorize("admin"), controller.remove);

module.exports = router;
