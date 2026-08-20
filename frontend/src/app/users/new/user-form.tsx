"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError, createUser, USER_ROLES, type CreatedUser, type UserRoleCode } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<number, string> = { 400: "Revisa los datos ingresados.", 403: "No tienes permisos para crear usuarios.", 409: "Ya existe un usuario con ese correo.", 502: "El servicio de autenticación no está disponible." };

export function NewUserForm() {
  const router = useRouter();
  const [roles, setRoles] = useState<UserRoleCode[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedUser | null>(null);

  function toggleRole(role: UserRoleCode) { setRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role]); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    if (roles.length === 0) { setError("Selecciona al menos un rol."); return; }
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email) || !firstName || !lastName) { setError("Revisa los datos ingresados."); return; }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) { await supabase.auth.signOut(); router.replace("/login"); router.refresh(); return; }
      setCreated(await createUser({ email, firstName, lastName, roles }, token));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) { await createClient().auth.signOut(); router.replace("/login"); router.refresh(); return; }
      setError(caught instanceof ApiError ? ERROR_MESSAGES[caught.status] ?? "No fue posible crear el usuario." : "No fue posible crear el usuario.");
    } finally { setSubmitting(false); }
  }

  return <><form onSubmit={submit} className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-5 sm:grid-cols-2"><Field id="firstName" label="Nombre" /><Field id="lastName" label="Apellido" /><div className="sm:col-span-2"><Field id="email" label="Correo electrónico" type="email" /></div></div><fieldset><legend className="text-sm font-semibold text-slate-800">Roles</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{USER_ROLES.map((role) => <label key={role} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3"><input type="checkbox" checked={roles.includes(role)} onChange={() => toggleRole(role)} className="size-4 accent-cyan-700" /> <span className="font-medium text-slate-800">{role}</span></label>)}</div></fieldset>{error && <p id="form-error" role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/users" className="rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700">Cancelar</Link><button disabled={submitting} className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{submitting ? "Creando…" : "Crear usuario"}</button></div></form>{created && <CredentialDialog user={created} onClose={() => setCreated(null)} />}</>;
}

function Field({ id, label, type = "text" }: { id: string; label: string; type?: string }) { return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label><input id={id} name={id} type={type} required autoComplete="off" aria-describedby="form-error" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" /></div>; }

function CredentialDialog({ user, onClose }: { user: CreatedUser; onClose: () => void }) {
  const [visible, setVisible] = useState(false); const [copied, setCopied] = useState(false); const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);
  async function copy() { await navigator.clipboard.writeText(user.temporaryPassword); setCopied(true); }
  return <div role="dialog" aria-modal="true" aria-labelledby="credential-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-5"><section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl"><h2 id="credential-title" ref={titleRef} tabIndex={-1} className="text-2xl font-bold text-slate-950 outline-none">Usuario creado correctamente</h2><p className="mt-3 text-sm font-semibold text-amber-700">Guarda esta contraseña ahora. No volverá a mostrarse.</p><dl className="mt-6 space-y-4"><div><dt className="text-sm text-slate-500">Correo</dt><dd className="mt-1 font-medium text-slate-900">{user.email}</dd></div><div><dt className="text-sm text-slate-500">Contraseña temporal</dt><dd className="mt-1 break-all rounded-xl bg-slate-100 p-3 font-mono text-slate-900">{visible ? user.temporaryPassword : "••••••••••••••••"}</dd></div></dl><div className="mt-4 flex gap-3"><button type="button" onClick={() => setVisible((value) => !value)} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold">{visible ? "Ocultar" : "Mostrar"}</button><button type="button" onClick={copy} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold">{copied ? "Copiada" : "Copiar"}</button></div><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-3 font-semibold">Seguir aquí</button><Link href="/users" className="rounded-xl bg-cyan-700 px-4 py-3 text-center font-semibold text-white">Ya la guardé, ir a Usuarios</Link></div></section></div>;
}
