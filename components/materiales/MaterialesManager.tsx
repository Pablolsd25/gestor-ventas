"use client";

import { useActionState, useEffect, useState } from "react";
import type { MaterialRow } from "@/types/database";
import {
  createMaterialAction,
  updateMaterialAction,
  deleteMaterialAction,
} from "@/app/materiales/actions";

function AddMaterial() {
  const [state, formAction, pending] = useActionState(createMaterialAction, undefined);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (state?.success) setKey((k) => k + 1);
  }, [state]);

  return (
    <form key={key} action={formAction} className="flex items-start gap-2">
      <div className="flex-1">
        <input
          name="nombre"
          placeholder="Nuevo material…"
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{state.error}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
      >
        {pending ? "…" : "Agregar"}
      </button>
    </form>
  );
}

function MaterialRowItem({ material }: { material: MaterialRow }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updating] = useActionState(
    updateMaterialAction.bind(null, material.id),
    undefined
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteMaterialAction.bind(null, material.id),
    undefined
  );

  useEffect(() => {
    if (updateState?.success) setEditing(false);
  }, [updateState]);

  if (editing) {
    return (
      <form action={updateAction} className="flex items-center gap-2 px-4 py-3">
        <span className="text-xs text-gray-400 dark:text-slate-500 font-mono w-8 shrink-0">#{material.id}</span>
        <input
          name="nombre"
          defaultValue={material.nombre}
          autoFocus
          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={updating}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-2 py-1"
        >
          {updating ? "…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 px-2 py-1"
        >
          Cancelar
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 group hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
      <span className="text-xs text-gray-400 dark:text-slate-500 font-mono w-8 shrink-0">#{material.id}</span>
      <span className="flex-1 text-sm text-gray-800 dark:text-slate-200">{material.nombre}</span>
      {deleteState?.error && (
        <span className="text-[11px] text-red-600 dark:text-red-400 max-w-[200px] text-right">{deleteState.error}</span>
      )}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1"
        >
          Editar
        </button>
        <form action={deleteAction}>
          <button
            type="submit"
            disabled={deleting}
            className="text-xs text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1"
          >
            {deleting ? "…" : "Eliminar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MaterialesManager({ materiales }: { materiales: MaterialRow[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-slate-700 p-4">
        <AddMaterial />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-slate-700 overflow-hidden divide-y divide-gray-50 dark:divide-slate-700">
        {materiales.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-12">Aún no hay materiales.</p>
        ) : (
          materiales.map((m) => <MaterialRowItem key={m.id} material={m} />)
        )}
      </div>
    </div>
  );
}
