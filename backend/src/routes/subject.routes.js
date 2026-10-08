const express = require("express");

const {
  getSubjects,
  createSubject,
  updateSubject,
  setSubjectActiveStatus
} = require("../services/subject.service");

const requireAuth = require("../middleware/auth.middleware");

const router = express.Router();

// GET /api/subjects
// Returns active subjects by default.
// Add ?includeInactive=true to return active + inactive subjects.
router.get("/", requireAuth, async (req, res) => {
  try {
    const includeInactive =
      req.query.includeInactive === "true";

    const subjects = await getSubjects(
      req.authUser.id,
      includeInactive
    );

    res.json({
      message: "Subjects retrieved successfully",
      data: subjects
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to retrieve subjects",
      error: error.message
    });
  }
});

// POST /api/subjects
router.post("/", requireAuth, async (req, res) => {
  try {
    const subject = await createSubject(
      req.authUser.id,
      req.body
    );

    res.status(201).json({
      message: "Subject created successfully",
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create subject",
      error: error.message
    });
  }
});

// PATCH /api/subjects/:id
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const subject = await updateSubject(
      req.authUser.id,
      req.params.id,
      req.body
    );

    res.json({
      message: "Subject updated successfully",
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update subject",
      error: error.message
    });
  }
});

// PATCH /api/subjects/:id/status
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const subject = await setSubjectActiveStatus(
      req.authUser.id,
      req.params.id,
      req.body.active
    );

    res.json({
      message: "Subject status updated successfully",
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update subject status",
      error: error.message
    });
  }
});

module.exports = router;