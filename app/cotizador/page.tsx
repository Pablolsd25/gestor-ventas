import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { CotizacionRow } from "@/types/database";
import { formatMonto } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CotizadorPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cotizaciones")
    .select("*")
    .order("fecha", { ascending: false });

  const cotizaciones = (data ?? []) as CotizacionRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Cotizador</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Genera y administra tus cotizaciones.</p>
        </div>
        <Link
          href="/cotizador/nueva"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nueva cotización
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        {cotizaciones.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-16">
            Aún no hay cotizaciones. Crea la primera.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium w-20">Folio</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Fecha</th>
                  <th className="text-right px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Total</th>
                  <th className="px-4 py-3 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                {cotizaciones.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-slate-400">#{c.folio}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">
                      {c.cliente_nombre ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                      {new Date(c.fecha + "T00:00:00").toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-slate-100">
                      {formatMonto(c.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/cotizador/${c.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
