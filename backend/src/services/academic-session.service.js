const supabaseAdmin = require("../config/supabaseAdmin");

const MANAGEMENT_ROLES = [
  "proprietor",
  "principal",
  "admin"
];

const getCreatorProfile = async (authUserId) => {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, school_id, role")
    .eq("id", authUserId)
    .single();

  if (error || !profile) {
    throw new Error("User profile not found");
  }

  return profile;
};

const validateManagementPermission = (role) => {
  if (!MANAGEMENT_ROLES.includes(role)) {
    throw new Error(
      "You are not authorized to manage academic sessions"
    );
  }
};

const validateDates = (startDate, endDate) => {
  if (startDate && endDate) {
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error(
        "Start date cannot be after end date"
      );
    }
  }
};

// ========================================
// CREATE ACADEMIC SESSION
// ========================================

const createAcademicSession = async ({
  authUserId,
  name,
  startDate,
  endDate
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);

  if (!name || !name.trim()) {
    throw new Error("Academic session name is required");
  }

  validateDates(startDate, endDate);

  const { data: session, error } = await supabaseAdmin
    .from("academic_sessions")
    .insert({
      school_id: profile.school_id,
      name: name.trim(),
      start_date: startDate || null,
      end_date: endDate || null
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "An academic session with this name already exists"
      );
    }

    throw new Error(error.message);
  }

  return session;
};

// ========================================
// GET ACADEMIC SESSIONS
// ========================================

const getAcademicSessions = async ({
  authUserId
}) => {
  const profile = await getCreatorProfile(authUserId);

  const { data: sessions, error } = await supabaseAdmin
    .from("academic_sessions")
    .select(`
      id,
      school_id,
      name,
      start_date,
      end_date,
      created_at,
      updated_at
    `)
    .eq("school_id", profile.school_id)
    .order("start_date", {
      ascending: false,
      nullsFirst: false
    });

  if (error) {
    throw new Error(error.message);
  }

  return sessions;
};

// ========================================
// UPDATE ACADEMIC SESSION
// ========================================

const updateAcademicSession = async ({
  authUserId,
  sessionId,
  name,
  startDate,
  endDate
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);

  validateDates(startDate, endDate);

  const updates = {};

  if (name !== undefined) {
    if (!name.trim()) {
      throw new Error(
        "Academic session name cannot be empty"
      );
    }

    updates.name = name.trim();
  }

  if (startDate !== undefined) {
    updates.start_date = startDate || null;
  }

  if (endDate !== undefined) {
    updates.end_date = endDate || null;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No changes provided");
  }

  const { data: session, error } = await supabaseAdmin
    .from("academic_sessions")
    .update(updates)
    .eq("id", sessionId)
    .eq("school_id", profile.school_id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "An academic session with this name already exists"
      );
    }

    throw new Error(error.message);
  }

  return session;
};

// ========================================
// DELETE ACADEMIC SESSION
// ========================================

const deleteAcademicSession = async ({
  authUserId,
  sessionId
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);

  const { data: session, error: sessionError } =
    await supabaseAdmin
      .from("academic_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("school_id", profile.school_id)
      .single();

  if (sessionError || !session) {
    throw new Error("Academic session not found");
  }

  const { error } = await supabaseAdmin
    .from("academic_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("school_id", profile.school_id);

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: sessionId
  };
};

module.exports = {
  createAcademicSession,
  getAcademicSessions,
  updateAcademicSession,
  deleteAcademicSession
};