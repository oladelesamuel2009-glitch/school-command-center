const express = require("express");

const requireAuth = require("../middleware/auth.middleware");

const {
  createClassArm,
  getClassArms,
  updateClassArm,
  deleteClassArm
} = require("../services/class-arm.service");

const router = express.Router();

// Create class arm
router.post(
  "/classes/:classId/arms",
  requireAuth,
  async (req, res) => {
    try {
      const { name } = req.body;

      const classArm = await createClassArm({
        authUserId: req.authUser.id,
        classId: req.params.classId,
        name
      });

      res.status(201).json({
        message: "Class arm created successfully",
        data: classArm
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to create class arm",
        error: error.message
      });
    }
  }
);

// Get class arms
router.get(
  "/classes/:classId/arms",
  requireAuth,
  async (req, res) => {
    try {
      const classArms = await getClassArms({
        authUserId: req.authUser.id,
        classId: req.params.classId
      });

      res.status(200).json({
        message: "Class arms retrieved successfully",
        data: classArms
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to retrieve class arms",
        error: error.message
      });
    }
  }
);

// Update class arm
router.patch(
  "/class-arms/:id",
  requireAuth,
  async (req, res) => {
    try {
      const { name } = req.body;

      const classArm = await updateClassArm({
        authUserId: req.authUser.id,
        classArmId: req.params.id,
        name
      });

      res.status(200).json({
        message: "Class arm updated successfully",
        data: classArm
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to update class arm",
        error: error.message
      });
    }
  }
);

// Delete class arm
router.delete(
  "/class-arms/:id",
  requireAuth,
  async (req, res) => {
    try {
      const result = await deleteClassArm({
        authUserId: req.authUser.id,
        classArmId: req.params.id
      });

      res.status(200).json({
        message: "Class arm deleted successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to delete class arm",
        error: error.message
      });
    }
  }
);

module.exports = router;