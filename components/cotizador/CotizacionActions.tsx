"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { deleteCotizacionAction } from "@/app/cotizador/actions";

export default function CotizacionActions({ id }: { id: string }) {
  const router = useRouter();
  const [, deleteAction, deleting] = useActionState(
    deleteCotizacionAction.bind(null, id),
    undefined
  );

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.print()}
        className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Imprimir / PDF
      </button>
      <button
        onClick={() => router.push(`/cotizador/${id}/editar`)}
        className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Editar
      </button>
      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!confirm("¿Eliminar esta cotización?")) e.preventDefault();
        }}
      >
        <button
          type="submit"
          disabled={deleting}
          className="px-3.5 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
        >
          {deleting ? "Eliminando…" : "Eliminar"}
        </button>
      </form>
    </div>
  );
}
