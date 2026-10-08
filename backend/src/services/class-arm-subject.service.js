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

const getClassArmForSchool = async (classArmId, schoolId) => {
  const { data: classArm, error } = await supabaseAdmin
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
    .eq("classes.school_id", schoolId)
    .single();

  if (error || !classArm) {
    throw new Error("Class arm not found");
  }

  return classArm;
};

const getSubjectForSchool = async (subjectId, schoolId) => {
  const { data: subject, error } = await supabaseAdmin
    .from("subjects")
    .select("id, name, code, school_id, active")
    .eq("id", subjectId)
    .eq("school_id", schoolId)
    .single();

  if (error) {
    console.error("getSubjectForSchool error:", error);
    throw new Error(error.message);
  }

  if (!subject) {
    throw new Error("Subject not found");
  }

  if (!subject.active) {
    throw new Error(
      "This subject is inactive and cannot be added to a class arm"
    );
  }

  return subject;
};

const getClassArmSubjects = async ({
  authUserId,
  classArmId
}) => {
  const profile = await getCreatorProfile(authUserId);

  await getClassArmForSchool(classArmId, profile.school_id);

  const { data, error } = await supabaseAdmin
    .from("class_arm_subjects")
    .select(`
      id,
      class_arm_id,
      subject_id,
      type,
      created_at,
      updated_at,
      subjects (
        id,
        name,
        code
      )
    `)
    .eq("class_arm_id", classArmId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const createClassArmSubject = async ({
  authUserId,
  classArmId,
  subjectId,
  type
}) => {
  const profile = await getCreatorProfile(authUserId);

  if (!MANAGEMENT_ROLES.includes(profile.role)) {
    throw new Error(
      "You are not authorized to configure class arm subjects"
    );
  }

  if (!["compulsory", "elective"].includes(type)) {
    throw new Error(
      "Subject type must be compulsory or elective"
    );
  }

  await getClassArmForSchool(classArmId, profile.school_id);

  await getSubjectForSchool(subjectId, profile.school_id);

  const { data: existing, error: existingError } =
    await supabaseAdmin
      .from("class_arm_subjects")
      .select("id")
      .eq("class_arm_id", classArmId)
      .eq("subject_id", subjectId)
      .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    throw new Error(
      "This subject is already configured for this class arm"
    );
  }

  const { data, error } = await supabaseAdmin
    .from("class_arm_subjects")
    .insert({
      class_arm_id: classArmId,
      subject_id: subjectId,
      type
    })
    .select(`
      id,
      class_arm_id,
      subject_id,
      type,
      created_at,
      updated_at,
      subjects (
        id,
        name,
        code
      )
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const updateClassArmSubject = async ({
  authUserId,
  classArmSubjectId,
  type
}) => {
  const profile = await getCreatorProfile(authUserId);

  if (!MANAGEMENT_ROLES.includes(profile.role)) {
    throw new Error(
      "You are not authorized to configure class arm subjects"
    );
  }

  if (!["compulsory", "elective"].includes(type)) {
    throw new Error(
      "Subject type must be compulsory or elective"
    );
  }

  const { data: existing, error: existingError } =
    await supabaseAdmin
      .from("class_arm_subjects")
      .select(`
        id,
        class_arm_id,
        subject_id,
        class_arms!inner (
          id,
          classes!inner (
            school_id
          )
        )
      `)
      .eq("id", classArmSubjectId)
      .eq("class_arms.classes.school_id", profile.school_id)
      .single();

  if (existingError || !existing) {
    throw new Error("Class arm subject configuration not found");
  }

  const { data, error } = await supabaseAdmin
    .from("class_arm_subjects")
    .update({
      type,
      updated_at: new Date().toISOString()
    })
    .eq("id", classArmSubjectId)
    .select(`
      id,
      class_arm_id,
      subject_id,
      type,
      created_at,
      updated_at,
      subjects (
        id,
        name,
        code
      )
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const deleteClassArmSubject = async ({
  authUserId,
  classArmSubjectId
}) => {
  const profile = await getCreatorProfile(authUserId);

  if (!MANAGEMENT_ROLES.includes(profile.role)) {
    throw new Error(
      "You are not authorized to configure class arm subjects"
    );
  }

  const { data: existing, error: existingError } =
    await supabaseAdmin
      .from("class_arm_subjects")
      .select(`
        id,
        class_arm_id,
        class_arms!inner (
          id,
          classes!inner (
            school_id
          )
        )
      `)
      .eq("id", classArmSubjectId)
      .eq("class_arms.classes.school_id", profile.school_id)
      .single();

  if (existingError || !existing) {
    throw new Error("Class arm subject configuration not found");
  }

  const { error } = await supabaseAdmin
    .from("class_arm_subjects")
    .delete()
    .eq("id", classArmSubjectId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    message: "Class arm subject removed successfully"
  };
};

module.exports = {
  getClassArmSubjects,
  createClassArmSubject,
  updateClassArmSubject,
  deleteClassArmSubject
};