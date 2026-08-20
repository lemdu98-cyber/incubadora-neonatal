import Link from 'next/link';
export default function NotFound(){return <main className="p-8"><h1 className="text-3xl font-bold">Sensor no encontrado</h1><p className="mt-3">El sensor solicitado no existe.</p><Link className="mt-5 inline-block text-cyan-700" href="/sensors">Volver a sensores</Link></main>}
