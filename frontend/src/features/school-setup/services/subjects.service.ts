import { apiRequest } from "../../../lib/apiClient";

export type Subject = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

type SubjectsApiResponse = {
  message?: string;
  data?: Subject[] | { subjects?: Subject[] };
  subjects?: Subject[];
};

export type SubjectResponse = {
  message: string;
  data?: {
    subject?: Subject;
  };
};

export type SubjectPayload = {
  name: string;
  code: string;
};

function extractSubjects(response: SubjectsApiResponse): Subject[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    response.data &&
    !Array.isArray(response.data) &&
    Array.isArray(response.data.subjects)
  ) {
    return response.data.subjects;
  }

  if (Array.isArray(response.subjects)) {
    return response.subjects;
  }

  return [];
}

export async function listSubjects(
  token: string,
  includeInactive = false
): Promise<Subject[]> {
  const endpoint = includeInactive
    ? "/subjects?includeInactive=true"
    : "/subjects";

  const response = await apiRequest<SubjectsApiResponse>(endpoint, {
    token,
  });

  return extractSubjects(response);
}

export function createSubject(payload: SubjectPayload, token: string) {
  return apiRequest<SubjectResponse>("/subjects", {
    method: "POST",
    body: {
      name: payload.name.trim(),
      code: payload.code.trim().toUpperCase(),
    },
    token,
  });
}

export function updateSubject(
  subjectId: string,
  payload: SubjectPayload,
  token: string
) {
  return apiRequest<SubjectResponse>(`/subjects/${subjectId}`, {
    method: "PATCH",
    body: {
      name: payload.name.trim(),
      code: payload.code.trim().toUpperCase(),
    },
    token,
  });
}

export function updateSubjectStatus(
  subjectId: string,
  active: boolean,
  token: string
) {
  return apiRequest<SubjectResponse>(`/subjects/${subjectId}/status`, {
    method: "PATCH",
    body: { active },
    token,
  });
}
