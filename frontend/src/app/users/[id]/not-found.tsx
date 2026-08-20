import Link from "next/link";

export default function UserNotFound() {
  return <main className="grid min-h-screen place-items-center bg-slate-100 p-6"><section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><p className="text-sm font-semibold text-cyan-700">404</p><h1 className="mt-2 text-2xl font-bold text-slate-950">Usuario no encontrado</h1><p className="mt-3 text-slate-600">El identificador no es válido o el usuario ya no existe.</p><Link href="/users" className="mt-6 inline-flex rounded-xl bg-cyan-700 px-4 py-3 font-semibold text-white">Volver a Usuarios</Link></section></main>;
}
