export function getPublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("La configuración pública de Supabase está incompleta");
  }

  return { supabaseUrl, supabasePublishableKey, apiUrl };
}
