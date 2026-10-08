const supabaseAdmin = require("../config/supabaseAdmin");

const MANAGEMENT_ROLES = ["proprietor", "principal", "admin"];

const getCreatorProfile = async (authUserId) => {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, school_id, role")
    .eq("id", authUserId)
    .single();

  if (error || !profile) {
    throw new Error("Creator profile not found");
  }

  return profile;
};

const ensureManagementRole = (role) => {
  if (!MANAGEMENT_ROLES.includes(role)) {
    throw new Error("You do not have permission to manage subjects");
  }
};

const getSubjects = async (authUserId, includeInactive = false) => {
  const profile = await getCreatorProfile(authUserId);

  let query = supabaseAdmin
    .from("subjects")
    .select("id, school_id, name, code, active, created_at, updated_at")
    .eq("school_id", profile.school_id)
    .order("name", { ascending: true });

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getSubjects error:", error);
    throw new Error(error.message);
  }

  return data;
};

const createSubject = async (authUserId, { name, code }) => {
  const profile = await getCreatorProfile(authUserId);

  ensureManagementRole(profile.role);

  if (!name || !name.trim()) {
    throw new Error("Subject name is required");
  }

  if (!code || !code.trim()) {
    throw new Error("Subject code is required");
  }

  const cleanName = name.trim();
  const cleanCode = code.trim().toUpperCase();

  const { data: existingSubject, error: existingError } = await supabaseAdmin
    .from("subjects")
    .select("id, name, code, active")
    .eq("school_id", profile.school_id)
    .or(`name.ilike.${cleanName},code.eq.${cleanCode}`);

  if (existingError) {
    console.error("createSubject duplicate check error:", existingError);
    throw new Error(existingError.message);
  }

  if (existingSubject && existingSubject.length > 0) {
    throw new Error("A subject with this name or code already exists");
  }

  const { data: subject, error } = await supabaseAdmin
    .from("subjects")
    .insert({
      school_id: profile.school_id,
      name: cleanName,
      code: cleanCode,
      active: true
    })
    .select("id, school_id, name, code, active, created_at, updated_at")
    .single();

  if (error) {
    console.error("createSubject error:", error);
    throw new Error(error.message);
  }

  return subject;
};

const updateSubject = async (authUserId, subjectId, { name, code }) => {
  const profile = await getCreatorProfile(authUserId);

  ensureManagementRole(profile.role);

  const { data: subject, error: subjectError } = await supabaseAdmin
    .from("subjects")
    .select("id, school_id, name, code, active")
    .eq("id", subjectId)
    .eq("school_id", profile.school_id)
    .single();

  if (subjectError || !subject) {
    throw new Error("Subject not found");
  }

  const updates = {};

  if (name !== undefined) {
    if (!name.trim()) {
      throw new Error("Subject name cannot be empty");
    }

    updates.name = name.trim();
  }

  if (code !== undefined) {
    if (!code.trim()) {
      throw new Error("Subject code cannot be empty");
    }

    updates.code = code.trim().toUpperCase();
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No subject fields provided for update");
  }

  const newName = updates.name || subject.name;
  const newCode = updates.code || subject.code;

  const { data: duplicateSubjects, error: duplicateError } =
    await supabaseAdmin
      .from("subjects")
      .select("id, name, code")
      .eq("school_id", profile.school_id)
      .neq("id", subjectId)
      .or(`name.ilike.${newName},code.eq.${newCode}`);

  if (duplicateError) {
    console.error("updateSubject duplicate check error:", duplicateError);
    throw new Error(duplicateError.message);
  }

  if (duplicateSubjects && duplicateSubjects.length > 0) {
    throw new Error("Another subject with this name or code already exists");
  }

  const { data: updatedSubject, error: updateError } = await supabaseAdmin
    .from("subjects")
    .update(updates)
    .eq("id", subjectId)
    .eq("school_id", profile.school_id)
    .select("id, school_id, name, code, active, created_at, updated_at")
    .single();

  if (updateError) {
    console.error("updateSubject error:", updateError);
    throw new Error(updateError.message);
  }

  return updatedSubject;
};

const setSubjectActiveStatus = async (
  authUserId,
  subjectId,
  active
) => {
  const profile = await getCreatorProfile(authUserId);

  ensureManagementRole(profile.role);

  if (typeof active !== "boolean") {
    throw new Error("Active status must be true or false");
  }

  const { data: subject, error: subjectError } = await supabaseAdmin
    .from("subjects")
    .select("id, school_id, name, code, active")
    .eq("id", subjectId)
    .eq("school_id", profile.school_id)
    .single();

  if (subjectError || !subject) {
    throw new Error("Subject not found");
  }

  const { data: updatedSubject, error: updateError } = await supabaseAdmin
    .from("subjects")
    .update({ active })
    .eq("id", subjectId)
    .eq("school_id", profile.school_id)
    .select("id, school_id, name, code, active, created_at, updated_at")
    .single();

  if (updateError) {
    console.error("setSubjectActiveStatus error:", updateError);
    throw new Error(updateError.message);
  }

  return updatedSubject;
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  setSubjectActiveStatus
};