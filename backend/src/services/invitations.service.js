const crypto = require("crypto");
const supabaseAdmin = require("../config/supabaseAdmin");

const acceptStaffInvitation = async ({
  token,
  password
}) => {
  if (!token || !password) {
    throw new Error("Token and password are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // 1. Hash the invitation token
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 2. Find the invitation
  const { data: invitation, error: invitationError } =
    await supabaseAdmin
      .from("staff_invitations")
      .select("*")
      .eq("token_hash", tokenHash)
      .eq("status", "pending")
      .maybeSingle();

  if (invitationError) {
    throw new Error(invitationError.message);
  }

  if (!invitation) {
    throw new Error("Invalid or already used invitation");
  }

  // 3. Check expiration
  if (new Date(invitation.expires_at) <= new Date()) {
    await supabaseAdmin
      .from("staff_invitations")
      .update({
        status: "expired"
      })
      .eq("id", invitation.id);

    throw new Error("Invitation has expired");
  }

  // 4. Create Supabase Auth account
  const {
    data: authData,
    error: authError
  } = await supabaseAdmin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const authUserId = authData.user.id;

  try {
    // 5. Create profile
    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .insert({
          id: authUserId,
          school_id: invitation.school_id,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          phone: invitation.phone,
          role: invitation.role
        })
        .select()
        .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    // 6. Create staff record
    const { data: staff, error: staffError } =
      await supabaseAdmin
        .from("staff")
        .insert({
          school_id: invitation.school_id,
          profile_id: profile.id,
          staff_id: invitation.staff_id,
          department: invitation.department,
          employment_date: invitation.employment_date,
          status: "active"
        })
        .select()
        .single();

    if (staffError) {
      throw new Error(staffError.message);
    }

    // 7. Mark invitation as accepted
    const { error: updateError } =
      await supabaseAdmin
        .from("staff_invitations")
        .update({
          status: "accepted"
        })
        .eq("id", invitation.id)
        .eq("status", "pending");

    if (updateError) {
      throw new Error(updateError.message);
    }

    return {
      profile,
      staff
    };

  } catch (error) {
    // Cleanup Auth user if database setup fails
    await supabaseAdmin.auth.admin.deleteUser(authUserId);

    throw error;
  }
};

module.exports = {
  acceptStaffInvitation
};