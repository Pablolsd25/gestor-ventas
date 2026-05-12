import RecordatorioForm from "@/components/recordatorios/RecordatorioForm";
import { updateRecordatorioAction } from "../../actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarRecordatorioPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const [{ data: recordatorioData }, { data: clientesData }] = await Promise.all([
    supabase.from("recordatorios").select("*").eq("id", id).single(),
    supabase.from("clientes").select("id, razon_social").order("razon_social"),
  ]);

  if (!recordatorioData) notFound();

  const recordatorio = recordatorioData;
  const clientes = (clientesData ?? []) as Array<{ id: string; razon_social: string }>;

  const boundAction = updateRecordatorioAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/recordatorios" className="text-sm text-blue-600 hover:underline">
          &larr; Volver a Recordatorios
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Recordatorio</h1>
        <p className="text-sm text-gray-500 mt-1">
          Actualice los datos del recordatorio.
        </p>
      </div>

      <RecordatorioForm
        action={boundAction}
        initialData={{
          id,
          titulo: recordatorio.titulo,
          descripcion: recordatorio.descripcion ?? "",
          cliente_id: recordatorio.cliente_id ?? "",
          venta_id: recordatorio.venta_id ?? "",
          fecha: recordatorio.fecha,
          hora: recordatorio.hora?.slice(0, 5) ?? "09:00",
          prioridad: (recordatorio.prioridad ?? "") as "alta" | "media" | "baja" | "",
          tipo: (recordatorio.tipo ?? "") as "llamada" | "reunion" | "email" | "seguimiento" | "otro" | "",
        }}
        submitLabel="Guardar Cambios"
        clientes={clientes}
      />
    </div>
  );
}
