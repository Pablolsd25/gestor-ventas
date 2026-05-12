"use client";

import React, { useActionState, useEffect, useRef } from "react";
import { MATERIALES } from "@/types/index";
import type { ActionState } from "@/app/clientes/actions";

interface ContactoData {
  id?: string;
  nombre: string;
  telefonos: string[];
  correo: string | null;
}

interface FormProps {
  action: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  initialData?: {
    id?: string;
    razon_social: string;
    sae: string;
    ciudad: string;
    status: "Venta" | "Credito" | "Prospecto" | "";
    comentarios: string;
    contactos: ContactoData[];
    materiales: string[];
  };
  submitLabel: string;
  isEdit?: boolean;
}

function emptyContacto(): ContactoData {
  return { nombre: "", telefonos: [""], correo: null };
}

export default function ClienteForm({
  action,
  initialData,
  submitLabel,
  isEdit = false,
}: FormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  const [contactos, setContactos] = React.useState<ContactoData[]>(
    initialData?.contactos?.length ? initialData.contactos : [{ ...emptyContacto() }]
  );
  const [selectedMaterials, setSelectedMaterials] = React.useState<Set<string>>(
    new Set(initialData?.materiales ?? [])
  );

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

  function toggleMaterial(material: string) {
    setSelectedMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(material)) {
        next.delete(material);
      } else {
        next.add(material);
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    fd.set("contactos", JSON.stringify(contactos));
    fd.set("materiales", JSON.stringify(Array.from(selectedMaterials)));
    formAction(fd);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {state && "error" in state && state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
          Datos del Cliente
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Raz&oacute;n Social <span className="text-red-500">*</span>
          </label>
          <input
            name="razon_social"
            required
            defaultValue={initialData?.razon_social ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nombre o raz&oacute;n social de la empresa"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              C&oacute;digo SAE
            </label>
            <input
              name="sae"
              defaultValue={initialData?.sae ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 001, 002…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ciudad / Estado <span className="text-red-500">*</span>
            </label>
            <input
              name="ciudad"
              required
              defaultValue={initialData?.ciudad ?? ""}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ciudad o estado"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <select
            name="status"
            defaultValue={initialData?.status ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Sin clasificar</option>
            <option value="Venta">Venta</option>
            <option value="Credito">Cr&eacute;dito</option>
            <option value="Prospecto">Prospecto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Comentarios
          </label>
          <textarea
            name="comentarios"
            rows={3}
            defaultValue={initialData?.comentarios ?? ""}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Notas, fechas de cierre, motivos, seguimiento…"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-semibold text-gray-800 text-base">Contactos</h3>
          <button
            type="button"
            onClick={addContacto}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Agregar contacto
          </button>
        </div>

        {contactos.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-3">
            Sin contactos. Haz clic en &quot;Agregar contacto&quot;.
          </p>
        )}

        {contactos.map((contacto, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Contacto {idx + 1}
              </span>
              {contactos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContacto(idx)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Tel&eacute;fonos</label>
              <div className="space-y-1.5">
                {contacto.telefonos.map((tel, telIdx) => (
                  <div key={telIdx} className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="(55) 1234-5678"
                      value={tel}
                      onChange={(e) => updateTelefono(idx, telIdx, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {contacto.telefonos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTelefono(idx, telIdx)}
                        className="text-gray-400 hover:text-red-500 text-sm px-2"
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
                className="mt-1.5 text-xs text-blue-600 hover:text-blue-700"
              >
                + Agregar tel&eacute;fono
              </button>
            </div>

            <input
              type="email"
              placeholder="Correo electr&oacute;nico"
              value={contacto.correo ?? ""}
              onChange={(e) => updateContacto(idx, "correo", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
          Materiales que consume
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {MATERIALES.map((m) => (
            <label
              key={m}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                selectedMaterials.has(m)
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMaterials.has(m)}
                onChange={() => toggleMaterial(m)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="font-medium">{m.split(". ")[0]}.</span>
              <span className="text-xs">{m.split(". ")[1]}</span>
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
