import RecordatorioForm from "@/components/recordatorios/RecordatorioForm";
import { createRecordatorioAction } from "../actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function NuevoRecordatorioPage() {
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: clientesData } = await supabase
    .from("clientes")
    .select("id, razon_social")
    .order("razon_social");

  const clientes = (clientesData ?? []) as Array<{ id: string; razon_social: string }>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/recordatorios" className="text-sm text-blue-600 hover:underline">
          &larr; Volver a Recordatorios
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Recordatorio</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cree un nuevo recordatorio.
        </p>
      </div>

      <RecordatorioForm
        action={createRecordatorioAction}
        submitLabel="Crear Recordatorio"
        clientes={clientes}
      />
    </div>
  );
}
