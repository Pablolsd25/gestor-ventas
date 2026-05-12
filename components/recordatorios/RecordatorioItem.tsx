"use client";

import { useActionState } from "react";
import { completeRecordatorioAction } from "@/app/recordatorios/actions";
import Link from "next/link";

const prioridadColor: Record<string, string> = {
  alta:  "bg-red-100 text-red-700 border-red-200",
  media: "bg-amber-100 text-amber-700 border-amber-200",
  baja:  "bg-gray-100 text-gray-600 border-gray-200",
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
      className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 ${prioridadColor[r.prioridad]}`}
    >
      <span className="text-2xl mt-0.5">{tipoIcono[r.tipo]}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-gray-900">{r.titulo}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${prioridadColor[r.prioridad]}`}>
            {r.prioridad}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {tipoLabel[r.tipo]}
          </span>
        </div>
        {r.descripcion && (
          <p className="text-sm text-gray-600 mt-1">{r.descripcion}</p>
        )}
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span>📅 {r.fecha} · {r.hora.slice(0, 5)}</span>
          {r.cliente_nombre && (
            <span>👤 {r.cliente_nombre}</span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <form action={action}>
          <button
            type="submit"
            disabled={pending}
            className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
          >
            ✓ Completar
          </button>
        </form>
        <Link
          href={`/recordatorios/${r.id}/editar`}
          className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          Editar
        </Link>
      </div>
    </div>
  );
}
