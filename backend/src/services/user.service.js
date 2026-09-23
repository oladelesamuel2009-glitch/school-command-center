const crypto = require("crypto");
const supabaseAdmin = require("../config/supabaseAdmin");

const createStaffInvitation = async ({
  authUserId,
  email,
  firstName,
  lastName,
  phone,
  role,
  staffId,
  department,
  employmentDate
}) => {
  // ----------------------------------------
  // 1. Get the authenticated user's profile
  // ----------------------------------------

  const { data: creator, error: creatorError } = await supabaseAdmin
    .from("profiles")
    .select("id, school_id, role")
    .eq("id", authUserId)
    .single();

  if (creatorError || !creator) {
    throw new Error("Creator profile not found");
  }

  // ----------------------------------------
  // 2. Check creator permission
  // ----------------------------------------

  if (!["proprietor", "admin"].includes(creator.role)) {
    throw new Error(
      "You are not authorized to create staff invitations"
    );
  }

  // ----------------------------------------
  // 3. Validate invited role
  // ----------------------------------------

  if (!["principal", "admin", "teacher"].includes(role)) {
    throw new Error("Invalid staff role");
  }

  // ----------------------------------------
  // 4. Normalize email
  // ----------------------------------------

  const normalizedEmail = email.trim().toLowerCase();

  // ----------------------------------------
  // 5. Check for existing pending invitation
  // ----------------------------------------

  const { data: existingInvitation, error: existingError } =
    await supabaseAdmin
      .from("staff_invitations")
      .select("id")
      .eq("school_id", creator.school_id)
      .ilike("email", normalizedEmail)
      .eq("status", "pending")
      .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingInvitation) {
    throw new Error(
      "A pending invitation already exists for this email"
    );
  }

  // ----------------------------------------
  // 6. Generate secure invitation token
  // ----------------------------------------

  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // Invitation expires in 48 hours
  const expiresAt = new Date(
    Date.now() + 48 * 60 * 60 * 1000
  ).toISOString();

  // ----------------------------------------
  // 7. Save invitation
  // ----------------------------------------

  const { data: invitation, error: invitationError } =
    await supabaseAdmin
      .from("staff_invitations")
      .insert({
        school_id: creator.school_id,
        email: normalizedEmail,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone || null,
        role,
        staff_id: staffId.trim(),
        department: department || null,
        employment_date: employmentDate || null,
        token_hash: tokenHash,
        expires_at: expiresAt,
        status: "pending",
        created_by: creator.id
      })
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        staff_id,
        department,
        employment_date,
        expires_at,
        status,
        created_at
      `)
      .single();

  if (invitationError) {
    throw new Error(invitationError.message);
  }

  // ----------------------------------------
  // 8. Build invitation link
  // ----------------------------------------

  const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const invitationLink =
    `${frontendUrl}/accept-invitation?token=${rawToken}`;

  // ----------------------------------------
  // 9. Return safe invitation data
  // ----------------------------------------

  return {
    invitation,
    invitationLink
  };
};

module.exports = {
  createStaffInvitation
};