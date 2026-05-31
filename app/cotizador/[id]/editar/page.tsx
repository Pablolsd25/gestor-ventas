import CotizacionForm from "@/components/cotizador/CotizacionForm";
import { updateCotizacionAction } from "../../actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { CotizacionRow, CotizacionItemRow, MaterialRow } from "@/types/database";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditarCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

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

  const { data: clientesData } = await supabase
    .from("clientes")
    .select("id, razon_social")
    .order("razon_social");
  const { data: materialesData } = await supabase
    .from("materiales")
    .select("*")
    .order("nombre");

  const clientes = (clientesData ?? []) as Array<{ id: string; razon_social: string }>;
  const materiales = (materialesData ?? []) as MaterialRow[];

  const initialData = {
    cliente_id: cot.cliente_id ?? "",
    cliente_nombre: cot.cliente_nombre ?? "",
    fecha: cot.fecha,
    validez_dias: String(cot.validez_dias),
    notas: cot.notas ?? "",
    items: items.map((it) => ({
      descripcion: it.descripcion,
      material_id: it.material_id != null ? String(it.material_id) : "",
      cantidad: String(it.cantidad),
      precio_unitario: String(it.precio_unitario),
    })),
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href={`/cotizador/${id}`} className="text-sm text-blue-600 hover:underline">
        &larr; Volver a la cotización
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar cotización</h1>
        <p className="text-sm text-gray-500 mt-1">Folio #{cot.folio}</p>
      </div>

      <CotizacionForm
        action={updateCotizacionAction.bind(null, id)}
        submitLabel="Guardar cambios"
        clientes={clientes}
        materiales={materiales}
        initialData={initialData}
      />
    </div>
  );
}
