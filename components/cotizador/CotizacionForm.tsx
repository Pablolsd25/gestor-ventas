"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatMonto } from "@/lib/utils";
import type { ActionState } from "@/app/cotizador/actions";

interface Item {
  descripcion: string;
  material_id: string;
  cantidad: string;
  precio_unitario: string;
}

interface CotizacionData {
  cliente_id: string;
  cliente_nombre: string;
  fecha: string;
  validez_dias: string;
  notas: string;
  items: Item[];
}

interface Props {
  action: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  clientes: Array<{ id: string; razon_social: string }>;
  materiales: Array<{ id: number; nombre: string }>;
  initialData?: CotizacionData;
}

const emptyItem = (): Item => ({ descripcion: "", material_id: "", cantidad: "1", precio_unitario: "0" });

// Clases reutilizables
const inputCls = "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const selectCls = "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5";
const cardCls = "bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6";

export default function CotizacionForm({
  action,
  submitLabel,
  clientes,
  materiales,
  initialData,
}: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  const [clienteId, setClienteId] = useState(initialData?.cliente_id ?? "");
  const [clienteNombre, setClienteNombre] = useState(initialData?.cliente_nombre ?? "");
  const [items, setItems] = useState<Item[]>(
    initialData?.items?.length ? initialData.items : [emptyItem()]
  );

  useEffect(() => {
    if (state?.error) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (parseFloat(it.cantidad) || 0) * (parseFloat(it.precio_unitario) || 0),
        0
      ),
    [items]
  );

  function updateItem(idx: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }
  function removeItem(idx: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  const selectedClienteNombre = clientes.find((c) => c.id === clienteId)?.razon_social ?? "";
  const itemsJson = JSON.stringify(
    items.map((it) => ({
      descripcion: it.descripcion,
      material_id: it.material_id || null,
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
    }))
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {state.error}
        </div>
      )}

      <input type="hidden" name="items" value={itemsJson} />
      <input
        type="hidden"
        name="cliente_nombre"
        value={clienteId ? selectedClienteNombre : clienteNombre}
      />

      {/* ── Datos generales ── */}
      <div className={cardCls + " space-y-5"}>
        <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-base border-b border-gray-100 dark:border-slate-700 pb-3">
          Datos de la cotización
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Cliente del catálogo</label>
            <select
              name="cliente_id"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className={selectCls}
            >
              <option value="">— Sin cliente / manual —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.razon_social}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>
              Nombre del cliente {clienteId ? "(del catálogo)" : ""}
            </label>
            <input
              value={clienteId ? selectedClienteNombre : clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              disabled={!!clienteId}
              placeholder="Nombre o razón social"
              className={inputCls + " disabled:bg-gray-100 disabled:dark:bg-slate-700/50 disabled:text-gray-500 disabled:dark:text-slate-500"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Fecha</label>
            <input
              name="fecha"
              type="date"
              defaultValue={initialData?.fecha ?? new Date().toISOString().split("T")[0]}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Validez (días)</label>
            <input
              name="validez_dias"
              type="number"
              min="0"
              defaultValue={initialData?.validez_dias ?? "15"}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Partidas ── */}
      <div className={cardCls + " space-y-4"}>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3">
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-base">Partidas</h3>
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            + Agregar partida
          </button>
        </div>

        <div className="space-y-3">
          {items.map((it, idx) => {
            const subtotal = (parseFloat(it.cantidad) || 0) * (parseFloat(it.precio_unitario) || 0);
            return (
              <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 md:col-span-4">
                  <input
                    value={it.descripcion}
                    onChange={(e) => updateItem(idx, { descripcion: e.target.value })}
                    placeholder="Descripción"
                    className={inputCls}
                  />
                </div>
                <div className="col-span-5 md:col-span-3">
                  <select
                    value={it.material_id}
                    onChange={(e) => updateItem(idx, { material_id: e.target.value })}
                    className={selectCls}
                  >
                    <option value="">Material…</option>
                    {materiales.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3 md:col-span-1">
                  <input
                    value={it.cantidad}
                    onChange={(e) => updateItem(idx, { cantidad: e.target.value })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Cant."
                    className={inputCls}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input
                    value={it.precio_unitario}
                    onChange={(e) => updateItem(idx, { precio_unitario: e.target.value })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="P. unit."
                    className={inputCls}
                  />
                </div>
                <div className="col-span-6 md:col-span-1 flex items-center text-sm text-gray-700 dark:text-slate-300 font-medium pt-2">
                  {formatMonto(subtotal)}
                </div>
                <div className="col-span-2 md:col-span-1 flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 p-1.5"
                    title="Eliminar partida"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-slate-700">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatMonto(total)}</p>
          </div>
        </div>
      </div>

      {/* ── Notas ── */}
      <div className={cardCls}>
        <label className={labelCls}>Notas / condiciones</label>
        <textarea
          name="notas"
          rows={3}
          defaultValue={initialData?.notas ?? ""}
          placeholder="Condiciones de pago, entrega, etc."
          className={inputCls + " resize-none"}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/cotizador"
          className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </Link>
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
