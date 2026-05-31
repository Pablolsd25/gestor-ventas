import CotizacionForm from "@/components/cotizador/CotizacionForm";
import { createCotizacionAction } from "../actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { MaterialRow } from "@/types/database";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NuevaCotizacionPage() {
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/cotizador" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        &larr; Volver al Cotizador
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Nueva cotización</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Agrega las partidas y genera la cotización.</p>
      </div>

      <CotizacionForm
        action={createCotizacionAction}
        submitLabel="Crear cotización"
        clientes={clientes}
        materiales={materiales}
      />
    </div>
  );
}
