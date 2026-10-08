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
      "You are not authorized to manage class arms"
    );
  }
};

const validateArmName = (name) => {
  if (!name || !name.trim()) {
    throw new Error("Class arm name is required");
  }
};

const getClass = async ({
  classId,
  schoolId
}) => {
  const { data: classRecord, error } = await supabaseAdmin
    .from("classes")
    .select(`
      id,
      school_id,
      name
    `)
    .eq("id", classId)
    .eq("school_id", schoolId)
    .single();

  if (error || !classRecord) {
    throw new Error("Class not found");
  }

  return classRecord;
};

const createClassArm = async ({
  authUserId,
  classId,
  name
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);
  validateArmName(name);

  const classRecord = await getClass({
    classId,
    schoolId: profile.school_id
  });

  const { data: classArm, error } = await supabaseAdmin
    .from("class_arms")
    .insert({
      class_id: classRecord.id,
      name: name.trim()
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "A class arm with this name already exists in this class"
      );
    }

    throw new Error(error.message);
  }

  return classArm;
};

const getClassArms = async ({
  authUserId,
  classId
}) => {
  const profile = await getCreatorProfile(authUserId);

  const classRecord = await getClass({
    classId,
    schoolId: profile.school_id
  });

  const { data: classArms, error } = await supabaseAdmin
    .from("class_arms")
    .select(`
      id,
      class_id,
      name,
      created_at,
      updated_at
    `)
    .eq("class_id", classRecord.id)
    .order("name", {
      ascending: true
    });

  if (error) {
    throw new Error(error.message);
  }

  return classArms;
};

const updateClassArm = async ({
  authUserId,
  classArmId,
  name
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);
  validateArmName(name);

  const { data: existingArm, error: armError } =
    await supabaseAdmin
      .from("class_arms")
      .select(`
        id,
        class_id,
        name,
        classes!inner (
          id,
          school_id
        )
      `)
      .eq("id", classArmId)
      .eq("classes.school_id", profile.school_id)
      .single();

  if (armError || !existingArm) {
    throw new Error("Class arm not found");
  }

  const { data: updatedArm, error } = await supabaseAdmin
    .from("class_arms")
    .update({
      name: name.trim()
    })
    .eq("id", classArmId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "A class arm with this name already exists in this class"
      );
    }

    throw new Error(error.message);
  }

  return updatedArm;
};

const deleteClassArm = async ({
  authUserId,
  classArmId
}) => {
  const profile = await getCreatorProfile(authUserId);

  validateManagementPermission(profile.role);

  const { data: existingArm, error: armError } =
    await supabaseAdmin
      .from("class_arms")
      .select(`
        id,
        class_id,
        classes!inner (
          id,
          school_id
        )
      `)
      .eq("id", classArmId)
      .eq("classes.school_id", profile.school_id)
      .single();

  if (armError || !existingArm) {
    throw new Error("Class arm not found");
  }

  const { error } = await supabaseAdmin
    .from("class_arms")
    .delete()
    .eq("id", classArmId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: classArmId
  };
};

module.exports = {
  createClassArm,
  getClassArms,
  updateClassArm,
  deleteClassArm
};