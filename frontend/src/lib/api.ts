import { getPublicEnv } from "@/lib/env";

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
