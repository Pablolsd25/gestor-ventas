import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ClienteCompletoRow } from "@/types/database";
import Link from "next/link";

const statusBadge: Record<string, string> = {
  Venta:     "bg-green-100 text-green-800",
  Credito:   "bg-blue-100 text-blue-800",
  Prospecto: "bg-amber-100 text-amber-800",
};

export default async function ClientesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: clientesData } = await supabase
    .from("v_clientes")
    .select("*")
    .order("razon_social");

  const clientes = (clientesData ?? []) as ClienteCompletoRow[];

  type Contacto = { id: string; nombre: string; telefonos: string[]; correo: string | null };

  const enVenta    = clientes.filter((c) => c.status === "Venta").length;
  const credito    = clientes.filter((c) => c.status === "Credito").length;
  const prospectos = clientes.filter((c) => c.status === "Prospecto").length;
  const sinStatus  = clientes.filter((c) => !c.status).length;

  return (
    <div className="space-y-6">
      {/* Resumen por status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "En Venta",       valor: enVenta,    color: "text-green-600" },
          { label: "Crédito",        valor: credito,    color: "text-blue-600" },
          { label: "Prospectos",     valor: prospectos, color: "text-amber-600" },
          { label: "Sin clasificar", valor: sinStatus,  color: "text-gray-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.valor}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cabecera + acción */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{clientes.length} clientes en total</p>
        <Link
          href="/clientes/nuevo"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nuevo Cliente
        </Link>
      </div>

      {/* Tabla con scroll horizontal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-16">SAE</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Razón Social</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Contacto</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Teléfono(s)</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Correo</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ciudad / Estado</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Materiales</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Comentarios</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clientes.map((c) => {
                const contactos = (c.contactos ?? []) as Contacto[];
                const cp = contactos.find((ct) => ct.nombre) ?? contactos[0];
                const otrosContactos = contactos.length - 1;
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors align-top">
                    {/* SAE */}
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                      {c.sae ?? "—"}
                    </td>

                    {/* Razón Social */}
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {c.razon_social}
                    </td>

                    {/* Contacto */}
                    <td className="px-4 py-3 text-gray-700">
                      {cp?.nombre || <span className="text-gray-400 italic">Sin nombre</span>}
                      {otrosContactos > 0 && (
                        <span className="ml-1 text-xs text-blue-500">+{otrosContactos}</span>
                      )}
                    </td>

                    {/* Teléfonos */}
                    <td className="px-4 py-3 text-gray-600">
                      {cp?.telefonos?.map((t, i) => (
                        <div key={i}>{t}</div>
                      ))}
                    </td>

                    {/* Correo */}
                    <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                      <span className="break-all text-xs">
                        {cp?.correo ?? <span className="text-gray-400">—</span>}
                      </span>
                    </td>

                    {/* Ciudad */}
                    <td className="px-4 py-3 text-gray-600">{c.ciudad}</td>

                    {/* Materiales */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.materiales ?? []).length === 0 ? (
                          <span className="text-gray-400 text-xs">—</span>
                        ) : (
                          (c.materiales as string[]).map((m) => (
                            <span
                              key={m}
                              className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded"
                            >
                              {m}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {c.status ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[c.status]}`}>
                          {c.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Comentarios */}
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px]">
                      {c.comentarios ? (
                        <span className="line-clamp-2" title={c.comentarios}>
                          {c.comentarios}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Acción */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/clientes/${c.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
