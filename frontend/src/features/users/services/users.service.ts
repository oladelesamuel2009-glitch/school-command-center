import { apiRequest } from "../../../lib/apiClient";

export type CreateStaffInvitationPayload = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  staffId: string;
  department: string;
  employmentDate: string;
};

export type CreateStaffInvitationResponse = {
  message: string;
  data: {
    invitation: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
      staff_id: string;
      status: string;
    };
    invitationLink: string;
  };
};

export function createStaffInvitation(
  payload: CreateStaffInvitationPayload,
  token: string
) {
  return apiRequest<CreateStaffInvitationResponse>("/users/invitations", {
    method: "POST",
    body: payload,
    token
  });
}
