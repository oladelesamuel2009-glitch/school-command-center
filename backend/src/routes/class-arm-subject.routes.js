const express = require("express");
const requireAuth = require("../middleware/auth.middleware");

const {
  getClassArmSubjects,
  createClassArmSubject,
  updateClassArmSubject,
  deleteClassArmSubject
} = require("../services/class-arm-subject.service");

const router = express.Router();

router.get(
  "/class-arms/:classArmId/subjects",
  requireAuth,
  async (req, res) => {
    try {
      const data = await getClassArmSubjects({
        authUserId: req.authUser.id,
        classArmId: req.params.classArmId
      });

      res.status(200).json({
        message: "Class arm subjects retrieved successfully",
        data
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to retrieve class arm subjects",
        error: error.message
      });
    }
  }
);

router.post(
  "/class-arms/:classArmId/subjects",
  requireAuth,
  async (req, res) => {
    try {
      const { subjectId, type } = req.body;

      if (!subjectId || !type) {
        return res.status(400).json({
          message: "Subject ID and type are required"
        });
      }

      const data = await createClassArmSubject({
        authUserId: req.authUser.id,
        classArmId: req.params.classArmId,
        subjectId,
        type
      });

      res.status(201).json({
        message: "Subject added to class arm successfully",
        data
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to add subject to class arm",
        error: error.message
      });
    }
  }
);

router.patch(
  "/class-arm-subjects/:id",
  requireAuth,
  async (req, res) => {
    try {
      const { type } = req.body;

      if (!type) {
        return res.status(400).json({
          message: "Type is required"
        });
      }

      const data = await updateClassArmSubject({
        authUserId: req.authUser.id,
        classArmSubjectId: req.params.id,
        type
      });

      res.status(200).json({
        message: "Class arm subject updated successfully",
        data
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to update class arm subject",
        error: error.message
      });
    }
  }
);

router.delete(
  "/class-arm-subjects/:id",
  requireAuth,
  async (req, res) => {
    try {
      const result = await deleteClassArmSubject({
        authUserId: req.authUser.id,
        classArmSubjectId: req.params.id
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: "Failed to remove class arm subject",
        error: error.message
      });
    }
  }
);

module.exports = router;