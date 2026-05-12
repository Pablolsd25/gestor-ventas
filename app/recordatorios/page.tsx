import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { RecordatorioConUniones } from "@/types/database";
import RecordatorioItem from "@/components/recordatorios/RecordatorioItem";
import Link from "next/link";

export default async function RecordatoriosPage() {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("recordatorios")
    .select("*, clientes(razon_social)")
    .order("fecha")
    .order("hora");

  const recordatorios = (data ?? []) as RecordatorioConUniones[];

  const pendientes  = recordatorios.filter((r) => !r.completado);
  const completados = recordatorios.filter((r) => r.completado);
  const altaPrioridad = pendientes.filter((r) => r.prioridad === "alta").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendientes",      valor: pendientes.length, color: "text-amber-600" },
          { label: "Alta prioridad",   valor: altaPrioridad,    color: "text-red-600" },
          { label: "Completados",      valor: completados.length, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.valor}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Accion */}
      <div className="flex justify-end">
        <Link
          href="/recordatorios/nuevo"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nuevo Recordatorio
        </Link>
      </div>

      {/* Pendientes */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Pendientes ({pendientes.length})
        </h3>
        <div className="space-y-3">
          {pendientes.map((r) => (
            <RecordatorioItem
              key={r.id}
              r={{
                id: r.id,
                titulo: r.titulo,
                descripcion: r.descripcion,
                cliente_id: r.cliente_id,
                cliente_nombre: r.clientes?.razon_social ?? null,
                venta_id: r.venta_id,
                fecha: r.fecha,
                hora: r.hora,
                prioridad: r.prioridad,
                tipo: r.tipo,
                completado: r.completado,
              }}
            />
          ))}
          {pendientes.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              Sin recordatorios pendientes
            </div>
          )}
        </div>
      </div>

      {/* Completados */}
      {completados.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            Completados ({completados.length})
          </h3>
          <div className="space-y-2">
            {completados.map((r) => (
              <div
                key={r.id}
                className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center gap-4 opacity-60"
              >
                <span className="text-xl">{tipoIconoStatic[r.tipo]}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 line-through">{r.titulo}</p>
                  <p className="text-xs text-gray-400">
                    {r.fecha} · {r.hora.slice(0, 5)}
                    {r.clientes?.razon_social && ` · ${r.clientes.razon_social}`}
                  </p>
                </div>
                <span className="text-xs text-green-600 font-medium">✓ Completado</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const tipoIconoStatic: Record<string, string> = {
  llamada:     "📞",
  reunion:     "🤝",
  email:       "✉️",
  seguimiento: "🔍",
  otro:        "📌",
};
