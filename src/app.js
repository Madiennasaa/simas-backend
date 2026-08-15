const express = require("express");
const cors = require("cors");
const routes = require("./routes/api");
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors()); // Flutter (mobile) request dari origin beda, buka aja
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ message: "SIMAS API is running" }));
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

app.use(errorHandler); // wajib paling akhir

module.exports = app;
