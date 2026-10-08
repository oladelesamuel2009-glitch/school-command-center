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
      "You are not authorized to manage classes"
    );
  }
};

const validateClassName = (name) => {
  if (!name || !name.trim()) {
    throw new Error("Class name is required");
  }
};

const createClass = async ({
  authUserId,
  name
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);
  validateClassName(name);

  const { data: classRecord, error } = await supabaseAdmin
    .from("classes")
    .insert({
      school_id: profile.school_id,
      name: name.trim()
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "A class with this name already exists in your school"
      );
    }

    throw new Error(error.message);
  }

  return classRecord;
};

const getClasses = async ({
  authUserId
}) => {
  const profile = await getCreatorProfile(authUserId);

  const { data: classes, error } = await supabaseAdmin
    .from("classes")
    .select(`
      id,
      school_id,
      name,
      created_at,
      updated_at
    `)
    .eq("school_id", profile.school_id)
    .order("name", {
      ascending: true
    });

  if (error) {
    throw new Error(error.message);
  }

  return classes;
};

const updateClass = async ({
  authUserId,
  classId,
  name
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);
  validateClassName(name);

  const { data: existingClass, error: classError } =
    await supabaseAdmin
      .from("classes")
      .select("id, school_id, name")
      .eq("id", classId)
      .eq("school_id", profile.school_id)
      .single();

  if (classError || !existingClass) {
    throw new Error("Class not found");
  }

  const { data: updatedClass, error } = await supabaseAdmin
    .from("classes")
    .update({
      name: name.trim()
    })
    .eq("id", classId)
    .eq("school_id", profile.school_id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "A class with this name already exists in your school"
      );
    }

    throw new Error(error.message);
  }

  return updatedClass;
};

const deleteClass = async ({
  authUserId,
  classId
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);

  const { data: existingClass, error: classError } =
    await supabaseAdmin
      .from("classes")
      .select("id, school_id")
      .eq("id", classId)
      .eq("school_id", profile.school_id)
      .single();

  if (classError || !existingClass) {
    throw new Error("Class not found");
  }

  const { error } = await supabaseAdmin
    .from("classes")
    .delete()
    .eq("id", classId)
    .eq("school_id", profile.school_id);

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: classId
  };
};

module.exports = {
  createClass,
  getClasses,
  updateClass,
  deleteClass
};