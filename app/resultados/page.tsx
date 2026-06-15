import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatMonto } from "@/lib/utils";
import type { VentaConUniones, ClienteCompletoRow } from "@/types/database";
import { Suspense } from "react";
import ResultadosFilters from "@/components/resultados/ResultadosFilters";
import PrintButton from "@/components/ui/PrintButton";
import { tonBarColor } from "@/components/clientes/SemaforoBadge";

const MESES: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

function filterByPeriod(
  ventas: VentaConUniones[],
  year: number,
  month: string | null
): VentaConUniones[] {
  return ventas.filter((v) => {
    const ym = v.fecha_creacion.slice(0, 7);
    const y = ym.slice(0, 4);
    const m = ym.slice(5, 7);
    if (y !== String(year)) return false;
    if (month && m !== month) return false;
    return true;
  });
}

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  const { anio: rawAnio, mes: rawMes } = await searchParams;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const year = rawAnio && /^\d{4}$/.test(rawAnio) ? Number(rawAnio) : currentYear;
  const month = rawMes && /^(0[1-9]|1[0-2])$/.test(rawMes) ? rawMes : null;

  const supabase = await createSupabaseServerClient();

  const [{ data: ventasData }, { data: clientesData }] = await Promise.all([
    supabase
      .from("ventas")
      .select("*, clientes(razon_social), materiales(nombre)")
      .order("fecha_creacion"),
    supabase.from("v_clientes").select("*"),
  ]);

  const allVentas = (ventasData ?? []) as VentaConUniones[];
  const clientes = (clientesData ?? []) as ClienteCompletoRow[];
  const ventas = filterByPeriod(allVentas, year, month);

  const years = Array.from(
    new Set(allVentas.map((v) => Number(v.fecha_creacion.slice(0, 4))))
  ).sort((a, b) => b - a);
  if (!years.includes(currentYear)) years.unshift(currentYear);

  const propuestas    = ventas.filter((v) => v.estado === "propuesta");
  const enProcesoOnly = ventas.filter((v) => v.estado === "en_proceso");
  const ganadas       = ventas.filter((v) => v.estado === "ganada");
  const perdidas      = ventas.filter((v) => v.estado === "perdida");
  const enProceso     = [...propuestas, ...enProcesoOnly];

  const facturadoTotal = ganadas.reduce((acc, v) => acc + Number(v.monto), 0);
  const pipelineTotal  = enProceso.reduce((acc, v) => acc + Number(v.monto), 0);
  const tonGanadas     = ganadas.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);
  const tonPipeline    = enProceso.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);

  const tasaCierre =
    ganadas.length + perdidas.length > 0
      ? Math.round((ganadas.length / (ganadas.length + perdidas.length)) * 100)
      : 0;
  const ticketPromedio = ganadas.length > 0 ? facturadoTotal / ganadas.length : 0;

  const mensualesMap: Record<string, { monto: number; cantidad: number }> = {};
  for (let m = 1; m <= 12; m++) {
    const key = `${year}-${String(m).padStart(2, "0")}`;
    mensualesMap[key] = { monto: 0, cantidad: 0 };
  }
  ganadas.forEach((v) => {
    const ym = v.fecha_creacion.slice(0, 7);
    if (!ym.startsWith(String(year))) return;
    if (!mensualesMap[ym]) mensualesMap[ym] = { monto: 0, cantidad: 0 };
    mensualesMap[ym].monto    += Number(v.monto);
    mensualesMap[ym].cantidad += Number(v.cantidad ?? 0);
  });

  const ventasMensuales = Object.entries(mensualesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, val]) => ({
      ym,
      mes: MESES[ym.slice(5, 7)] ?? ym.slice(5, 7),
      monto: val.monto,
      cantidad: val.cantidad,
    }));

  const maxMonto    = Math.max(...ventasMensuales.map((m) => m.monto), 1);
  const maxCantidad = Math.max(...ventasMensuales.map((m) => m.cantidad), 1);

  const montoProspuesta = propuestas.reduce((a, v) => a + Number(v.monto), 0);
  const montoEnProceso  = enProcesoOnly.reduce((a, v) => a + Number(v.monto), 0);
  const montoPerdidas   = perdidas.reduce((a, v) => a + Number(v.monto), 0);
  const maxFunnelCount  = Math.max(propuestas.length, enProcesoOnly.length, ganadas.length, perdidas.length, 1);

  const funnelEtapas = [
    { label: "Propuestas", count: propuestas.length,    monto: montoProspuesta, color: "bg-purple-500" },
    { label: "En proceso", count: enProcesoOnly.length, monto: montoEnProceso,  color: "bg-amber-500"  },
    { label: "Ganadas",    count: ganadas.length,       monto: facturadoTotal,  color: "bg-emerald-500"},
    { label: "Perdidas",   count: perdidas.length,      monto: montoPerdidas,   color: "bg-red-500"    },
  ].map((e) => ({
    ...e,
    width: Math.max(Math.round((e.count / maxFunnelCount) * 100), e.count > 0 ? 35 : 20),
  }));

  const pipelineClientesMap: Record<string, { razon_social: string; monto: number; count: number }> = {};
  enProceso.forEach((v) => {
    if (!v.cliente_id || !v.clientes?.razon_social) return;
    if (!pipelineClientesMap[v.cliente_id]) {
      pipelineClientesMap[v.cliente_id] = {
        razon_social: v.clientes.razon_social,
        monto: 0,
        count: 0,
      };
    }
    pipelineClientesMap[v.cliente_id].monto += Number(v.monto);
    pipelineClientesMap[v.cliente_id].count += 1;
  });
  const topPipeline = Object.values(pipelineClientesMap)
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 6);
  const maxPipelineMonto = Math.max(...topPipeline.map((p) => p.monto), 1);

  type TopCliente = { id: string; razon_social: string; facturado: number; ton: number };
  const topClientesMap: Record<string, TopCliente> = {};
  ganadas.forEach((v) => {
    if (!v.cliente_id || !v.clientes?.razon_social) return;
    if (!topClientesMap[v.cliente_id]) {
      topClientesMap[v.cliente_id] = {
        id: v.cliente_id, razon_social: v.clientes.razon_social, facturado: 0, ton: 0,
      };
    }
    topClientesMap[v.cliente_id].facturado += Number(v.monto);
    topClientesMap[v.cliente_id].ton       += Number(v.cantidad ?? 0);
  });
  const topClientes = Object.values(topClientesMap).sort((a, b) => b.facturado - a.facturado);

  const periodLabel = month
    ? `${MESES[month]} ${year}`
    : `Año ${year}`;

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Suspense fallback={null}>
          <ResultadosFilters years={years} currentYear={currentYear} currentMonth={currentMonth} />
        </Suspense>
        <PrintButton />
      </div>

      <p className="text-sm text-gray-500 dark:text-slate-400 -mt-2">
        Mostrando datos de: <span className="font-medium text-gray-700 dark:text-slate-300">{periodLabel}</span>
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Facturado", valor: formatMonto(facturadoTotal), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800" },
          { label: "Pipeline Activo", valor: formatMonto(pipelineTotal),  color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800" },
          { label: "Tasa de Cierre",  valor: `${tasaCierre}%`,            color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-800" },
          { label: "Ticket Promedio", valor: formatMonto(ticketPromedio), color: "text-purple-600 dark:text-purple-400",  bg: "bg-purple-50 border-purple-100 dark:bg-purple-900/30 dark:border-purple-800" },
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border shadow-sm p-5 ${k.bg}`}>
            <p className={`text-2xl font-bold ${k.color}`}>{k.valor}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{tonGanadas} ton</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Toneladas entregadas</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{tonPipeline} ton</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Toneladas en pipeline</p>
        </div>
      </div>

      {/* Embudo vertical */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-1">Embudo de Conversi&oacute;n</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-5">{ventas.length} oportunidades · {periodLabel}</p>
        <div className="flex flex-col items-center gap-1 max-w-xl mx-auto">
          {funnelEtapas.map((etapa, i) => (
            <div key={etapa.label} className="w-full flex flex-col items-center">
              <div
                className={`${etapa.color} rounded-lg px-4 py-3 flex items-center justify-between gap-2 text-white text-sm transition-all`}
                style={{ width: `${etapa.width}%`, minWidth: "200px" }}
              >
                <span className="font-medium">{etapa.label}</span>
                <div className="flex items-center gap-3 text-right">
                  <span className="opacity-90">{etapa.count} deal{etapa.count !== 1 ? "s" : ""}</span>
                  <span className="font-semibold">{formatMonto(etapa.monto)}</span>
                </div>
              </div>
              {i < funnelEtapas.length - 1 && (
                <div className="text-gray-300 dark:text-slate-600 text-lg leading-none py-0.5 select-none">▼</div>
              )}
            </div>
          ))}
        </div>
        {ventas.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700 grid grid-cols-3 gap-4 text-center">
            {[
              {
                label: "Propuesta → Ganada",
                val: propuestas.length > 0
                  ? `${Math.round((ganadas.length / (propuestas.length + ganadas.length + perdidas.length)) * 100)}%`
                  : "—",
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "Tasa de cierre",
                val: `${tasaCierre}%`,
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                label: "Tasa de pérdida",
                val: ganadas.length + perdidas.length > 0
                  ? `${Math.round((perdidas.length / (ganadas.length + perdidas.length)) * 100)}%`
                  : "—",
                color: "text-red-500 dark:text-red-400",
              },
            ].map((m) => (
              <div key={m.label}>
                <p className={`text-xl font-bold ${m.color}`}>{m.val}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">Facturaci&oacute;n Mensual (MXN)</h3>
          {ventasMensuales.every((m) => m.monto === 0) ? (
            <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">Sin datos de ventas ganadas</p>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {ventasMensuales.map((m) => {
                const height = m.monto > 0 ? Math.max(Math.round((m.monto / maxMonto) * 100), 8) : 0;
                return (
                  <div key={m.ym} className="flex-1 flex flex-col items-center gap-1">
                    {m.monto > 0 && (
                      <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium text-center leading-tight">
                        {(m.monto / 1000).toFixed(0)}k
                      </span>
                    )}
                    <div className="w-full flex items-end justify-center h-36">
                      {height > 0 && (
                        <div
                          className="w-full bg-blue-500 rounded-t-md"
                          style={{ height: `${height}%` }}
                          title={`${m.mes}: ${formatMonto(m.monto)} · ${m.cantidad} ton`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-slate-400">{m.mes}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100">Toneladas por Mes</h3>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> ≥80</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> ≥40</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> &lt;40</span>
            </div>
          </div>
          {ventasMensuales.every((m) => m.cantidad === 0) ? (
            <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">Sin datos</p>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {ventasMensuales.map((m) => {
                const height = m.cantidad > 0 ? Math.max(Math.round((m.cantidad / maxCantidad) * 100), 8) : 0;
                return (
                  <div key={m.ym} className="flex-1 flex flex-col items-center gap-1">
                    {m.cantidad > 0 && (
                      <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">{m.cantidad}t</span>
                    )}
                    <div className="w-full flex items-end justify-center h-36">
                      {height > 0 && (
                        <div
                          className={`w-full rounded-t-md ${tonBarColor(m.cantidad)}`}
                          style={{ height: `${height}%` }}
                          title={`${m.mes}: ${m.cantidad} ton`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-slate-400">{m.mes}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">Distribuci&oacute;n de Ventas</h3>
          <div className="space-y-3">
            {[
              { label: "Ganadas",    count: ganadas.length,   color: "bg-green-500", pct: ventas.length ? Math.round((ganadas.length / ventas.length) * 100) : 0 },
              { label: "En proceso", count: enProceso.length, color: "bg-amber-500", pct: ventas.length ? Math.round((enProceso.length / ventas.length) * 100) : 0 },
              { label: "Perdidas",   count: perdidas.length,  color: "bg-red-400",   pct: ventas.length ? Math.round((perdidas.length / ventas.length) * 100) : 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-slate-300">{item.label}</span>
                  <span className="text-gray-500 dark:text-slate-400">{item.count} ({item.pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
            <p className="text-xs text-gray-400 dark:text-slate-500 font-medium mb-3 uppercase tracking-wide">
              Cartera por status
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              {[
                { label: "Venta",     color: "text-green-600 dark:text-green-400", count: clientes.filter((c) => c.status === "Venta").length },
                { label: "Crédito",   color: "text-blue-600 dark:text-blue-400",   count: clientes.filter((c) => c.status === "Credito").length },
                { label: "Prospecto", color: "text-amber-600 dark:text-amber-400", count: clientes.filter((c) => c.status === "Prospecto").length },
              ].map((s) => (
                <div key={s.label}>
                  <p className={`font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-gray-400 dark:text-slate-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">Pipeline Activo por Cliente</h3>
          {topPipeline.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">Sin pipeline activo</p>
          ) : (
            <div className="space-y-3">
              {topPipeline.map((p, i) => {
                const pct = Math.round((p.monto / maxPipelineMonto) * 100);
                return (
                  <div key={p.razon_social} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-bold text-gray-400 dark:text-slate-500 shrink-0 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-800 dark:text-slate-100 truncate">{p.razon_social}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0 ml-2">
                          {p.count} deal{p.count !== 1 ? "s" : ""} · {formatMonto(p.monto)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {topClientes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">Top Clientes por Facturaci&oacute;n</h3>
          <div className="space-y-3">
            {topClientes.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4">
                <span className="w-6 text-center text-sm font-bold text-gray-400 dark:text-slate-500">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-100">{c.razon_social}</span>
                      {c.ton > 0 && (
                        <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">{c.ton} ton</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{formatMonto(c.facturado)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.round((c.facturado / topClientes[0].facturado) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
