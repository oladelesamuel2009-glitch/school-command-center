const { createUserClient } = require("../config/supabase");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    const supabase = createUserClient(token);

    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }

    req.authUser = user;
    req.supabase = supabase;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Authentication verification failed"
    });
  }
};

module.exports = requireAuth;