"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  ciudades: string[];
  materiales: string[];
}

export default function ClientesFilters({ ciudades, materiales }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const material = params.get("material") ?? "";
  const ciudad = params.get("ciudad") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/clientes?${next.toString()}`);
  }

  function clear() {
    const next = new URLSearchParams(params.toString());
    next.delete("material");
    next.delete("ciudad");
    router.push(`/clientes?${next.toString()}`);
  }

  const hasFilters = material || ciudad;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={material}
        onChange={(e) => update("material", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos los materiales</option>
        {materiales.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select
        value={ciudad}
        onChange={(e) => update("ciudad", e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas las ciudades</option>
        {ciudades.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clear}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-2 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
