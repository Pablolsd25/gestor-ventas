import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { CotizacionRow, CotizacionItemRow, PerfilRow } from "@/types/database";
import { formatMonto } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import CotizacionActions from "@/components/cotizador/CotizacionActions";

export const dynamic = "force-dynamic";

export default async function CotizacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: cotData } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!cotData) notFound();
  const cot = cotData as CotizacionRow;

  const { data: itemsData } = await supabase
    .from("cotizacion_items")
    .select("*")
    .eq("cotizacion_id", id)
    .order("orden");
  const items = (itemsData ?? []) as CotizacionItemRow[];

  const { data: perfilData } = await supabase.from("perfil").select("*").eq("id", 1).maybeSingle();
  const perfil = (perfilData ?? null) as PerfilRow | null;

  const fechaStr = new Date(cot.fecha + "T00:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const vence = new Date(cot.fecha + "T00:00:00");
  vence.setDate(vence.getDate() + cot.validez_dias);
  const venceStr = vence.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      {/* Barra de acciones — se oculta al imprimir */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/cotizador" className="text-sm text-blue-600 hover:underline">
          &larr; Volver al Cotizador
        </Link>
        <CotizacionActions id={cot.id} />
      </div>

      {/* Documento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-3xl mx-auto print:shadow-none print:border-0">
        <div className="flex items-start justify-between border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cotización</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">Folio #{cot.folio}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-gray-800">{perfil?.nombre ?? "Vendedor"}</p>
            {perfil?.puesto && <p className="text-gray-500">{perfil.puesto}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-5 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Cliente</p>
            <p className="text-gray-800 font-medium">{cot.cliente_nombre ?? "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Fecha</p>
            <p className="text-gray-800">{fechaStr}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide mt-2">Válida hasta</p>
            <p className="text-gray-800">{venceStr}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gray-200 text-gray-500">
              <th className="text-left py-2 font-medium">Descripción</th>
              <th className="text-right py-2 font-medium w-20">Cant.</th>
              <th className="text-right py-2 font-medium w-32">P. unitario</th>
              <th className="text-right py-2 font-medium w-32">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((it) => (
              <tr key={it.id}>
                <td className="py-2.5 text-gray-800">{it.descripcion}</td>
                <td className="py-2.5 text-right text-gray-600">{it.cantidad}</td>
                <td className="py-2.5 text-right text-gray-600">{formatMonto(it.precio_unitario)}</td>
                <td className="py-2.5 text-right text-gray-800 font-medium">
                  {formatMonto(it.cantidad * it.precio_unitario)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200">
              <td colSpan={3} className="py-3 text-right font-semibold text-gray-700">Total</td>
              <td className="py-3 text-right text-lg font-bold text-gray-900">
                {formatMonto(cot.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        {cot.notas && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notas y condiciones</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{cot.notas}</p>
          </div>
        )}
      </div>
    </div>
  );
}
