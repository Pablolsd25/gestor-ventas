import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatMonto } from "@/lib/utils";
import Link from "next/link";
import type { VentaConUniones } from "@/types/database";
import DeleteVentaButton from "@/components/ventas/DeleteVentaButton";

// ── Estado helpers ─────────────────────────────────────────────────────────────

const ESTADO_COLOR: Record<string, string> = {
  ganada:     "bg-green-100 text-green-800",
  perdida:    "bg-red-100 text-red-800",
  en_proceso: "bg-amber-100 text-amber-800",
  propuesta:  "bg-blue-100 text-blue-800",
};

const ESTADO_LABEL: Record<string, string> = {
  ganada:     "Ganada",
  perdida:    "Perdida",
  en_proceso: "En proceso",
  propuesta:  "Propuesta",
};

// ── Tabs config ────────────────────────────────────────────────────────────────

type TabKey = "ganada" | "en_proceso" | "propuesta" | "perdida" | "todas";

const TABS: {
  key:         TabKey;
  label:       string;
  activeClass: string;
  dotClass:    string;
}[] = [
  {
    key:         "ganada",
    label:       "Ganadas",
    activeClass: "border-green-500 text-green-700 bg-green-50",
    dotClass:    "bg-green-500",
  },
  {
    key:         "en_proceso",
    label:       "En proceso",
    activeClass: "border-amber-500 text-amber-700 bg-amber-50",
    dotClass:    "bg-amber-500",
  },
  {
    key:         "propuesta",
    label:       "Propuestas",
    activeClass: "border-blue-500 text-blue-700 bg-blue-50",
    dotClass:    "bg-blue-500",
  },
  {
    key:         "perdida",
    label:       "Perdidas",
    activeClass: "border-red-400 text-red-600 bg-red-50",
    dotClass:    "bg-red-400",
  },
  {
    key:         "todas",
    label:       "Todas",
    activeClass: "border-gray-500 text-gray-800 bg-white",
    dotClass:    "bg-gray-400",
  },
];

function tabFilter(v: VentaConUniones, tab: TabKey): boolean {
  if (tab === "todas") return true;
  return v.estado === tab;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const validTabs = new Set<string>(["ganada", "en_proceso", "propuesta", "perdida", "todas"]);
  const activeTab: TabKey = (rawTab && validTabs.has(rawTab) ? rawTab : "ganada") as TabKey;

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("ventas")
    .select("*, clientes(razon_social), materiales(nombre)")
    .order("fecha_creacion", { ascending: false });

  const ventas = (data ?? []) as VentaConUniones[];

  // Global counts (always visible in KPI cards)
  const ganadas    = ventas.filter((v) => v.estado === "ganada");
  const enProceso  = ventas.filter((v) => v.estado === "en_proceso");
  const propuestas = ventas.filter((v) => v.estado === "propuesta");
  const perdidas   = ventas.filter((v) => v.estado === "perdida");

  const facturado   = ganadas.reduce((acc, v) => acc + Number(v.monto), 0);
  const pipeline    = [...enProceso, ...propuestas].reduce((acc, v) => acc + Number(v.monto), 0);
  const tonGanadas  = ganadas.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);
  const tonPipeline = [...enProceso, ...propuestas].reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);

  const counts: Record<TabKey, number> = {
    ganada:     ganadas.length,
    en_proceso: enProceso.length,
    propuesta:  propuestas.length,
    perdida:    perdidas.length,
    todas:      ventas.length,
  };

  // Filtered for current tab
  const filtered   = ventas.filter((v) => tabFilter(v, activeTab));
  const filtTon    = filtered.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);
  const filtMonto  = filtered.reduce((acc, v) => acc + Number(v.monto), 0);
  const showEstado = activeTab === "todas";

  return (
    <div className="space-y-5">

      {/* ── KPI cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ganadas",    count: ganadas.length,    color: "text-green-600",  badge: ESTADO_COLOR.ganada },
          { label: "En proceso", count: enProceso.length,  color: "text-amber-600",  badge: ESTADO_COLOR.en_proceso },
          { label: "Propuestas", count: propuestas.length, color: "text-blue-600",   badge: ESTADO_COLOR.propuesta },
          { label: "Perdidas",   count: perdidas.length,   color: "text-red-500",    badge: ESTADO_COLOR.perdida },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Métricas financieras ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-xs text-emerald-600 font-medium">Total Facturado</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatMonto(facturado)}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium">Pipeline</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{formatMonto(pipeline)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium">Ton. Entregadas</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{tonGanadas} ton</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-xs text-purple-600 font-medium">Ton. en Pipeline</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{tonPipeline} ton</p>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-2 py-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = t.key === activeTab;
            return (
              <Link
                key={t.key}
                href={`/ventas?tab=${t.key}`}
                className={[
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
                  isActive
                    ? `${t.activeClass} border-opacity-60 shadow-sm`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? t.dotClass : "bg-gray-300"}`} />
                {t.label}
                <span className={[
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                  isActive ? "bg-white/70 text-current" : "bg-gray-100 text-gray-500",
                ].join(" ")}>
                  {counts[t.key]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Cabecera ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filtered.length === ventas.length
            ? `${ventas.length} ventas / pedidos en total`
            : `${filtered.length} de ${ventas.length} ventas`}
        </p>
        <Link
          href="/ventas/nuevo"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nueva Venta
        </Link>
      </div>

      {/* ── Tabla ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No hay ventas en esta categoría
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Descripción</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Material</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Cantidad</th>
                  {showEstado && (
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Estado</th>
                  )}
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Cierre Est.</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Monto</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {v.clientes?.razon_social ?? (
                        <span className="text-gray-400 italic">Sin cliente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      <span className="line-clamp-2">{v.descripcion}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {v.materiales?.nombre ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {v.cantidad ? `${v.cantidad} ton` : "—"}
                    </td>
                    {showEstado && (
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLOR[v.estado]}`}>
                          {ESTADO_LABEL[v.estado]}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-500">{v.fecha_cierre ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {formatMonto(Number(v.monto))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/ventas/${v.id}/editar`}
                          title="Editar venta"
                          className="text-gray-400 hover:text-amber-600 transition-colors p-1 rounded hover:bg-amber-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <DeleteVentaButton id={v.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* ── Totales del tab activo ── */}
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-600">
                    Total
                    {activeTab !== "todas" && (
                      <span className="ml-1.5 text-xs font-normal text-gray-400">
                        ({TABS.find((t) => t.key === activeTab)?.label})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    {filtTon} ton
                  </td>
                  {showEstado && <td />}
                  <td />
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                    {formatMonto(filtMonto)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
