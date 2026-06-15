"use client";

import { useActionState, useEffect, useState } from "react";
import { updateMetaAction } from "@/app/metas/actions";

interface Props {
  metaMonto: number;
  metaToneladas: number;
}

export default function MetasEditor({ metaMonto, metaToneladas }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateMetaAction, undefined);

  // Cerrar el modal cuando se guarda con éxito
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
      >
        Editar metas
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/40"
            style={{ backdropFilter: "blur(3px)" }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-black/8 dark:ring-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-slate-100">Metas del mes</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form action={formAction} className="p-5 space-y-4">
              {state?.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {state.error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Meta de facturaci&oacute;n (MXN / mes)
                </label>
                <input
                  name="meta_monto"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={metaMonto || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej. 2500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Meta de toneladas (TN / mes)
                </label>
                <input
                  name="meta_toneladas"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={metaToneladas || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej. 150"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {pending ? "Guardando…" : "Guardar metas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
