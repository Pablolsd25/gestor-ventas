import ClienteForm from "@/components/clientes/ClienteForm";
import { createClienteAction } from "../actions";
import Link from "next/link";

export default function NuevoClientePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="text-sm text-blue-600 hover:underline">
          &larr; Volver a Clientes
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Cliente</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete los datos del nuevo cliente.
        </p>
      </div>

      <ClienteForm
        action={createClienteAction}
        submitLabel="Crear Cliente"
      />
    </div>
  );
}
