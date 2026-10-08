import { apiRequest } from "../../../lib/apiClient";
import type { ClassArm } from "./classArmSubjects.service";
import type { SchoolClass } from "./classes.service";

type ListResponse<T> = {
  message: string;
  data: T[];
};

type ItemResponse<T> = {
  message: string;
  data: T;
};

export type CreateClassArmPayload = {
  name: string;
};

export type UpdateClassArmPayload = {
  name: string;
};

export type { ClassArm, SchoolClass };

export function listClasses(token: string) {
  return apiRequest<ListResponse<SchoolClass>>("/classes", {
    token,
  });
}

export function listClassArms(classId: string, token: string) {
  return apiRequest<ListResponse<ClassArm>>(`/classes/${classId}/arms`, {
    token,
  });
}

export function createClassArm(
  classId: string,
  payload: CreateClassArmPayload,
  token: string
) {
  return apiRequest<ItemResponse<ClassArm>>(
    `/classes/${classId}/arms`,
    {
      method: "POST",
      body: {
        name: payload.name.trim(),
      },
      token,
    }
  );
}

export function updateClassArm(
  classArmId: string,
  payload: UpdateClassArmPayload,
  token: string
) {
  return apiRequest<ItemResponse<ClassArm>>(
    `/class-arms/${classArmId}`,
    {
      method: "PATCH",
      body: {
        name: payload.name.trim(),
      },
      token,
    }
  );
}

export function deleteClassArm(classArmId: string, token: string) {
  return apiRequest<{
    message: string;
    data: { id: string };
  }>(`/class-arms/${classArmId}`, {
    method: "DELETE",
    token,
  });
}
