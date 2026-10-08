require("dotenv").config();

const subjectRoutes = require("./routes/subject.routes");
const classArmSubjectRoutes =
  require("./routes/class-arm-subject.routes");
const classArmRoutes = require("./routes/class-arm.routes");
const classRoutes = require("./routes/class.routes");
const termRoutes = require("./routes/term.routes");
const academicSessionRoutes =
  require("./routes/academic-session.routes");
const userRoutes = require("./routes/user.routes");
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
app.use("/api/users", userRoutes);
app.use(
  "/api/academic-sessions",
  academicSessionRoutes
);
app.use("/api/", termRoutes);
app.use("/api/classes", classRoutes);
app.use("/api", classArmRoutes);
app.use("/api", classArmSubjectRoutes);
app.use("/api/subjects", subjectRoutes);
app.listen(PORT, () => {
  console.log(`School Command Center backend running on port ${PORT}`);
});