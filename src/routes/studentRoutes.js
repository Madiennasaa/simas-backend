const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(authenticate);
// admin kelola semua, guru/kepsek boleh lihat (misal buat ngisi absensi/nilai)
router.get("/", authorize("admin", "teacher", "headmaster"), controller.list);
router.post("/", authorize("admin"), controller.create);
router.put("/:id", authorize("admin"), controller.update);
router.delete("/:id", authorize("admin"), controller.remove);

module.exports = router;
