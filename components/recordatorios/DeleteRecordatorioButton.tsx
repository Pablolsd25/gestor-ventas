"use client";

import { useTransition } from "react";
import { deleteRecordatorioAction } from "@/app/recordatorios/actions";

export default function DeleteRecordatorioButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("¿Eliminar este recordatorio? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      await deleteRecordatorioAction(id, undefined, new FormData());
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title="Eliminar recordatorio"
      className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-40 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
    >
      {isPending ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
        </svg>
      )}
    </button>
  );
}
