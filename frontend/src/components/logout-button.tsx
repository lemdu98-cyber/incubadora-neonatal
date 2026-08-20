"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await createClient().auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return <button type="button" onClick={logout} disabled={loading} className="mt-auto w-full rounded-xl border border-slate-700 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-white disabled:opacity-60">{loading ? "Cerrando sesión…" : "Cerrar sesión"}</button>;
}
