import VentaForm from "@/components/ventas/VentaForm";
import { updateVentaAction } from "../../actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarVentaPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const [{ data: ventaData }, { data: clientesData }] = await Promise.all([
    supabase.from("ventas").select("*").eq("id", id).single(),
    supabase.from("clientes").select("id, razon_social").order("razon_social"),
  ]);

  if (!ventaData) notFound();

  const venta = ventaData;
  const clientes = (clientesData ?? []) as Array<{ id: string; razon_social: string }>;

  const { data: materialesData } = await supabase
    .from("materiales")
    .select("id, nombre")
    .order("id");

  const materiales = (materialesData ?? []) as Array<{ id: number; nombre: string }>;

  const boundAction = updateVentaAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/ventas" className="text-sm text-blue-600 hover:underline">
          &larr; Volver a Ventas
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Venta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Actualice los datos de la venta.
        </p>
      </div>

      <VentaForm
        action={boundAction}
        initialData={{
          id,
          cliente_id: venta.cliente_id ?? "",
          descripcion: venta.descripcion,
          material_id: venta.material_id?.toString() ?? "",
          cantidad: venta.cantidad?.toString() ?? "",
          monto: venta.monto?.toString() ?? "",
          estado: (venta.estado ?? "") as "ganada" | "perdida" | "en_proceso" | "propuesta" | "",
          fecha_creacion: venta.fecha_creacion ?? "",
          fecha_cierre: venta.fecha_cierre ?? "",
          notas: venta.notas ?? "",
          comision_tipo: (venta.comision_tipo ?? "") as "porcentaje" | "monto" | "",
          comision_valor: venta.comision_valor?.toString() ?? "",
        }}
        submitLabel="Guardar Cambios"
        clientes={clientes}
        materiales={materiales}
      />
    </div>
  );
}
