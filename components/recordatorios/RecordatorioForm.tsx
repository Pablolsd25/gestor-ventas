"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/app/recordatorios/actions";

interface RecordatorioData {
  id?: string;
  titulo: string;
  descripcion: string;
  cliente_id: string;
  venta_id: string;
  fecha: string;
  hora: string;
  prioridad: "alta" | "media" | "baja" | "";
  tipo: "llamada" | "reunion" | "email" | "seguimiento" | "otro" | "";
}

interface RecordatorioFormProps {
  action: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  initialData?: RecordatorioData;
  submitLabel: string;
  clientes: Array<{ id: string; razon_social: string }>;
}

export default function RecordatorioForm({
  action,
  initialData,
  submitLabel,
  clientes,
}: RecordatorioFormProps) {
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
          Datos del Recordatorio
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            T&iacute;tulo <span className="text-red-500">*</span>
          </label>
          <input
            name="titulo"
            required
            defaultValue={initialData?.titulo ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            placeholder="Qu&eacute; necesitas recordar"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Descripci&oacute;n
          </label>
          <textarea
            name="descripcion"
            rows={3}
            defaultValue={initialData?.descripcion ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 resize-none"
            placeholder="Detalles adicionales"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Cliente asociado
          </label>
          <select
            name="cliente_id"
            defaultValue={initialData?.cliente_id ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">Sin cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.razon_social}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              name="fecha"
              type="date"
              required
              defaultValue={initialData?.fecha ?? new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Hora <span className="text-red-500">*</span>
            </label>
            <input
              name="hora"
              type="time"
              required
              defaultValue={initialData?.hora ?? "09:00"}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Prioridad <span className="text-red-500">*</span>
            </label>
            <select
              name="prioridad"
              required
              defaultValue={initialData?.prioridad ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">Seleccionar prioridad</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              name="tipo"
              required
              defaultValue={initialData?.tipo ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">Seleccionar tipo</option>
              <option value="llamada">Llamada</option>
              <option value="reunion">Reuni&oacute;n</option>
              <option value="email">Email</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <a
          href="/recordatorios"
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
