import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatMonto } from "@/lib/utils";
import Link from "next/link";
import type { VentaConUniones } from "@/types/database";
import DeleteVentaButton from "@/components/ventas/DeleteVentaButton";

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

export default async function VentasPage() {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("ventas")
    .select("*, clientes(razon_social), materiales(nombre)")
    .order("fecha_creacion", { ascending: false });

  const ventas = (data ?? []) as VentaConUniones[];

  const ganadas    = ventas.filter((v) => v.estado === "ganada");
  const enProceso  = ventas.filter((v) => v.estado === "en_proceso");
  const propuestas = ventas.filter((v) => v.estado === "propuesta");
  const perdidas   = ventas.filter((v) => v.estado === "perdida");

  const facturado   = ganadas.reduce((acc, v) => acc + Number(v.monto), 0);
  const pipeline    = [...enProceso, ...propuestas].reduce((acc, v) => acc + Number(v.monto), 0);
  const tonGanadas  = ganadas.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);
  const tonPipeline = [...enProceso, ...propuestas].reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);

  const totalTon   = ventas.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);
  const totalMonto = ventas.reduce((acc, v) => acc + Number(v.monto), 0);

  return (
    <div className="space-y-6">
      {/* Resumen por estado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ganadas",    count: ganadas.length,    color: "text-green-600",  badge: estadoColor.ganada },
          { label: "En proceso", count: enProceso.length,  color: "text-amber-600",  badge: estadoColor.en_proceso },
          { label: "Propuestas", count: propuestas.length, color: "text-blue-600",   badge: estadoColor.propuesta },
          { label: "Perdidas",   count: perdidas.length,   color: "text-red-500",    badge: estadoColor.perdida },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Totales financieros + toneladas */}
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

      {/* Cabecera + acción */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{ventas.length} ventas / pedidos en total</p>
        <Link
          href="/ventas/nuevo"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nueva Venta
        </Link>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Descripci&oacute;n</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Material</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Cantidad</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Cierre Est.</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Monto</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ventas.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {v.clientes?.razon_social ?? <span className="text-gray-400 italic">Sin cliente</span>}
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
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor[v.estado]}`}>
                      {estadoLabel[v.estado]}
                    </span>
                  </td>
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

            {/* Totales */}
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-600">
                  Total
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  {totalTon} ton
                </td>
                <td colSpan={2} />
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  {formatMonto(totalMonto)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
