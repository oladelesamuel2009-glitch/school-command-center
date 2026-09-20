require("dotenv").config();

const express = require("express");
const cors = require("cors");
const supabase = require("./config/supabase");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("School Command Center API is running 🚀");
});

app.get("/test-db", async (req, res) => {
  const { data, error } = await supabase
    .from("schools")
    .select("*");

  if (error) {
    return res.status(500).json({
      message: "Database connection test failed",
      error: error.message
    });
  }

  res.json({
    message: "Database connection works 🚀",
    data
  });
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`School Command Center backend running on port ${PORT}`);
});