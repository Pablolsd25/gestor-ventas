"use client";

import React, { useActionState, useEffect, useRef, useCallback } from "react";
import type { ActionState } from "@/app/clientes/actions";

interface ContactoData {
  id?: string;
  nombre: string;
  telefonos: string[];
  correos: string[];
}

interface MaterialOption {
  id: number;
  nombre: string;
}

interface FormProps {
  action: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  initialData?: {
    id?: string;
    razon_social: string;
    sae: string;
    ciudad: string;
    pagina_web: string;
    status: "Venta" | "Credito" | "Prospecto" | "";
    semaforo: "verde" | "amarillo" | "rojo" | "";
    comentarios: string;
    contactos: (ContactoData & { correo?: string | null })[];
    materiales: string[] | number[];
  };
  submitLabel: string;
  isEdit?: boolean;
  materiales: MaterialOption[];
}

function emptyContacto(): ContactoData {
  return { nombre: "", telefonos: [""], correos: [""] };
}

export default function ClienteForm({
  action,
  initialData,
  submitLabel,
  isEdit = false,
  materiales: materialOptions,
}: FormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [contactos, setContactos] = React.useState<ContactoData[]>(
    initialData?.contactos?.length
      ? initialData.contactos.map((c) => ({
          ...c,
          correos: c.correos?.length
            ? c.correos
            : c.correo
              ? [c.correo]
              : [""],
        }))
      : [{ ...emptyContacto() }]
  );
  const [selectedMaterials, setSelectedMaterials] = React.useState<Set<number>>(
    () => {
      const raw = initialData?.materiales ?? [];
      const ids: number[] = raw.map((v) => {
        if (typeof v === "number") return v;
        const match = materialOptions.find((m) => m.nombre === v);
        return match ? match.id : -1;
      });
      return new Set(ids.filter((id) => id > 0));
    }
  );

  const contactosRef = useRef(contactos);
  contactosRef.current = contactos;
  const materialesRef = useRef(selectedMaterials);
  materialesRef.current = selectedMaterials;

  const wrappedAction = useCallback(
    (prev: ActionState | undefined, formData: FormData) => {
      formData.set("contactos", JSON.stringify(contactosRef.current));
      formData.set("materiales", JSON.stringify(Array.from(materialesRef.current)));
      return action(prev, formData);
    },
    [action]
  );

  const [state, formAction, pending] = useActionState(wrappedAction, undefined);

  useEffect(() => {
    if (state && "error" in state && state.error) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state]);

  function addContacto() {
    setContactos((prev) => [...prev, { ...emptyContacto() }]);
  }

  function removeContacto(index: number) {
    setContactos((prev) => prev.filter((_, i) => i !== index));
  }

  function updateContacto<K extends keyof ContactoData>(
    index: number,
    field: K,
    value: ContactoData[K]
  ) {
    setContactos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addTelefono(contactoIndex: number) {
    setContactos((prev) => {
      const next = [...prev];
      next[contactoIndex] = {
        ...next[contactoIndex],
        telefonos: [...next[contactoIndex].telefonos, ""],
      };
      return next;
    });
  }

  function removeTelefono(contactoIndex: number, telefonoIndex: number) {
    setContactos((prev) => {
      const next = [...prev];
      next[contactoIndex] = {
        ...next[contactoIndex],
        telefonos: next[contactoIndex].telefonos.filter((_, i) => i !== telefonoIndex),
      };
      return next;
    });
  }

  function updateTelefono(contactoIndex: number, telefonoIndex: number, value: string) {
    setContactos((prev) => {
      const next = [...prev];
      const telefonos = [...next[contactoIndex].telefonos];
      telefonos[telefonoIndex] = value;
      next[contactoIndex] = { ...next[contactoIndex], telefonos };
      return next;
    });
  }

  function addCorreo(contactoIndex: number) {
    setContactos((prev) => {
      const next = [...prev];
      next[contactoIndex] = {
        ...next[contactoIndex],
        correos: [...next[contactoIndex].correos, ""],
      };
      return next;
    });
  }

  function removeCorreo(contactoIndex: number, correoIndex: number) {
    setContactos((prev) => {
      const next = [...prev];
      next[contactoIndex] = {
        ...next[contactoIndex],
        correos: next[contactoIndex].correos.filter((_, i) => i !== correoIndex),
      };
      return next;
    });
  }

  function updateCorreo(contactoIndex: number, correoIndex: number, value: string) {
    setContactos((prev) => {
      const next = [...prev];
      const correos = [...next[contactoIndex].correos];
      correos[correoIndex] = value;
      next[contactoIndex] = { ...next[contactoIndex], correos };
      return next;
    });
  }

  function toggleMaterial(id: number) {
    setSelectedMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state && "error" in state && state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
          {state.error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-5">
        <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-base border-b border-gray-100 dark:border-slate-700 pb-3">
          Datos del Cliente
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Raz&oacute;n Social <span className="text-red-500">*</span>
          </label>
          <input
            name="razon_social"
            required
            defaultValue={initialData?.razon_social ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            placeholder="Nombre o raz&oacute;n social de la empresa"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              C&oacute;digo SAE
            </label>
            <input
              name="sae"
              defaultValue={initialData?.sae ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
              placeholder="Ej: 001, 002…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Ciudad / Estado <span className="text-red-500">*</span>
            </label>
            <input
              name="ciudad"
              required
              defaultValue={initialData?.ciudad ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
              placeholder="Ciudad o estado"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            P&aacute;gina Web
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </span>
            <input
              name="pagina_web"
              type="url"
              defaultValue={initialData?.pagina_web ?? ""}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
              placeholder="https://www.empresa.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Status
            </label>
            <select
              name="status"
              defaultValue={initialData?.status ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">Sin clasificar</option>
              <option value="Venta">Venta</option>
              <option value="Credito">Cr&eacute;dito</option>
              <option value="Prospecto">Prospecto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Sem&aacute;foro
            </label>
            <select
              name="semaforo"
              defaultValue={initialData?.semaforo ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">Sin asignar</option>
              <option value="verde">🟢 Verde — buen estado</option>
              <option value="amarillo">🟡 Amarillo — atenci&oacute;n</option>
              <option value="rojo">🔴 Rojo — urgente</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Comentarios
          </label>
          <textarea
            name="comentarios"
            rows={3}
            defaultValue={initialData?.comentarios ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 resize-none"
            placeholder="Notas, fechas de cierre, motivos, seguimiento…"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3">
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-base">Contactos</h3>
          <button
            type="button"
            onClick={addContacto}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
          >
            + Agregar contacto
          </button>
        </div>

        {contactos.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-3">
            Sin contactos. Haz clic en &quot;Agregar contacto&quot;.
          </p>
        )}

        {contactos.map((contacto, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                Contacto {idx + 1}
              </span>
              {contactos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContacto(idx)}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  Eliminar
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Nombre completo"
              value={contacto.nombre}
              onChange={(e) => updateContacto(idx, "nombre", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            />

            <div>
              <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">Tel&eacute;fonos</label>
              <div className="space-y-1.5">
                {contacto.telefonos.map((tel, telIdx) => (
                  <div key={telIdx} className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="(55) 1234-5678"
                      value={tel}
                      onChange={(e) => updateTelefono(idx, telIdx, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
                    />
                    {contacto.telefonos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTelefono(idx, telIdx)}
                        className="text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 text-sm px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addTelefono(idx)}
                className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                + Agregar tel&eacute;fono
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1.5">Correos</label>
              <div className="space-y-1.5">
                {(contacto.correos.length ? contacto.correos : [""]).map((email, emailIdx) => (
                  <div key={emailIdx} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="correo@empresa.com"
                      value={email}
                      onChange={(e) => updateCorreo(idx, emailIdx, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
                    />
                    {contacto.correos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCorreo(idx, emailIdx)}
                        className="text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 text-sm px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addCorreo(idx)}
                className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                + Agregar correo
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-base border-b border-gray-100 dark:border-slate-700 pb-3">
          Materiales que consume
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {materialOptions.map((mat) => (
            <label
              key={mat.id}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                selectedMaterials.has(mat.id)
                  ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMaterials.has(mat.id)}
                onChange={() => toggleMaterial(mat.id)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-xs font-medium">{mat.nombre}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <a
          href={isEdit && initialData?.id ? `/clientes/${initialData.id}` : "/clientes"}
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
