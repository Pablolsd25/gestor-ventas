import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatMonto } from "@/lib/utils";
import type { ClienteCompletoRow, VentaConUniones, RecordatorioConUniones } from "@/types/database";
import { notFound } from "next/navigation";
import Link from "next/link";
import SemaforoBadge from "@/components/clientes/SemaforoBadge";

const statusBadge: Record<string, string> = {
  Venta:     "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Credito:   "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Prospecto: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};
const ventaEstadoColor: Record<string, string> = {
  ganada:     "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  perdida:    "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  en_proceso: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  propuesta:  "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};
const ventaEstadoLabel: Record<string, string> = {
  ganada:     "Ganada",
  perdida:    "Perdida",
  en_proceso: "En proceso",
  propuesta:  "Propuesta",
};
const tipoIcono: Record<string, string> = {
  llamada:     "📞",
  reunion:     "🤝",
  email:       "✉️",
  seguimiento: "🔍",
  otro:        "📌",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetallePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [
    { data: clienteData },
    { data: ventasData },
    { data: recordatoriosData },
  ] = await Promise.all([
    supabase.from("v_clientes").select("*").eq("id", id).single(),
    supabase
      .from("ventas")
      .select("*, materiales(nombre)")
      .eq("cliente_id", id)
      .order("fecha_creacion", { ascending: false }),
    supabase
      .from("recordatorios")
      .select("*")
      .eq("cliente_id", id)
      .order("fecha")
      .order("hora"),
  ]);

  if (!clienteData) notFound();

  const cliente      = clienteData as ClienteCompletoRow;
  const ventas       = (ventasData ?? []) as (VentaConUniones & { materiales: { nombre: string } | null })[];
  const recordatorios = (recordatoriosData ?? []) as RecordatorioConUniones[];

  type Contacto = { id: string; nombre: string; telefonos: string[]; correos?: string[]; correo: string | null };
  const contactos = (cliente.contactos ?? []) as Contacto[];

  function contactEmails(c: Contacto): string[] {
    const fromArray = (c.correos ?? []).filter(Boolean);
    if (fromArray.length) return fromArray;
    return c.correo ? [c.correo] : [];
  }

  const totalFacturado  = ventas
    .filter((v) => v.estado === "ganada")
    .reduce((acc, v) => acc + Number(v.monto), 0);
  const totalToneladas  = ventas
    .filter((v) => v.estado === "ganada")
    .reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Volver */}
      <Link href="/clientes" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Volver a Clientes
      </Link>

      {/* Cabecera */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{cliente.razon_social}</h2>
              <SemaforoBadge semaforo={cliente.semaforo} size="md" />
              {cliente.sae && (
                <span className="text-xs font-mono bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400 px-2 py-0.5 rounded">
                  SAE {cliente.sae}
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-slate-400 mt-1">{cliente.ciudad}</p>
          </div>
          {cliente.status && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge[cliente.status]}`}>
              {cliente.status}
            </span>
          )}
          <Link
            href={`/clientes/${id}/editar`}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 dark:border-slate-600 text-sm font-medium rounded-lg transition-colors border border-gray-200"
          >
            Editar
          </Link>
        </div>

        {/* Página web */}
        {cliente.pagina_web && (
          <div className="mt-3">
            <a
              href={cliente.pagina_web}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {cliente.pagina_web}
            </a>
          </div>
        )}

        {/* Materiales */}
        {(cliente.materiales as string[])?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Materiales que consume</p>
            <div className="flex flex-wrap gap-2">
              {(cliente.materiales as string[]).map((m) => (
                <span
                  key={m}
                  className="text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 border border-blue-100 px-3 py-1 rounded-lg font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comentarios */}
        {cliente.comentarios && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200">
            <span className="font-semibold">Comentarios:</span> {cliente.comentarios}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500">Ventas registradas</p>
            <p className="text-xl font-bold text-gray-800 dark:text-slate-100">{ventas.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500">Total facturado</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatMonto(totalFacturado)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500">Ton. entregadas</p>
            <p className="text-xl font-bold text-gray-800 dark:text-slate-100">
              {totalToneladas > 0 ? `${totalToneladas} ton` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500">Recordatorios</p>
            <p className="text-xl font-bold text-gray-800 dark:text-slate-100">{recordatorios.length}</p>
          </div>
        </div>
      </div>

      {/* Contactos */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
          Contactos ({contactos.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contactos.map((c) => (
            <div key={c.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
              <p className="font-medium text-gray-800 dark:text-slate-100">
                {c.nombre || <span className="italic text-gray-400 dark:text-slate-500">Sin nombre</span>}
              </p>
              <div className="mt-2 space-y-1">
                {c.telefonos.map((t, j) => (
                  <p key={j} className="text-sm text-gray-600 dark:text-slate-400">📞 {t}</p>
                ))}
                {contactEmails(c).map((email, j) => (
                  <p key={j} className="text-sm text-gray-600 dark:text-slate-400">
                    ✉️{" "}
                    <a href={`mailto:${email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {email}
                    </a>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ventas */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
          Ventas / Pedidos ({ventas.length})
        </h3>
        {ventas.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">Sin ventas registradas</p>
        ) : (
          <div className="space-y-2">
            {ventas.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg flex-wrap gap-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-100">{v.descripcion}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {v.materiales?.nombre && `${v.materiales.nombre}`}
                    {v.cantidad ? ` · ${v.cantidad} ton` : ""}
                    {v.fecha_creacion ? ` · ${v.fecha_creacion}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ventaEstadoColor[v.estado]}`}>
                    {ventaEstadoLabel[v.estado]}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                    {formatMonto(Number(v.monto))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recordatorios */}
      {recordatorios.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-4">
            Recordatorios ({recordatorios.length})
          </h3>
          <div className="space-y-2">
            {recordatorios.map((r) => (
              <div
                key={r.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${r.completado ? "opacity-50" : "bg-gray-50 dark:bg-slate-700/50"}`}
              >
                <span className="text-lg">{tipoIcono[r.tipo]}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${r.completado ? "line-through text-gray-400" : "text-gray-800 dark:text-slate-100"}`}>
                    {r.titulo}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {r.fecha} · {r.hora.slice(0, 5)}
                  </p>
                </div>
                {r.completado && (
                  <span className="text-xs text-green-600 font-medium">✓ Completado</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
