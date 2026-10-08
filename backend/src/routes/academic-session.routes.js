const express = require("express");

const requireAuth = require("../middleware/auth.middleware");

const {
  createAcademicSession,
  getAcademicSessions,
  updateAcademicSession,
  deleteAcademicSession
} = require("../services/academic-session.service");

const router = express.Router();


// ========================================
// CREATE ACADEMIC SESSION
// ========================================

router.post(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const {
        name,
        startDate,
        endDate
      } = req.body;

      const session = await createAcademicSession({
        authUserId: req.authUser.id,
        name,
        startDate,
        endDate
      });

      res.status(201).json({
        message: "Academic session created successfully",
        data: session
      });

    } catch (error) {
      res.status(400).json({
        message: "Failed to create academic session",
        error: error.message
      });
    }
  }
);


// ========================================
// GET ACADEMIC SESSIONS
// ========================================

router.get(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const sessions = await getAcademicSessions({
        authUserId: req.authUser.id
      });

      res.status(200).json({
        message: "Academic sessions retrieved successfully",
        data: sessions
      });

    } catch (error) {
      res.status(400).json({
        message: "Failed to retrieve academic sessions",
        error: error.message
      });
    }
  }
);


// ========================================
// UPDATE ACADEMIC SESSION
// ========================================

router.patch(
  "/:id",
  requireAuth,
  async (req, res) => {
    try {
      const {
        name,
        startDate,
        endDate
      } = req.body;

      const session = await updateAcademicSession({
        authUserId: req.authUser.id,
        sessionId: req.params.id,
        name,
        startDate,
        endDate
      });

      res.status(200).json({
        message: "Academic session updated successfully",
        data: session
      });

    } catch (error) {
      res.status(400).json({
        message: "Failed to update academic session",
        error: error.message
      });
    }
  }
);


// ========================================
// DELETE ACADEMIC SESSION
// ========================================

router.delete(
  "/:id",
  requireAuth,
  async (req, res) => {
    try {
      const result = await deleteAcademicSession({
        authUserId: req.authUser.id,
        sessionId: req.params.id
      });

      res.status(200).json({
        message: "Academic session deleted successfully",
        data: result
      });

    } catch (error) {
      res.status(400).json({
        message: "Failed to delete academic session",
        error: error.message
      });
    }
  }
);


module.exports = router;