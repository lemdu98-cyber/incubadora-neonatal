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

export class ApiError extends Error {
  constructor(public readonly status: number) {
    super("Backend request failed");
  }
}

export async function getCurrentUser(accessToken: string): Promise<CurrentUser> {
  const response = await fetch(`${getPublicEnv().apiUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new ApiError(response.status);
  return (await response.json()) as CurrentUser;
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
