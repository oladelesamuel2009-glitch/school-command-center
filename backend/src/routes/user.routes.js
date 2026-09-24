const express = require("express");

const requireAuth = require("../middleware/auth.middleware");

const {
  createStaffInvitation
} = require("../services/user.service");

const {
  acceptStaffInvitation
} = require("../services/invitations.service");

const router = express.Router();


// ========================================
// CREATE STAFF INVITATION
// ========================================

router.post(
  "/invitations",
  requireAuth,
  async (req, res) => {
    try {
      const {
        email,
        firstName,
        lastName,
        phone,
        role,
        staffId,
        department,
        employmentDate
      } = req.body;

      if (
        !email ||
        !firstName ||
        !lastName ||
        !role ||
        !staffId
      ) {
        return res.status(400).json({
          message:
            "Email, first name, last name, role and staff ID are required"
        });
      }

      const result = await createStaffInvitation({
        authUserId: req.authUser.id,
        email,
        firstName,
        lastName,
        phone,
        role,
        staffId,
        department,
        employmentDate
      });

      res.status(201).json({
        message: "Staff invitation created successfully",
        data: result
      });

    } catch (error) {
      res.status(400).json({
        message: "Failed to create staff invitation",
        error: error.message
      });
    }
  }
);


// ========================================
// ACCEPT STAFF INVITATION
// ========================================

router.post(
  "/invitations/accept",
  async (req, res) => {
    try {
      const {
        token,
        password
      } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          message: "Token and password are required"
        });
      }

      const result = await acceptStaffInvitation({
        token,
        password
      });

      res.status(200).json({
        message: "Invitation accepted successfully",
        data: result
      });

    } catch (error) {
      res.status(400).json({
        message: "Failed to accept invitation",
        error: error.message
      });
    }
  }
);


module.exports = router;