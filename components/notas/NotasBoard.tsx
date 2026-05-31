"use client";

import { useActionState, useEffect, useState } from "react";
import type { NotaRow } from "@/types/database";
import { createNotaAction, updateNotaAction, deleteNotaAction } from "@/app/notas/actions";

const COLOR_STYLES: Record<string, { card: string; dot: string; label: string }> = {
  amarillo: { card: "bg-amber-50 border-amber-200",   dot: "bg-amber-400",   label: "Amarillo" },
  azul:     { card: "bg-blue-50 border-blue-200",     dot: "bg-blue-400",    label: "Azul" },
  verde:    { card: "bg-green-50 border-green-200",   dot: "bg-green-400",   label: "Verde" },
  rosa:     { card: "bg-pink-50 border-pink-200",     dot: "bg-pink-400",    label: "Rosa" },
  morado:   { card: "bg-purple-50 border-purple-200", dot: "bg-purple-400",  label: "Morado" },
  gris:     { card: "bg-gray-50 border-gray-200",     dot: "bg-gray-400",    label: "Gris" },
};
const COLORES = Object.keys(COLOR_STYLES);

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {COLORES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          title={COLOR_STYLES[c].label}
          className={[
            "w-6 h-6 rounded-full border-2 transition-transform",
            COLOR_STYLES[c].dot,
            value === c ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : "border-white",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function NewNote() {
  const [state, formAction, pending] = useActionState(createNotaAction, undefined);
  const [color, setColor] = useState("amarillo");
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (state?.success) {
      setColor("amarillo");
      setKey((k) => k + 1);
    }
  }, [state]);

  return (
    <form
      key={key}
      action={formAction}
      className={`rounded-xl border p-4 space-y-3 ${COLOR_STYLES[color].card}`}
    >
      <input
        name="titulo"
        placeholder="Título"
        className="w-full bg-transparent font-semibold text-gray-800 placeholder-gray-400 focus:outline-none"
      />
      <textarea
        name="contenido"
        placeholder="Escribe una nota…"
        rows={3}
        className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
      />
      <input type="hidden" name="color" value={color} />
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex items-center justify-between">
        <ColorPicker value={color} onChange={setColor} />
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {pending ? "Guardando…" : "Agregar"}
        </button>
      </div>
    </form>
  );
}

function NoteCard({ nota }: { nota: NotaRow }) {
  const [editing, setEditing] = useState(false);
  const [color, setColor] = useState<string>(nota.color);
  const [updateState, updateAction, updating] = useActionState(
    updateNotaAction.bind(null, nota.id),
    undefined
  );
  const [, deleteAction, deleting] = useActionState(
    deleteNotaAction.bind(null, nota.id),
    undefined
  );

  useEffect(() => {
    if (updateState?.success) setEditing(false);
  }, [updateState]);

  const styles = COLOR_STYLES[nota.color] ?? COLOR_STYLES.amarillo;

  if (editing) {
    return (
      <form action={updateAction} className={`rounded-xl border p-4 space-y-3 ${COLOR_STYLES[color].card}`}>
        <input
          name="titulo"
          defaultValue={nota.titulo}
          placeholder="Título"
          className="w-full bg-transparent font-semibold text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        <textarea
          name="contenido"
          defaultValue={nota.contenido}
          rows={4}
          className="w-full bg-transparent text-sm text-gray-700 focus:outline-none resize-none"
        />
        <input type="hidden" name="color" value={color} />
        {updateState?.error && <p className="text-xs text-red-600">{updateState.error}</p>}
        <div className="flex items-center justify-between">
          <ColorPicker value={color} onChange={setColor} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setEditing(false); setColor(nota.color); }}
              className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white text-xs font-medium rounded-lg"
            >
              {updating ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className={`group rounded-xl border p-4 ${styles.card} flex flex-col`}>
      {nota.titulo && <p className="font-semibold text-gray-800 mb-1 break-words">{nota.titulo}</p>}
      {nota.contenido && (
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words flex-1">{nota.contenido}</p>
      )}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5">
        <span className="text-[11px] text-gray-400">
          {new Date(nota.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-500 hover:text-blue-600 px-1.5 py-1"
          >
            Editar
          </button>
          <form action={deleteAction}>
            <button
              type="submit"
              disabled={deleting}
              className="text-xs text-gray-500 hover:text-red-600 px-1.5 py-1"
            >
              {deleting ? "…" : "Eliminar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NotasBoard({ notas }: { notas: NotaRow[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <NewNote />
      {notas.map((n) => (
        <NoteCard key={n.id} nota={n} />
      ))}
    </div>
  );
}
