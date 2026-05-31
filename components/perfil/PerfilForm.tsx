"use client";

import { useActionState, useState } from "react";
import { updatePerfilAction } from "@/app/perfil/actions";
import Avatar from "@/components/layout/Avatar";

interface Props {
  nombre: string;
  puesto: string;
  fotoUrl: string;
}

export default function PerfilForm({ nombre, puesto, fotoUrl }: Props) {
  const [state, formAction, pending] = useActionState(updatePerfilAction, undefined);
  const [nombreVal, setNombreVal] = useState(nombre);
  const [fotoVal, setFotoVal] = useState(fotoUrl);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          Perfil guardado correctamente.
        </div>
      )}

      <div className="flex items-center gap-4">
        <Avatar nombre={nombreVal || "Vendedor"} fotoUrl={fotoVal || null} className="w-16 h-16" textClass="text-lg" />
        <div className="text-sm text-gray-500">
          Vista previa del avatar.
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
        <input
          name="nombre"
          value={nombreVal}
          onChange={(e) => setNombreVal(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Puesto</label>
        <input
          name="puesto"
          defaultValue={puesto}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej. Vendedor senior"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">URL de la foto</label>
        <input
          name="foto_url"
          value={fotoVal}
          onChange={(e) => setFotoVal(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://… (deja vacío para usar iniciales)"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Pega un enlace público a tu foto. Si lo dejas vacío se mostrarán tus iniciales.
        </p>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {pending ? "Guardando…" : "Guardar perfil"}
        </button>
      </div>
    </form>
  );
}
