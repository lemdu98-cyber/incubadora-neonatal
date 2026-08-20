import { getPublicEnv } from "@/lib/env";
import type { BloodType, PatientSex, PatientStatus } from "@/lib/patient-options";
import type { GuardianRelationship } from "@/lib/guardian-options";
import type { IncubatorStatus } from "@/lib/incubator-options";
import type { AdmissionStatus } from "@/lib/admission-options";

export type CurrentUser = {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    status: string;
  } | null;
  roles: string[];
};

export const USER_ROLES = ["ADMIN", "DOCTOR", "NURSE", "TECHNICIAN"] as const;
export type UserRoleCode = (typeof USER_ROLES)[number];
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type AppUser = {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  status: UserStatus;
  roles: UserRoleCode[];
};
export type CreateUserInput = Pick<AppUser, "firstName" | "lastName" | "roles"> & { email: string };
export type CreatedUser = AppUser & { email: string; temporaryPassword: string };
export type Patient = {
  id: string; medicalRecordNumber: string; firstName: string; lastName: string;
  birthDate: string; birthTime: string | null; sex: PatientSex; birthWeightGrams: number;
  gestationalAgeWeeks: number; gestationalAgeDays: number; bloodType: BloodType;
  status: PatientStatus; createdAt: string; updatedAt: string;
};
export type CreatePatientInput = Omit<Patient, "id" | "status" | "createdAt" | "updatedAt" | "birthTime"> & { birthTime?: string };
export type Guardian = { id:string; firstName:string; lastName:string; documentNumber:string|null; phone:string|null; email:string|null; address:string|null; createdAt?:string; updatedAt?:string; patients?: Array<{relationship:GuardianRelationship;isPrimaryContact:boolean;patient:Patient}> };
export type CreateGuardianInput = { firstName:string; lastName:string; documentNumber?:string; phone?:string; email?:string; address?:string };
export type PatientGuardian = Guardian & { relationship:GuardianRelationship; isPrimaryContact:boolean; linkedAt?:string };
export type LinkGuardianInput = { guardianId:string; relationship:GuardianRelationship; isPrimaryContact:boolean };
export type CreateAndLinkGuardianInput = { guardian:CreateGuardianInput; relationship:GuardianRelationship; isPrimaryContact:boolean };
export type Incubator = {
  id: string; code: string; name: string; location: string; serialNumber: string | null;
  manufacturer: string | null; model: string | null; status: IncubatorStatus;
  notes: string | null; createdAt: string; updatedAt: string;
};
export type CreateIncubatorInput = Pick<Incubator, "code" | "name" | "location"> & {
  serialNumber?: string; manufacturer?: string; model?: string; notes?: string;
};
export type Admission = { id:string; patientId:string; incubatorId:string; admittedAt:string; dischargedAt:string|null; status:AdmissionStatus; notes:string|null; createdAt?:string; updatedAt?:string; patient:{id:string;medicalRecordNumber:string;firstName:string;lastName:string}; incubator:{id:string;code:string;name:string;location:string;status:IncubatorStatus} };
export type CreateAdmissionInput = { patientId:string; incubatorId:string; admittedAt:string; notes?:string };
export type DischargeAdmissionInput = { dischargedAt:string; status:Exclude<AdmissionStatus,"ACTIVE"> };

export class ApiError extends Error {
  constructor(public readonly status: number) {
    super("Backend request failed");
  }
}

async function protectedRequest<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${getPublicEnv().apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });
    if (!response.ok) throw new ApiError(response.status);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0);
  }
}

export async function getCurrentUser(accessToken: string): Promise<CurrentUser> {
  return protectedRequest<CurrentUser>("/auth/me", accessToken);
}

export function getUsers(accessToken: string) {
  return protectedRequest<AppUser[]>("/users", accessToken);
}

export function getUser(id: string, accessToken: string) {
  return protectedRequest<AppUser>(`/users/${encodeURIComponent(id)}`, accessToken);
}

export function createUser(data: CreateUserInput, accessToken: string) {
  return protectedRequest<CreatedUser>("/users", accessToken, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getPatients(accessToken: string) { return protectedRequest<Patient[]>("/patients", accessToken); }
export function getPatient(id: string, accessToken: string) { return protectedRequest<Patient>(`/patients/${encodeURIComponent(id)}`, accessToken); }
export function createPatient(data: CreatePatientInput, accessToken: string) {
  return protectedRequest<Patient>("/patients", accessToken, { method: "POST", body: JSON.stringify(data) });
}
export function getGuardians(accessToken:string){return protectedRequest<Guardian[]>('/guardians',accessToken);}
export function getGuardian(id:string,accessToken:string){return protectedRequest<Guardian>(`/guardians/${encodeURIComponent(id)}`,accessToken);}
export function createGuardian(data:CreateGuardianInput,accessToken:string){return protectedRequest<Guardian>('/guardians',accessToken,{method:'POST',body:JSON.stringify(data)});}
export function getPatientGuardians(patientId:string,accessToken:string){return protectedRequest<PatientGuardian[]>(`/patients/${encodeURIComponent(patientId)}/guardians`,accessToken);}
export function linkGuardian(patientId:string,data:LinkGuardianInput,accessToken:string){return protectedRequest<PatientGuardian>(`/patients/${encodeURIComponent(patientId)}/guardians`,accessToken,{method:'POST',body:JSON.stringify(data)});}
export function createAndLinkGuardian(patientId:string,data:CreateAndLinkGuardianInput,accessToken:string){return protectedRequest<PatientGuardian>(`/patients/${encodeURIComponent(patientId)}/guardians/new`,accessToken,{method:'POST',body:JSON.stringify(data)});}
export function unlinkGuardian(patientId:string,guardianId:string,accessToken:string){return protectedRequest<{status:string}>(`/patients/${encodeURIComponent(patientId)}/guardians/${encodeURIComponent(guardianId)}`,accessToken,{method:'DELETE'});}
export function getIncubators(accessToken: string) { return protectedRequest<Incubator[]>("/incubators", accessToken); }
export function getIncubator(id: string, accessToken: string) { return protectedRequest<Incubator>(`/incubators/${encodeURIComponent(id)}`, accessToken); }
export function createIncubator(data: CreateIncubatorInput, accessToken: string) { return protectedRequest<Incubator>("/incubators", accessToken, { method: "POST", body: JSON.stringify(data) }); }
export function getAdmissions(accessToken:string,filters?:{status?:AdmissionStatus;patientId?:string;incubatorId?:string}){const query=new URLSearchParams(Object.entries(filters??{}).filter((entry):entry is [string,string]=>Boolean(entry[1])));return protectedRequest<Admission[]>(`/admissions${query.size?`?${query}`:""}`,accessToken)}
export function getAdmission(id:string,accessToken:string){return protectedRequest<Admission>(`/admissions/${encodeURIComponent(id)}`,accessToken)}
export function createAdmission(data:CreateAdmissionInput,accessToken:string){return protectedRequest<Admission>('/admissions',accessToken,{method:'POST',body:JSON.stringify(data)})}
export function dischargeAdmission(id:string,data:DischargeAdmissionInput,accessToken:string){return protectedRequest<Admission>(`/admissions/${encodeURIComponent(id)}/discharge`,accessToken,{method:'POST',body:JSON.stringify(data)})}
export function getPatientAdmissions(id:string,accessToken:string){return protectedRequest<Admission[]>(`/patients/${encodeURIComponent(id)}/admissions`,accessToken)}
export function getPatientActiveAdmission(id:string,accessToken:string){return protectedRequest<Admission|null>(`/patients/${encodeURIComponent(id)}/active-admission`,accessToken)}
export function getIncubatorAdmissions(id:string,accessToken:string){return protectedRequest<Admission[]>(`/incubators/${encodeURIComponent(id)}/admissions`,accessToken)}
export function getIncubatorActiveAdmission(id:string,accessToken:string){return protectedRequest<Admission|null>(`/incubators/${encodeURIComponent(id)}/active-admission`,accessToken)}

export async function getHealth() {
  try {
    const response = await fetch(`${getPublicEnv().apiUrl}/health`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as { status: string; database: string };
  } catch {
    return null;
  }
}
