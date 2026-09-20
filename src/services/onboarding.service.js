const supabaseAdmin = require("../config/supabaseAdmin");

const createSchoolAndProprietor = async ({
  schoolName,
  email,
  password,
  firstName,
  lastName
}) => {
  // 1. Create the school
const { data: school, error: schoolError } = await supabaseAdmin
  .from("schools")
  .insert({
    name: schoolName
  })
  .select()
  .single();



if (schoolError) {
  throw new Error(`School creation failed: ${schoolError.message}`);
}

  // 2. Create the proprietor's Auth account
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

  if (authError) {
    await supabaseAdmin
      .from("schools")
      .delete()
      .eq("id", school.id);

    throw new Error(
      `Proprietor account creation failed: ${authError.message}`
    );
  }

  // 3. Create the proprietor profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: authData.user.id,
      school_id: school.id,
      first_name: firstName,
      last_name: lastName,
      role: "proprietor"
    })
    .select()
    .single();

  if (profileError) {
    // Clean up the Auth user
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

    // Clean up the school
    await supabaseAdmin
      .from("schools")
      .delete()
      .eq("id", school.id);

    throw new Error(
      `Proprietor profile creation failed: ${profileError.message}`
    );
  }

  return {
    school,
    profile
  };
};

module.exports = {
  createSchoolAndProprietor
};