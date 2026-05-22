"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/app/ventas/actions";

interface VentaData {
  id?: string;
  cliente_id: string;
  descripcion: string;
  material_id: string;
  cantidad: string;
  monto: string;
  estado: "ganada" | "perdida" | "en_proceso" | "propuesta" | "";
  fecha_creacion: string;
  fecha_cierre: string;
  notas: string;
}

interface MaterialOption {
  id: number;
  nombre: string;
}

interface VentaFormProps {
  action: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  initialData?: VentaData;
  submitLabel: string;
  clientes: Array<{ id: string; razon_social: string }>;
  materiales: MaterialOption[];
}

export default function VentaForm({
  action,
  initialData,
  submitLabel,
  clientes,
  materiales,
}: VentaFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "error" in state && state.error) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state && "error" in state && state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
          {state.error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-5">
        <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-base border-b border-gray-100 dark:border-slate-700 pb-3">
          Datos de la Venta
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Cliente
          </label>
          <select
            name="cliente_id"
            defaultValue={initialData?.cliente_id ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">Sin cliente (independiente)</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.razon_social}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Descripci&oacute;n <span className="text-red-500">*</span>
          </label>
          <input
            name="descripcion"
            required
            defaultValue={initialData?.descripcion ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            placeholder="Detalle del pedido o oportunidad"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Material
            </label>
            <select
              name="material_id"
              defaultValue={initialData?.material_id ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">Sin material</option>
              {materiales.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Cantidad (toneladas)
            </label>
            <input
              name="cantidad"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialData?.cantidad ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Monto (MXN) <span className="text-red-500">*</span>
            </label>
            <input
              name="monto"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={initialData?.monto ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              name="estado"
              required
              defaultValue={initialData?.estado ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">Seleccionar estado</option>
              <option value="propuesta">Propuesta</option>
              <option value="en_proceso">En proceso</option>
              <option value="ganada">Ganada</option>
              <option value="perdida">Perdida</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Fecha de creaci&oacute;n
            </label>
            <input
              name="fecha_creacion"
              type="date"
              defaultValue={initialData?.fecha_creacion ?? new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Fecha de cierre estimada
            </label>
            <input
              name="fecha_cierre"
              type="date"
              defaultValue={initialData?.fecha_cierre ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Notas
          </label>
          <textarea
            name="notas"
            rows={3}
            defaultValue={initialData?.notas ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 resize-none"
            placeholder="Notas adicionales sobre la venta"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <a
          href="/ventas"
          className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
