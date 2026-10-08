import { apiRequest } from "../../../lib/apiClient";

export type AcademicSession = {
  id: string;
  school_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at?: string;
  updated_at?: string;
};

type AcademicSessionsListResponse = {
  message: string;
  data: AcademicSession[];
};

type AcademicSessionResponse = {
  message: string;
  data: AcademicSession;
};

export type AcademicSessionPayload = {
  name: string;
  startDate: string | null;
  endDate: string | null;
};

export function listAcademicSessions(token: string) {
  return apiRequest<AcademicSessionsListResponse>("/academic-sessions", {
    token,
  });
}

export function createAcademicSession(
  payload: AcademicSessionPayload,
  token: string
) {
  return apiRequest<AcademicSessionResponse>("/academic-sessions", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateAcademicSession(
  sessionId: string,
  payload: AcademicSessionPayload,
  token: string
) {
  return apiRequest<AcademicSessionResponse>(
    `/academic-sessions/${sessionId}`,
    {
      method: "PATCH",
      body: payload,
      token,
    }
  );
}

export function deleteAcademicSession(sessionId: string, token: string) {
  return apiRequest<{
    message: string;
    data: { id: string };
  }>(`/academic-sessions/${sessionId}`, {
    method: "DELETE",
    token,
  });
}
