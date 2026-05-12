import ClienteForm from "@/components/clientes/ClienteForm";
import { updateClienteAction } from "../../actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

type Contacto = { id: string; nombre: string; telefonos: string[]; correo: string | null };
type ClienteRow = {
  id: string;
  razon_social: string;
  sae: string | null;
  ciudad: string;
  status: "Venta" | "Credito" | "Prospecto" | null;
  comentarios: string | null;
};

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: clienteData } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (!clienteData) notFound();

  const cliente = clienteData as ClienteRow;

  const contactosResult = await supabase
    .from("contactos")
    .select("*")
    .eq("cliente_id", id)
    .order("created_at");

  const materialesResult = await supabase
    .from("cliente_materiales")
    .select("material_id")
    .eq("cliente_id", id);

  const contactos: Contacto[] = ((contactosResult.data ?? []) as Array<{
    id: string;
    nombre: string;
    telefonos: string[];
    correo: string | null;
  }>).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    telefonos: c.telefonos ?? [],
    correo: c.correo ?? "",
  }));

  const { data: materialesRows } = await supabase
    .from("materiales")
    .select("nombre")
    .in(
      "id",
      ((materialesResult.data ?? []) as Array<{ material_id: number }>).map(
        (m) => m.material_id
      )
    );

  const materiales: string[] = ((materialesRows ?? []) as Array<{ nombre: string }>).map((m) => m.nombre);

  const boundAction = updateClienteAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="text-sm text-blue-600 hover:underline">
          &larr; Volver a Clientes
        </Link>
        <span className="text-gray-300">|</span>
        <Link href={`/clientes/${id}`} className="text-sm text-blue-600 hover:underline">
          &larr; Ver detalle
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Cliente</h1>
        <p className="text-sm text-gray-500 mt-1">
          Actualice los datos del cliente.
        </p>
      </div>

      <ClienteForm
        action={boundAction}
        initialData={{
          id,
          razon_social: cliente.razon_social,
          sae: cliente.sae ?? "",
          ciudad: cliente.ciudad,
          status: (cliente.status ?? "") as "Venta" | "Credito" | "Prospecto" | "",
          comentarios: cliente.comentarios ?? "",
          contactos,
          materiales,
        }}
        submitLabel="Guardar Cambios"
        isEdit
      />
    </div>
  );
}
