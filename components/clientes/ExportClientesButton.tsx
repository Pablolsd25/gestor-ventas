"use client";

import { useEffect, useRef, useState } from "react";
import {
  CLIENTES_EXPORT_COLUMNS,
  clientesExportFilename,
  clientesToExportRows,
} from "@/lib/clientes-export";
import { downloadExcel, printControlTable } from "@/lib/export-table";
import type { ClienteCompletoRow } from "@/types/database";

interface Props {
  clientes: ClienteCompletoRow[];
  tabLabel: string;
  filterLabel: string;
}

export default function ExportClientesButton({ clientes, tabLabel, filterLabel }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const rows = clientesToExportRows(clientes);
  const subtitle = `Categoría: ${tabLabel}${filterLabel ? ` · ${filterLabel}` : ""}`;

  function exportExcel() {
    if (rows.length === 0) {
      alert("No hay clientes para exportar en esta vista.");
      return;
    }
    downloadExcel(clientesExportFilename(tabLabel), CLIENTES_EXPORT_COLUMNS, rows, "Clientes");
    setOpen(false);
  }

  function exportPdf() {
    if (rows.length === 0) {
      alert("No hay clientes para exportar en esta vista.");
      return;
    }
    printControlTable({
      title: "Control de Clientes",
      subtitle,
      columns: CLIENTES_EXPORT_COLUMNS,
      rows,
      footer: "GestorVentas — documento de control interno",
    });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        Exportar
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-52 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg py-1 overflow-hidden">
          <button
            type="button"
            onClick={exportExcel}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 text-left"
          >
            <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-300 text-xs font-bold shrink-0">
              XLS
            </span>
            <div>
              <p className="font-medium">Descargar Excel</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Archivo .xlsx para Excel</p>
            </div>
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 text-left"
          >
            <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-700 dark:text-red-300 text-xs font-bold shrink-0">
              PDF
            </span>
            <div>
              <p className="font-medium">Imprimir PDF</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Tabla de control limpia</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
