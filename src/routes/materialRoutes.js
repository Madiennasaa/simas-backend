const express = require("express");
const router = express.Router();
const controller = require("../controllers/materialController");
const authenticate = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.use(authenticate);
router.get("/", controller.list); // guru & siswa boleh lihat (siswa buat belajar)
router.post("/", authorize("teacher"), controller.create);
router.put("/:id", authorize("teacher"), controller.update);
router.delete("/:id", authorize("teacher"), controller.remove);

module.exports = router;
