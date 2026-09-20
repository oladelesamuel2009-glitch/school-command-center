const { createUserClient } = require("../config/supabase");

const loginUser = async (email, password) => {
  const supabase = createUserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  loginUser
};