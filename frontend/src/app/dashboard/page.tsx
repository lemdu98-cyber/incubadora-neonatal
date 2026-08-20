import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { ApiError, getCurrentUser, getHealth } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect("/login");

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) redirect("/auth/logout?reason=expired");

  let user;
  let health;
  try {
    [user, health] = await Promise.all([
      getCurrentUser(token),
      getHealth(),
    ]);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      redirect("/auth/logout?reason=expired");
    }
    return <DashboardUnavailable />;
  }
  return <DashboardShell user={user} backendConnected={health !== null} databaseConnected={health?.database === "connected"} />;
}

function DashboardUnavailable() {
  return <main className="grid min-h-screen place-items-center bg-slate-100 p-6"><section className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm"><h1 className="text-2xl font-bold text-slate-950">Backend no disponible</h1><p className="mt-3 text-slate-600">No fue posible validar el perfil actual. Compruebe el backend e inténtelo nuevamente.</p></section></main>;
}
