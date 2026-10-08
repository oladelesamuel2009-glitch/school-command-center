const express = require("express");

const requireAuth = require("../middleware/auth.middleware");

const {
  createTerm,
  getTerms,
  updateTerm,
  deleteTerm
} = require("../services/term.service");

const router = express.Router();

// Create term
router.post(
  "/academic-sessions/:sessionId/terms",
  requireAuth,
  async (req, res) => {
    try {
      const {
        name,
        startDate,
        endDate
      } = req.body;

      const term = await createTerm({
        authUserId: req.authUser.id,
        sessionId: req.params.sessionId,
        name,
        startDate,
        endDate
      });

      res.status(201).json({
        message: "Term created successfully",
        data: term
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to create term",
        error: error.message
      });
    }
  }
);

// Get terms for an academic session
router.get(
  "/academic-sessions/:sessionId/terms",
  requireAuth,
  async (req, res) => {
    try {
      const terms = await getTerms({
        authUserId: req.authUser.id,
        sessionId: req.params.sessionId
      });

      res.status(200).json({
        message: "Terms retrieved successfully",
        data: terms
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to retrieve terms",
        error: error.message
      });
    }
  }
);

// Update term
router.patch(
  "/terms/:id",
  requireAuth,
  async (req, res) => {
    try {
      const {
        name,
        startDate,
        endDate
      } = req.body;

      const term = await updateTerm({
        authUserId: req.authUser.id,
        termId: req.params.id,
        name,
        startDate,
        endDate
      });

      res.status(200).json({
        message: "Term updated successfully",
        data: term
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to update term",
        error: error.message
      });
    }
  }
);

// Delete term
router.delete(
  "/terms/:id",
  requireAuth,
  async (req, res) => {
    try {
      const result = await deleteTerm({
        authUserId: req.authUser.id,
        termId: req.params.id
      });

      res.status(200).json({
        message: "Term deleted successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to delete term",
        error: error.message
      });
    }
  }
);

module.exports = router;