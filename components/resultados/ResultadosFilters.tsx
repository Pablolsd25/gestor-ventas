"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  years: number[];
  currentYear: number;
  currentMonth: number;
}

const MESES = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const selectCls =
  "px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function ResultadosFilters({ years, currentYear, currentMonth }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const year = params.get("anio") ?? String(currentYear);
  const month = params.get("mes") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/resultados?${next.toString()}`);
  }

  function clear() {
    router.push("/resultados");
  }

  const hasFilters = month || year !== String(currentYear);

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <select value={year} onChange={(e) => update("anio", e.target.value)} className={selectCls}>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select value={month} onChange={(e) => update("mes", e.target.value)} className={selectCls}>
        <option value="">Todos los meses</option>
        {MESES.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clear}
          className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 px-2 py-2 hover:underline"
        >
          Limpiar filtros
        </button>
      )}

      <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
        {month
          ? `${MESES.find((m) => m.value === month)?.label ?? ""} ${year}`
          : `Año ${year}`}
      </span>
    </div>
  );
}
