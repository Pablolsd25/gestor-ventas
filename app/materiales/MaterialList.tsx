"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createMaterialAction,
  updateMaterialAction,
  deleteMaterialAction,
} from "./actions";
import { useToast } from "@/components/ui/toast";

interface Material {
  id: number;
  nombre: string;
}

export default function MaterialList({
  materiales,
}: {
  materiales: Material[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [createPending, startCreateTransition] = useTransition();
  const [updatePending, startUpdateTransition] = useTransition();
  const { showToast } = useToast();

  function startEdit(m: Material) {
    setEditingId(m.id);
    setEditName(m.nombre);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function handleCreate(formData: FormData) {
    startCreateTransition(async () => {
      const res = await createMaterialAction(undefined, formData);
      if (res.success) {
        showToast("Material creado exitosamente");
        router.refresh();
      } else if (res.error) {
        showToast(res.error, "error");
      }
    });
  }

  function handleUpdate(formData: FormData) {
    if (editingId === null) return;
    startUpdateTransition(async () => {
      const res = await updateMaterialAction(editingId, undefined, formData);
      if (res.success) {
        showToast("Material actualizado exitosamente");
        setEditingId(null);
        setEditName("");
        router.refresh();
      } else if (res.error) {
        showToast(res.error, "error");
      }
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este material? Los clientes que lo usen dejarán de tenerlo asignado.")) return;
    const res = await deleteMaterialAction(id);
    if (res.success) {
      showToast("Material eliminado correctamente");
      router.refresh();
    } else if (res.error) {
      showToast(res.error, "error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Nuevo material */}
      <form action={handleCreate} className="flex items-center gap-3">
        <input
          name="nombre"
          required
          placeholder="Nombre del nuevo material"
          className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={createPending}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          {createPending ? "Agregando…" : "Agregar"}
        </button>
      </form>

      {/* Lista */}
      <div className="divide-y divide-gray-100 dark:divide-slate-700">
        {materiales.map((m) => (
          <div key={m.id} className="flex items-center gap-3 py-3">
            <span className="w-8 text-sm font-bold text-gray-400 dark:text-slate-500 shrink-0 text-center">
              {m.id}.
            </span>

            {editingId === m.id ? (
              <form action={handleUpdate} className="flex-1 flex items-center gap-2">
                <input
                  name="nombre"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  autoFocus
                  className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={updatePending}
                  className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {updatePending ? "…" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-800 dark:text-slate-100">{m.nombre}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(m)}
                    className="text-gray-400 hover:text-amber-600 dark:text-slate-500 dark:hover:text-amber-400 transition-colors p-1.5 rounded hover:bg-amber-50 dark:hover:bg-amber-900/30"
                    title="Editar material"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Eliminar material"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4h-4v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {materiales.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">
            No hay materiales registrados. Agrega el primero arriba.
          </p>
        )}
      </div>
    </div>
  );
}
