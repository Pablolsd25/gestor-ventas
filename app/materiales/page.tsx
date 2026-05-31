import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { MaterialRow } from "@/types/database";
import MaterialesManager from "@/components/materiales/MaterialesManager";

export const dynamic = "force-dynamic";

export default async function MaterialesPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("materiales").select("*").order("nombre");
  const materiales = (data ?? []) as MaterialRow[];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Materiales</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administra el catálogo de materiales que usas en clientes, ventas y cotizaciones.
        </p>
      </div>
      <MaterialesManager materiales={materiales} />
    </div>
  );
}
