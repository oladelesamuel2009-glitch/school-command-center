import { apiRequest } from "../../../lib/apiClient";
import type { AcademicSession } from "./academicSessions.service";

export type Term = {
  id: string;
  academic_session_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at?: string;
  updated_at?: string;
};

type ListResponse<T> = {
  message: string;
  data: T[];
};

type ItemResponse<T> = {
  message: string;
  data: T;
};

export type TermPayload = {
  name: string;
  startDate: string | null;
  endDate: string | null;
};

export function listAcademicSessionsForTerms(token: string) {
  return apiRequest<ListResponse<AcademicSession>>("/academic-sessions", {
    token,
  });
}

export function listTerms(sessionId: string, token: string) {
  return apiRequest<ListResponse<Term>>(
    `/academic-sessions/${sessionId}/terms`,
    {
      token,
    }
  );
}

export function createTerm(
  sessionId: string,
  payload: TermPayload,
  token: string
) {
  return apiRequest<ItemResponse<Term>>(
    `/academic-sessions/${sessionId}/terms`,
    {
      method: "POST",
      body: payload,
      token,
    }
  );
}

export function updateTerm(
  termId: string,
  payload: TermPayload,
  token: string
) {
  return apiRequest<ItemResponse<Term>>(`/terms/${termId}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function deleteTerm(termId: string, token: string) {
  return apiRequest<{
    message: string;
    data: { id: string };
  }>(`/terms/${termId}`, {
    method: "DELETE",
    token,
  });
}
