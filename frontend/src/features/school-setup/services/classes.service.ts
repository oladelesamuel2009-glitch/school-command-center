import { apiRequest } from "../../../lib/apiClient";

export type SchoolClass = {
  id: string;
  school_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

type ListResponse = {
  message: string;
  data: SchoolClass[];
};

type ItemResponse = {
  message: string;
  data: SchoolClass;
};

export type ClassPayload = {
  name: string;
};

export function listClasses(token: string) {
  return apiRequest<ListResponse>("/classes", {
    token,
  });
}

export function createClass(payload: ClassPayload, token: string) {
  return apiRequest<ItemResponse>("/classes", {
    method: "POST",
    body: {
      name: payload.name.trim(),
    },
    token,
  });
}

export function updateClass(
  classId: string,
  payload: ClassPayload,
  token: string
) {
  return apiRequest<ItemResponse>(`/classes/${classId}`, {
    method: "PATCH",
    body: {
      name: payload.name.trim(),
    },
    token,
  });
}

export function deleteClass(classId: string, token: string) {
  return apiRequest<{
    message: string;
    data: { id: string };
  }>(`/classes/${classId}`, {
    method: "DELETE",
    token,
  });
}
