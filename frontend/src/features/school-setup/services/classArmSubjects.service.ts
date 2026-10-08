import { apiRequest } from "../../../lib/apiClient";

export type SubjectConfigurationType = "compulsory" | "elective";

export type SchoolClass = {
  id: string;
  school_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type ClassArm = {
  id: string;
  class_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type ConfiguredSubjectDetails = {
  id: string;
  name: string;
  code: string;
};

export type ClassArmSubject = {
  id: string;
  class_arm_id: string;
  subject_id: string;
  type: SubjectConfigurationType;
  created_at?: string;
  updated_at?: string;
  subjects: ConfiguredSubjectDetails;
};

type ListResponse<T> = {
  message: string;
  data: T[];
};

type ItemResponse<T> = {
  message: string;
  data: T;
};

export type AddClassArmSubjectPayload = {
  subjectId: string;
  type: SubjectConfigurationType;
};

export type UpdateClassArmSubjectPayload = {
  type: SubjectConfigurationType;
};

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

export function listClassArmSubjects(classArmId: string, token: string) {
  return apiRequest<ListResponse<ClassArmSubject>>(
    `/class-arms/${classArmId}/subjects`,
    {
      token,
    }
  );
}

export function addClassArmSubject(
  classArmId: string,
  payload: AddClassArmSubjectPayload,
  token: string
) {
  return apiRequest<ItemResponse<ClassArmSubject>>(
    `/class-arms/${classArmId}/subjects`,
    {
      method: "POST",
      body: payload,
      token,
    }
  );
}

export function updateClassArmSubject(
  configurationId: string,
  payload: UpdateClassArmSubjectPayload,
  token: string
) {
  return apiRequest<ItemResponse<ClassArmSubject>>(
    `/class-arm-subjects/${configurationId}`,
    {
      method: "PATCH",
      body: payload,
      token,
    }
  );
}

export function removeClassArmSubject(configurationId: string, token: string) {
  return apiRequest<{ message: string }>(
    `/class-arm-subjects/${configurationId}`,
    {
      method: "DELETE",
      token,
    }
  );
}
