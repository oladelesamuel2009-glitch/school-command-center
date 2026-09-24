import { apiRequest } from "../../../lib/apiClient";
import type { StoredUser } from "../../../lib/authStorage";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  data: {
    user: unknown;
    session: {
      access_token: string;
      refresh_token?: string;
    };
  };
};

export type MeResponse = {
  message: string;
  user: StoredUser;
};

export type OnboardingPayload = {
  schoolName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type AcceptInvitationPayload = {
  token: string;
  password: string;
};

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload
  });
}

export function getMe(token: string) {
  return apiRequest<MeResponse>("/auth/me", {
    method: "GET",
    token
  });
}

export function createSchool(payload: OnboardingPayload) {
  return apiRequest("/auth/onboarding", {
    method: "POST",
    body: payload
  });
}

export function acceptInvitation(payload: AcceptInvitationPayload) {
  return apiRequest("/users/invitations/accept", {
    method: "POST",
    body: payload
  });
}
