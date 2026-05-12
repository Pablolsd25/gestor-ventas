import VentaForm from "@/components/ventas/VentaForm";
import { createVentaAction } from "../actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function NuevaVentaPage() {
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: clientesData } = await supabase
    .from("clientes")
    .select("id, razon_social")
    .order("razon_social");

  const clientes = (clientesData ?? []) as Array<{ id: string; razon_social: string }>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/ventas" className="text-sm text-blue-600 hover:underline">
          &larr; Volver a Ventas
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Venta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registre una nueva oportunidad o pedido.
        </p>
      </div>

      <VentaForm
        action={createVentaAction}
        submitLabel="Crear Venta"
        clientes={clientes}
        materiales={[]}
      />
    </div>
  );
}
