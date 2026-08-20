import Link from "next/link";
export default function NotFound(){return <main className="grid min-h-screen place-items-center"><section className="text-center"><h1 className="text-2xl font-bold">Paciente no encontrado.</h1><Link href="/patients" className="mt-5 inline-flex text-cyan-700">Volver a Pacientes</Link></section></main>;}
