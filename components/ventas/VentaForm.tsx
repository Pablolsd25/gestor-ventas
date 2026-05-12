"use client";

import { useActionState, useEffect, useRef } from "react";
import { MATERIALES } from "@/types/index";
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

interface VentaFormProps {
  action: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  initialData?: VentaData;
  submitLabel: string;
  clientes: Array<{ id: string; razon_social: string }>;
  materiales: Array<{ id: number; nombre: string }>;
}

export default function VentaForm({
  action,
  initialData,
  submitLabel,
  clientes,
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
          Datos de la Venta
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Cliente
          </label>
          <select
            name="cliente_id"
            defaultValue={initialData?.cliente_id ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Descripci&oacute;n <span className="text-red-500">*</span>
          </label>
          <input
            name="descripcion"
            required
            defaultValue={initialData?.descripcion ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Detalle del pedido o oportunidad"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Material
            </label>
            <select
              name="material_id"
              defaultValue={initialData?.material_id ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Sin material</option>
              {MATERIALES.map((m) => {
                const id = m.split(". ")[0];
                return (
                  <option key={m} value={id}>
                    {m}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cantidad (toneladas)
            </label>
            <input
              name="cantidad"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialData?.cantidad ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Monto (MXN) <span className="text-red-500">*</span>
            </label>
            <input
              name="monto"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={initialData?.monto ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              name="estado"
              required
              defaultValue={initialData?.estado ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Fecha de creaci&oacute;n
            </label>
            <input
              name="fecha_creacion"
              type="date"
              defaultValue={initialData?.fecha_creacion ?? new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Fecha de cierre estimada
            </label>
            <input
              name="fecha_cierre"
              type="date"
              defaultValue={initialData?.fecha_cierre ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notas
          </label>
          <textarea
            name="notas"
            rows={3}
            defaultValue={initialData?.notas ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Notas adicionales sobre la venta"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <a
          href="/ventas"
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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
