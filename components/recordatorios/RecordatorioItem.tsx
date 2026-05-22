"use client";

import { useActionState } from "react";
import { completeRecordatorioAction } from "@/app/recordatorios/actions";
import Link from "next/link";
import DeleteRecordatorioButton from "./DeleteRecordatorioButton";

const prioridadColor: Record<string, string> = {
  alta:  "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
  media: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  baja:  "bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600",
};

const tipoIcono: Record<string, string> = {
  llamada:     "📞",
  reunion:     "🤝",
  email:       "✉️",
  seguimiento: "🔍",
  otro:        "📌",
};

const tipoLabel: Record<string, string> = {
  llamada:     "Llamada",
  reunion:     "Reunión",
  email:       "Email",
  seguimiento: "Seguimiento",
  otro:        "Otro",
};

interface RecordatorioItemProps {
  id: string;
  titulo: string;
  descripcion: string | null;
  cliente_id: string | null;
  cliente_nombre: string | null;
  venta_id: string | null;
  fecha: string;
  hora: string;
  prioridad: "alta" | "media" | "baja";
  tipo: "llamada" | "reunion" | "email" | "seguimiento" | "otro";
  completado: boolean;
}

export default function RecordatorioItem({ r }: { r: RecordatorioItemProps }) {
  const completeAction = completeRecordatorioAction.bind(null, r.id);
  const [, action, pending] = useActionState(completeAction, undefined);

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm p-4 flex items-start gap-4 ${prioridadColor[r.prioridad]}`}
    >
      <span className="text-2xl mt-0.5">{tipoIcono[r.tipo]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-gray-900 dark:text-slate-100">{r.titulo}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${prioridadColor[r.prioridad]}`}>
            {r.prioridad}
          </span>
          <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
            {tipoLabel[r.tipo]}
          </span>
        </div>
        {r.descripcion && (
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{r.descripcion}</p>
        )}
        <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-slate-400">
          <span>📅 {r.fecha} · {r.hora.slice(0, 5)}</span>
          {r.cliente_nombre && (
            <span>👤 {r.cliente_nombre}</span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Completar */}
        <form action={action}>
          <button
            type="submit"
            disabled={pending}
            title="Marcar como completado"
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-40 transition-colors p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/30"
          >
            {pending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </form>

        {/* Editar */}
        <Link
          href={`/recordatorios/${r.id}/editar`}
          title="Editar recordatorio"
          className="text-gray-400 hover:text-amber-600 dark:text-slate-500 dark:hover:text-amber-400 transition-colors p-1.5 rounded hover:bg-amber-50 dark:hover:bg-amber-900/30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>

        {/* Eliminar */}
        <DeleteRecordatorioButton id={r.id} />
      </div>
    </div>
  );
}
