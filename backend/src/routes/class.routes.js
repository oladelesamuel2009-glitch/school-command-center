const express = require("express");

const requireAuth = require("../middleware/auth.middleware");

const {
  createClass,
  getClasses,
  updateClass,
  deleteClass
} = require("../services/class.service");

const router = express.Router();

// Create class
router.post(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const { name } = req.body;

      const classRecord = await createClass({
        authUserId: req.authUser.id,
        name
      });

      res.status(201).json({
        message: "Class created successfully",
        data: classRecord
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to create class",
        error: error.message
      });
    }
  }
);

// Get classes
router.get(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const classes = await getClasses({
        authUserId: req.authUser.id
      });

      res.status(200).json({
        message: "Classes retrieved successfully",
        data: classes
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to retrieve classes",
        error: error.message
      });
    }
  }
);

// Update class
router.patch(
  "/:id",
  requireAuth,
  async (req, res) => {
    try {
      const { name } = req.body;

      const classRecord = await updateClass({
        authUserId: req.authUser.id,
        classId: req.params.id,
        name
      });

      res.status(200).json({
        message: "Class updated successfully",
        data: classRecord
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to update class",
        error: error.message
      });
    }
  }
);

// Delete class
router.delete(
  "/:id",
  requireAuth,
  async (req, res) => {
    try {
      const result = await deleteClass({
        authUserId: req.authUser.id,
        classId: req.params.id
      });

      res.status(200).json({
        message: "Class deleted successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to delete class",
        error: error.message
      });
    }
  }
);

module.exports = router;