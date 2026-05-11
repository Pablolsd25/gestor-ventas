import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatMonto } from "@/lib/utils";
import type { VentaConUniones, ClienteCompletoRow } from "@/types/database";

const MESES: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

export default async function ResultadosPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: ventasData }, { data: clientesData }] = await Promise.all([
    supabase
      .from("ventas")
      .select("*, clientes(razon_social), materiales(nombre)")
      .order("fecha_creacion"),
    supabase.from("v_clientes").select("*"),
  ]);

  const ventas   = (ventasData  ?? []) as VentaConUniones[];
  const clientes = (clientesData ?? []) as ClienteCompletoRow[];

  // ── Segmentación por estado ───────────────────────────────────────────────
  const ganadas   = ventas.filter((v) => v.estado === "ganada");
  const perdidas  = ventas.filter((v) => v.estado === "perdida");
  const enProceso = ventas.filter(
    (v) => v.estado === "en_proceso" || v.estado === "propuesta"
  );

  const facturadoTotal = ganadas.reduce((acc, v) => acc + Number(v.monto), 0);
  const pipelineTotal  = enProceso.reduce((acc, v) => acc + Number(v.monto), 0);
  const tonGanadas     = ganadas.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);
  const tonPipeline    = enProceso.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);

  const tasaCierre =
    ganadas.length + perdidas.length > 0
      ? Math.round((ganadas.length / (ganadas.length + perdidas.length)) * 100)
      : 0;
  const ticketPromedio = ganadas.length > 0 ? facturadoTotal / ganadas.length : 0;

  // ── Facturación mensual (agrupada desde fecha_creacion) ───────────────────
  const mensualesMap: Record<string, { monto: number; cantidad: number }> = {};
  ganadas.forEach((v) => {
    const ym = v.fecha_creacion.slice(0, 7); // "YYYY-MM"
    if (!mensualesMap[ym]) mensualesMap[ym] = { monto: 0, cantidad: 0 };
    mensualesMap[ym].monto    += Number(v.monto);
    mensualesMap[ym].cantidad += Number(v.cantidad ?? 0);
  });
  const ventasMensuales = Object.entries(mensualesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, val]) => ({
      mes:      MESES[ym.slice(5, 7)] ?? ym.slice(5, 7),
      monto:    val.monto,
      cantidad: val.cantidad,
    }));
  const maxMonto = Math.max(...ventasMensuales.map((m) => m.monto), 1);

  // ── Consumo por material ──────────────────────────────────────────────────
  const porMaterial: Record<string, { clientes: number; ton: number }> = {};
  clientes.forEach((c) => {
    (c.materiales as string[]).forEach((m) => {
      if (!porMaterial[m]) porMaterial[m] = { clientes: 0, ton: 0 };
      porMaterial[m].clientes += 1;
    });
  });
  ganadas.forEach((v) => {
    const nombre = v.materiales?.nombre;
    if (nombre) {
      if (!porMaterial[nombre]) porMaterial[nombre] = { clientes: 0, ton: 0 };
      porMaterial[nombre].ton += Number(v.cantidad ?? 0);
    }
  });
  const materialesList = Object.entries(porMaterial).sort(
    (a, b) => b[1].clientes - a[1].clientes
  );

  // ── Top clientes por facturación ──────────────────────────────────────────
  type TopCliente = {
    id: string;
    razon_social: string;
    facturado: number;
    ton: number;
  };
  const topClientesMap: Record<string, TopCliente> = {};
  ganadas.forEach((v) => {
    if (!v.cliente_id || !v.clientes?.razon_social) return;
    if (!topClientesMap[v.cliente_id]) {
      topClientesMap[v.cliente_id] = {
        id:           v.cliente_id,
        razon_social: v.clientes.razon_social,
        facturado:    0,
        ton:          0,
      };
    }
    topClientesMap[v.cliente_id].facturado += Number(v.monto);
    topClientesMap[v.cliente_id].ton       += Number(v.cantidad ?? 0);
  });
  const topClientes = Object.values(topClientesMap).sort(
    (a, b) => b.facturado - a.facturado
  );

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Facturado",  valor: formatMonto(facturadoTotal), color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Pipeline Activo",  valor: formatMonto(pipelineTotal),  color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
          { label: "Tasa de Cierre",   valor: `${tasaCierre}%`,            color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
          { label: "Ticket Promedio",  valor: formatMonto(ticketPromedio), color: "text-purple-600",  bg: "bg-purple-50 border-purple-100" },
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border shadow-sm p-5 ${k.bg}`}>
            <p className={`text-2xl font-bold ${k.color}`}>{k.valor}</p>
            <p className="text-sm text-gray-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Toneladas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{tonGanadas} ton</p>
          <p className="text-sm text-gray-500 mt-1">Toneladas entregadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{tonPipeline} ton</p>
          <p className="text-sm text-gray-500 mt-1">Toneladas en pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico facturación mensual */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Facturación Mensual (MXN)</h3>
          {ventasMensuales.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin datos de ventas ganadas</p>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {ventasMensuales.map((m) => {
                const height = Math.round((m.monto / maxMonto) * 100);
                return (
                  <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium text-center leading-tight">
                      {(m.monto / 1000).toFixed(0)}k
                    </span>
                    <div
                      className="w-full bg-blue-500 rounded-t-md"
                      style={{ height: `${height}%` }}
                      title={`${m.mes}: ${formatMonto(m.monto)} · ${m.cantidad} ton`}
                    />
                    <div className="text-center">
                      <span className="text-xs text-gray-500 block">{m.mes}</span>
                      <span className="text-xs text-gray-400">{m.cantidad}t</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Distribución por estado + cartera */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Distribución de Ventas</h3>
          <div className="space-y-3">
            {[
              { label: "Ganadas",    count: ganadas.length,   color: "bg-green-500",  pct: ventas.length ? Math.round((ganadas.length / ventas.length) * 100) : 0 },
              { label: "En proceso", count: enProceso.length, color: "bg-amber-500",  pct: ventas.length ? Math.round((enProceso.length / ventas.length) * 100) : 0 },
              { label: "Perdidas",   count: perdidas.length,  color: "bg-red-400",    pct: ventas.length ? Math.round((perdidas.length / ventas.length) * 100) : 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-500">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Cartera por status */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">
              Cartera por status
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              {[
                { label: "Venta",     color: "text-green-600", count: clientes.filter((c) => c.status === "Venta").length },
                { label: "Crédito",   color: "text-blue-600",  count: clientes.filter((c) => c.status === "Credito").length },
                { label: "Prospecto", color: "text-amber-600", count: clientes.filter((c) => c.status === "Prospecto").length },
              ].map((s) => (
                <div key={s.label}>
                  <p className={`font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-gray-400 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Consumo por material */}
      {materialesList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Consumo por Material</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Material</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-medium">Clientes</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-medium">Ton. entregadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {materialesList.map(([material, d]) => (
                  <tr key={material} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{material}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{d.clientes}</td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {d.ton > 0 ? `${d.ton} ton` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top clientes */}
      {topClientes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Top Clientes por Facturación</h3>
          <div className="space-y-3">
            {topClientes.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4">
                <span className="w-6 text-center text-sm font-bold text-gray-400">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {c.razon_social}
                      </span>
                      {c.ton > 0 && (
                        <span className="text-xs text-gray-400 ml-2">{c.ton} ton</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {formatMonto(c.facturado)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.round((c.facturado / topClientes[0].facturado) * 100)}%`,
                      }}
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
