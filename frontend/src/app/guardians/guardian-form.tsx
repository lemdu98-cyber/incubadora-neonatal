"use client";
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ApiError, createGuardian, type CreateGuardianInput } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

const fields: Array<{name:keyof CreateGuardianInput;label:string;required:boolean;type:string}> = [
  {name:'firstName',label:'Nombre',required:true,type:'text'}, {name:'lastName',label:'Apellido',required:true,type:'text'},
  {name:'documentNumber',label:'Documento (opcional)',required:false,type:'text'}, {name:'phone',label:'Teléfono (opcional)',required:false,type:'tel'},
  {name:'email',label:'Correo (opcional)',required:false,type:'email'},
];
export function GuardianForm(){
  const router=useRouter(); const[error,setError]=useState<string|null>(null); const[busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError(null);const f=new FormData(e.currentTarget);const value=(name:string)=>String(f.get(name)??'').trim();const data:CreateGuardianInput={firstName:value('firstName'),lastName:value('lastName'),documentNumber:value('documentNumber')||undefined,phone:value('phone')||undefined,email:value('email').toLowerCase()||undefined,address:value('address')||undefined};setBusy(true);try{const supabase=createClient();const{data:session}=await supabase.auth.getSession();if(!session.session){router.replace('/login');return}const guardian=await createGuardian(data,session.session.access_token);router.push(`/guardians/${guardian.id}`);router.refresh()}catch(e){setError(e instanceof ApiError&&e.status===403?'No tienes permisos para realizar esta acción.':e instanceof ApiError&&e.status===400?'Revisa los datos ingresados.':'No fue posible completar la operación.')}finally{setBusy(false)}}
  return <form onSubmit={submit} className="mt-7 grid max-w-2xl gap-5 rounded-2xl border bg-white p-6 sm:grid-cols-2">{fields.map(({name,label,required,type})=><label className="text-sm font-semibold" key={name}>{label}<input aria-label={label} className="mt-2 w-full rounded-xl border p-3" name={name} required={required} type={type}/></label>)}<label className="text-sm font-semibold sm:col-span-2">Dirección (opcional)<textarea aria-label="Dirección (opcional)" className="mt-2 w-full rounded-xl border p-3" name="address"/></label>{error&&<p role="alert" className="sm:col-span-2">{error}</p>}<button disabled={busy} className="rounded-xl bg-cyan-700 p-3 font-semibold text-white sm:col-span-2">{busy?'Guardando…':'Registrar tutor'}</button></form>;
}
