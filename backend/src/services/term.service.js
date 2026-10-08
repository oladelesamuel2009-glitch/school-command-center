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
      "You are not authorized to manage terms"
    );
  }
};

const validateDateOrder = (startDate, endDate) => {
  if (startDate && endDate) {
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error(
        "Term start date cannot be after end date"
      );
    }
  }
};

const getAcademicSession = async ({
  sessionId,
  schoolId
}) => {
  const { data: session, error } = await supabaseAdmin
    .from("academic_sessions")
    .select(`
      id,
      school_id,
      name,
      start_date,
      end_date
    `)
    .eq("id", sessionId)
    .eq("school_id", schoolId)
    .single();

  if (error || !session) {
    throw new Error("Academic session not found");
  }

  return session;
};

const validateTermDatesAgainstSession = ({
  startDate,
  endDate,
  session
}) => {
  if (
    startDate &&
    session.start_date &&
    new Date(startDate) < new Date(session.start_date)
  ) {
    throw new Error(
      "Term start date cannot be before the academic session start date"
    );
  }

  if (
    endDate &&
    session.end_date &&
    new Date(endDate) > new Date(session.end_date)
  ) {
    throw new Error(
      "Term end date cannot be after the academic session end date"
    );
  }
};

const createTerm = async ({
  authUserId,
  sessionId,
  name,
  startDate,
  endDate
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);

  if (!name || !name.trim()) {
    throw new Error("Term name is required");
  }

  validateDateOrder(startDate, endDate);

  const session = await getAcademicSession({
    sessionId,
    schoolId: profile.school_id
  });

  validateTermDatesAgainstSession({
    startDate,
    endDate,
    session
  });

  const { data: term, error } = await supabaseAdmin
    .from("terms")
    .insert({
      academic_session_id: session.id,
      name: name.trim(),
      start_date: startDate || null,
      end_date: endDate || null
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "A term with this name already exists in this academic session"
      );
    }

    throw new Error(error.message);
  }

  return term;
};

const getTerms = async ({
  authUserId,
  sessionId
}) => {
  const profile = await getCreatorProfile(authUserId);

  const session = await getAcademicSession({
    sessionId,
    schoolId: profile.school_id
  });

  const { data: terms, error } = await supabaseAdmin
    .from("terms")
    .select(`
      id,
      academic_session_id,
      name,
      start_date,
      end_date,
      created_at,
      updated_at
    `)
    .eq("academic_session_id", session.id)
    .order("start_date", {
      ascending: true,
      nullsFirst: false
    });

  if (error) {
    throw new Error(error.message);
  }

  return terms;
};

const updateTerm = async ({
  authUserId,
  termId,
  name,
  startDate,
  endDate
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);

  const { data: existingTerm, error: termError } =
    await supabaseAdmin
      .from("terms")
      .select(`
        id,
        academic_session_id,
        name,
        start_date,
        end_date
      `)
      .eq("id", termId)
      .single();

  if (termError || !existingTerm) {
    throw new Error("Term not found");
  }

  const session = await getAcademicSession({
    sessionId: existingTerm.academic_session_id,
    schoolId: profile.school_id
  });

  const finalStartDate =
    startDate !== undefined
      ? startDate || null
      : existingTerm.start_date;

  const finalEndDate =
    endDate !== undefined
      ? endDate || null
      : existingTerm.end_date;

  validateDateOrder(
    finalStartDate,
    finalEndDate
  );

  validateTermDatesAgainstSession({
    startDate: finalStartDate,
    endDate: finalEndDate,
    session
  });

  const updates = {};

  if (name !== undefined) {
    if (!name.trim()) {
      throw new Error(
        "Term name cannot be empty"
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

  const { data: term, error } = await supabaseAdmin
    .from("terms")
    .update(updates)
    .eq("id", termId)
    .eq(
      "academic_session_id",
      existingTerm.academic_session_id
    )
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "A term with this name already exists in this academic session"
      );
    }

    throw new Error(error.message);
  }

  return term;
};

const deleteTerm = async ({
  authUserId,
  termId
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);

  const { data: existingTerm, error: termError } =
    await supabaseAdmin
      .from("terms")
      .select(`
        id,
        academic_session_id
      `)
      .eq("id", termId)
      .single();

  if (termError || !existingTerm) {
    throw new Error("Term not found");
  }

  await getAcademicSession({
    sessionId: existingTerm.academic_session_id,
    schoolId: profile.school_id
  });

  const { error } = await supabaseAdmin
    .from("terms")
    .delete()
    .eq("id", termId)
    .eq(
      "academic_session_id",
      existingTerm.academic_session_id
    );

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: termId
  };
};

module.exports = {
  createTerm,
  getTerms,
  updateTerm,
  deleteTerm
};