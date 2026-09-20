const {
  createSchoolAndProprietor
} = require("../services/onboarding.service");

const express = require("express");
const supabase = require("../config/supabase");
const { loginUser } = require("../services/auth.service");
const requireAuth = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await loginUser(email, password);

    res.status(200).json({
      message: "Login successful",
      data
    });
  } catch (error) {
    res.status(401).json({
      message: "Login failed",
      error: error.message
    });
  }
});

router.post("/onboarding", async (req, res) => {
  try {
    const {
      schoolName,
      email,
      password,
      firstName,
      lastName
    } = req.body;

    if (
      !schoolName ||
      !email ||
      !password ||
      !firstName ||
      !lastName
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const result = await createSchoolAndProprietor({
      schoolName,
      email,
      password,
      firstName,
      lastName
    });

    res.status(201).json({
      message: "School and proprietor created successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      message: "Onboarding failed",
      error: error.message
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const { data: profile, error } = await req.supabase
      .from("profiles")
      .select(`
        id,
        school_id,
        first_name,
        last_name,
        phone,
        role
      `)
      .eq("id", req.authUser.id)
      .single();

    if (error) {
  return res.status(404).json({
    message: "User profile not found"
  });
}

    res.status(200).json({
      message: "Authenticated user",
      user: {
        id: profile.id,
        schoolId: profile.school_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        role: profile.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get user profile",
      error: error.message
    });
  }
});

module.exports = router;