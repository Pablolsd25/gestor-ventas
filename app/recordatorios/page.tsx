import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { RecordatorioConUniones } from "@/types/database";
import RecordatorioItem from "@/components/recordatorios/RecordatorioItem";
import CalendarioRecordatorios from "@/components/recordatorios/CalendarioRecordatorios";
import Link from "next/link";

export default async function RecordatoriosPage() {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("recordatorios")
    .select("*, clientes(razon_social)")
    .order("fecha")
    .order("hora");

  const recordatorios = (data ?? []) as RecordatorioConUniones[];

  const today     = new Date().toISOString().split("T")[0];
  const pendientes  = recordatorios.filter((r) => !r.completado);
  const completados = recordatorios.filter((r) =>  r.completado);
  const altaPrioridad = pendientes.filter((r) => r.prioridad === "alta").length;

  const atrasados = pendientes.filter((r) => r.fecha < today);
  const deHoy     = pendientes.filter((r) => r.fecha === today);

  return (
    <div className="space-y-6">
      {/* ── Alertas ─────────────────────────────────────────── */}
      {atrasados.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
          <span className="text-lg leading-none shrink-0">&#9888;&#65039;</span>
          <div>
            <p className="font-semibold">
              {atrasados.length} recordatorio{atrasados.length > 1 ? "s" : ""} vencido{atrasados.length > 1 ? "s" : ""}
            </p>
            <p className="text-red-600 dark:text-red-400 mt-0.5">
              {atrasados.slice(0, 3).map((r) => r.titulo).join(", ")}
              {atrasados.length > 3 ? ` y ${atrasados.length - 3} más` : ""}
            </p>
          </div>
        </div>
      )}

      {deHoy.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200">
          <span className="text-lg leading-none shrink-0">&#128276;</span>
          <div>
            <p className="font-semibold">
              {deHoy.length} recordatorio{deHoy.length > 1 ? "s" : ""} para hoy
            </p>
            <p className="text-amber-600 dark:text-amber-400 mt-0.5">
              {deHoy.slice(0, 3).map((r) => `${r.hora.slice(0, 5)} ${r.titulo}`).join(", ")}
              {deHoy.length > 3 ? ` y ${deHoy.length - 3} más` : ""}
            </p>
          </div>
        </div>
      )}

      {/* ── Stats + acción ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="grid grid-cols-3 gap-4 flex-1">
          {[
            { label: "Pendientes",     valor: pendientes.length,  color: "text-amber-600"  },
            { label: "Alta prioridad", valor: altaPrioridad,      color: "text-red-600"    },
            { label: "Completados",    valor: completados.length, color: "text-green-600"  },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.valor}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <Link
          href="/recordatorios/nuevo"
          className="self-start sm:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          + Nuevo Recordatorio
        </Link>
      </div>

      {/* ── Calendario ──────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
          Calendario
        </h3>
        <CalendarioRecordatorios recordatorios={pendientes} />
      </div>

      {/* ── Pendientes ──────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
          Pendientes ({pendientes.length})
        </h3>
        <div className="space-y-3">
          {pendientes.map((r) => (
            <RecordatorioItem
              key={r.id}
              r={{
                id:             r.id,
                titulo:         r.titulo,
                descripcion:    r.descripcion,
                cliente_id:     r.cliente_id,
                cliente_nombre: r.clientes?.razon_social ?? null,
                venta_id:       r.venta_id,
                fecha:          r.fecha,
                hora:           r.hora,
                prioridad:      r.prioridad,
                tipo:           r.tipo,
                completado:     r.completado,
              }}
            />
          ))}
          {pendientes.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-8 text-center text-gray-400 dark:text-slate-500">
              Sin recordatorios pendientes
            </div>
          )}
        </div>
      </div>

      {/* ── Completados ─────────────────────────────────────── */}
      {completados.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 dark:text-slate-500 mb-3 uppercase tracking-wide">
            Completados ({completados.length})
          </h3>
          <div className="space-y-2">
            {completados.map((r) => (
              <div
                key={r.id}
                className="bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-4 opacity-60"
              >
                <span className="text-xl">{TIPO_ICONO[r.tipo]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 dark:text-slate-400 line-through truncate">{r.titulo}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {r.fecha} &middot; {r.hora.slice(0, 5)}
                    {r.clientes?.razon_social && ` · ${r.clientes.razon_social}`}
                  </p>
                </div>
                <span className="text-xs text-green-600 font-medium shrink-0">&#10003; Completado</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const TIPO_ICONO: Record<string, string> = {
  llamada:     "📞",
  reunion:     "🤝",
  email:       "✉️",
  seguimiento: "🔍",
  otro:        "📌",
};
