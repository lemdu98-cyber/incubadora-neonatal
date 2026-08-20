import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-10">
        <div className="mb-7 flex size-14 items-center justify-center rounded-2xl bg-cyan-700 text-2xl font-bold text-white" aria-hidden="true">IN</div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Acceso autorizado</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Incubadora Neonatal</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Ingrese con las credenciales proporcionadas por el administrador del sistema.</p>
        <LoginForm />
        <p className="mt-7 text-center text-xs text-slate-500">Sistema educativo/prototipo. No es un dispositivo médico.</p>
      </section>
    </main>
  );
}
