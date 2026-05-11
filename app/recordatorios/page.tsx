import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { RecordatorioConUniones } from "@/types/database";

const prioridadColor: Record<string, string> = {
  alta:  "bg-red-100 text-red-700 border-red-200",
  media: "bg-amber-100 text-amber-700 border-amber-200",
  baja:  "bg-gray-100 text-gray-600 border-gray-200",
};

const tipoIcono: Record<string, string> = {
  llamada:     "📞",
  reunion:     "🤝",
  email:       "✉️",
  seguimiento: "🔍",
  otro:        "📌",
};

const tipoLabel: Record<string, string> = {
  llamada:     "Llamada",
  reunion:     "Reunión",
  email:       "Email",
  seguimiento: "Seguimiento",
  otro:        "Otro",
};

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
          { label: "Alta prioridad",  valor: altaPrioridad,     color: "text-red-600" },
          { label: "Completados",     valor: completados.length, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.valor}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Acción */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          + Nuevo Recordatorio
        </button>
      </div>

      {/* Pendientes */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Pendientes ({pendientes.length})
        </h3>
        <div className="space-y-3">
          {pendientes.map((r) => (
            <div
              key={r.id}
              className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 ${prioridadColor[r.prioridad]}`}
            >
              <span className="text-2xl mt-0.5">{tipoIcono[r.tipo]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900">{r.titulo}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${prioridadColor[r.prioridad]}`}>
                    {r.prioridad}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {tipoLabel[r.tipo]}
                  </span>
                </div>
                {r.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">{r.descripcion}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>📅 {r.fecha} · {r.hora.slice(0, 5)}</span>
                  {r.clientes?.razon_social && (
                    <span>👤 {r.clientes.razon_social}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  ✓ Completar
                </button>
                <button className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                  Editar
                </button>
              </div>
            </div>
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
                <span className="text-xl">{tipoIcono[r.tipo]}</span>
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
