const express = require("express");
const router = express.Router();
const controller = require("../controllers/classController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(authenticate);
router.get("/", controller.list); // semua role boleh lihat daftar kelas
router.post("/", authorize("admin"), controller.create);
router.put("/:id", authorize("admin"), controller.update);
router.delete("/:id", authorize("admin"), controller.remove);

module.exports = router;
