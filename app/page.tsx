import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatMonto } from "@/lib/utils";
import type { ClienteCompletoRow, VentaConUniones, RecordatorioConUniones } from "@/types/database";
import Link from "next/link";

const estadoColor: Record<string, string> = {
  ganada:     "bg-green-100 text-green-800",
  perdida:    "bg-red-100 text-red-800",
  en_proceso: "bg-amber-100 text-amber-800",
  propuesta:  "bg-blue-100 text-blue-800",
};
const estadoLabel: Record<string, string> = {
  ganada:     "Ganada",
  perdida:    "Perdida",
  en_proceso: "En proceso",
  propuesta:  "Propuesta",
};
const prioridadColor: Record<string, string> = {
  alta:  "bg-red-100 text-red-700",
  media: "bg-amber-100 text-amber-700",
  baja:  "bg-gray-100 text-gray-600",
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { data: clientesData },
    { data: ventasData },
    { data: recordatoriosData },
  ] = await Promise.all([
    supabase.from("v_clientes").select("*").order("razon_social"),
    supabase
      .from("ventas")
      .select("*, clientes(razon_social), materiales(nombre)")
      .order("fecha_creacion", { ascending: false }),
    supabase
      .from("recordatorios")
      .select("*, clientes(razon_social)")
      .order("fecha")
      .order("hora"),
  ]);

  const clientes      = (clientesData ?? []) as ClienteCompletoRow[];
  const ventas        = (ventasData    ?? []) as VentaConUniones[];
  const recordatorios = (recordatoriosData ?? []) as RecordatorioConUniones[];

  // KPIs clientes
  const enVenta    = clientes.filter((c) => c.status === "Venta").length;
  const credito    = clientes.filter((c) => c.status === "Credito").length;
  const prospectos = clientes.filter((c) => c.status === "Prospecto").length;
  const sinStatus  = clientes.filter((c) => !c.status).length;

  // KPIs ventas
  const ventasGanadas   = ventas.filter((v) => v.estado === "ganada");
  const ventasEnProceso = ventas.filter(
    (v) => v.estado === "en_proceso" || v.estado === "propuesta"
  );
  const totalFacturado = ventasGanadas.reduce((acc, v) => acc + Number(v.monto), 0);
  const pipeline       = ventasEnProceso.reduce((acc, v) => acc + Number(v.monto), 0);
  const tonGanadas     = ventasGanadas.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);
  const pendientes     = recordatorios.filter((r) => !r.completado).length;

  const proximosRecordatorios = recordatorios.filter((r) => !r.completado).slice(0, 4);
  const ultimasVentas         = ventas.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPIs clientes */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Cartera de Clientes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "En Venta",       valor: enVenta,    color: "text-green-600",  bg: "border-green-100" },
            { label: "Crédito",        valor: credito,    color: "text-blue-600",   bg: "border-blue-100" },
            { label: "Prospectos",     valor: prospectos, color: "text-amber-600",  bg: "border-amber-100" },
            { label: "Sin clasificar", valor: sinStatus,  color: "text-gray-500",   bg: "border-gray-100" },
          ].map((k) => (
            <div
              key={k.label}
              className={`bg-white rounded-xl border shadow-sm p-4 ${k.bg}`}
            >
              <p className={`text-3xl font-bold ${k.color}`}>{k.valor}</p>
              <p className="text-sm text-gray-500 mt-1">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs ventas */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Resumen de Ventas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Facturado", valor: formatMonto(totalFacturado), color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
            { label: "Pipeline Activo", valor: formatMonto(pipeline),       color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
            { label: "Ton. Entregadas", valor: `${tonGanadas} ton`,         color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
            { label: "Recordatorios",   valor: pendientes,                   color: "text-red-600",     bg: "bg-red-50 border-red-100" },
          ].map((k) => (
            <div key={k.label} className={`rounded-xl border shadow-sm p-4 ${k.bg}`}>
              <p className={`text-2xl font-bold ${k.color}`}>{k.valor}</p>
              <p className="text-sm text-gray-500 mt-1">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas ventas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Últimas Ventas / Pedidos</h3>
            <Link href="/ventas" className="text-xs text-blue-600 hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {ultimasVentas.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sin ventas registradas</p>
            )}
            {ultimasVentas.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {v.clientes?.razon_social ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {v.materiales?.nombre ?? v.descripcion}
                    {v.cantidad ? ` · ${v.cantidad} ton` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor[v.estado]}`}>
                    {estadoLabel[v.estado]}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {formatMonto(Number(v.monto))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos recordatorios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recordatorios Pendientes</h3>
            <Link href="/recordatorios" className="text-xs text-blue-600 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {proximosRecordatorios.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.titulo}</p>
                  {r.clientes?.razon_social && (
                    <p className="text-xs text-gray-500">{r.clientes.razon_social}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.fecha} · {r.hora.slice(0, 5)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${prioridadColor[r.prioridad]}`}>
                  {r.prioridad}
                </span>
              </div>
            ))}
            {proximosRecordatorios.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Sin recordatorios pendientes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Clientes con comentarios recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Clientes con Comentarios</h3>
          <Link href="/clientes" className="text-xs text-blue-600 hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="space-y-2">
          {clientes
            .filter((c) => c.comentarios)
            .map((c) => {
              const cp = (c.contactos as Array<{ nombre: string; telefonos: string[]; correo: string | null }>)[0];
              return (
                <div
                  key={c.id}
                  className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">
                        {c.razon_social}
                      </span>
                      {c.sae && (
                        <span className="text-xs text-gray-400">SAE {c.sae}</span>
                      )}
                    </div>
                    {cp?.nombre && (
                      <p className="text-xs text-gray-500">{cp.nombre}</p>
                    )}
                    <p className="text-xs text-amber-700 mt-1 italic">
                      {c.comentarios}
                    </p>
                  </div>
                  <Link
                    href={`/clientes/${c.id}`}
                    className="text-xs text-blue-600 hover:underline flex-shrink-0"
                  >
                    Ver →
                  </Link>
                </div>
              );
            })}
          {clientes.filter((c) => c.comentarios).length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Sin comentarios recientes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
