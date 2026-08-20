import { redirect } from "next/navigation";
import { ApiError, getCurrentUser } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function requireAuthenticated() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect("/login");
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) redirect("/auth/logout?reason=expired");

  try {
    return { accessToken, user: await getCurrentUser(accessToken) };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      redirect("/auth/logout?reason=expired");
    }
    throw error;
  }
}

export async function requireAdmin() {
  const context = await requireAuthenticated();
  if (!context.user.roles.includes("ADMIN")) redirect("/dashboard");
  return context;
}

export async function requireClinicalRole() {
  const context = await requireAuthenticated();
  if (!context.user.roles.some((role) => ['ADMIN', 'DOCTOR', 'NURSE'].includes(role))) redirect('/dashboard');
  return context;
}

export async function requireIncubatorReader() {
  const context = await requireAuthenticated();
  if (!context.user.roles.some((role) => ['ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN'].includes(role))) redirect('/dashboard');
  return context;
}

export async function requireIncubatorCreator() {
  const context = await requireAuthenticated();
  if (!context.user.roles.some((role) => ['ADMIN', 'TECHNICIAN'].includes(role))) redirect('/incubators');
  return context;
}
