const { createClient } = require("@supabase/supabase-js");

const createUserClient = (accessToken) => {
  const options = {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  };

  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    options
  );
};

module.exports = {
  createUserClient
};