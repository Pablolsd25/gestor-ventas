import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatMonto } from "@/lib/utils";
import type { ClienteCompletoRow, VentaConUniones, RecordatorioConUniones } from "@/types/database";
import Link from "next/link";

// ── Static maps ───────────────────────────────────────────────────────────────

const estadoColor: Record<string, string> = {
  ganada:     "bg-emerald-100 text-emerald-700",
  perdida:    "bg-red-100 text-red-700",
  en_proceso: "bg-amber-100 text-amber-700",
  propuesta:  "bg-blue-100 text-blue-700",
};
const estadoLabel: Record<string, string> = {
  ganada:     "Ganada",
  perdida:    "Perdida",
  en_proceso: "En proceso",
  propuesta:  "Propuesta",
};
const prioridadColor: Record<string, string> = {
  alta:  "bg-red-100 text-red-700",
  media: "bg-amber-100 text-amber-700",
  baja:  "bg-gray-100 text-gray-600",
};
const prioridadLabel: Record<string, string> = {
  alta:  "Alta",
  media: "Media",
  baja:  "Baja",
};

// ── Tiny inline SVG icons ─────────────────────────────────────────────────────

function IcoCheckBadge({ cls }: { cls: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IcoCreditCard({ cls }: { cls: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}
function IcoEye({ cls }: { cls: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
function IcoQuestion({ cls }: { cls: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IcoCash({ cls }: { cls: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IcoFunnel({ cls }: { cls: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}
function IcoCube({ cls }: { cls: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function IcoBell({ cls }: { cls: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, color, bg, border, icon,
}: {
  label: string;
  value: string | number;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-5 flex items-start justify-between gap-3`}>
      <div className="min-w-0">
        <p className={`text-2xl font-bold leading-none ${color}`}>{value}</p>
        <p className="text-sm text-gray-500 mt-2 leading-snug">{label}</p>
      </div>
      <div className={`shrink-0 w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
      {href && (
        <Link href={href} className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
          {linkLabel ?? "Ver todos"} →
        </Link>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { data: clientesData },
    { data: ventasData },
    { data: recordatoriosData },
  ] = await Promise.all([
    supabase.from("v_clientes").select("*").order("razon_social"),
    supabase
      .from("ventas")
      .select("*, clientes(razon_social), materiales(nombre)")
      .order("fecha_creacion", { ascending: false }),
    supabase
      .from("recordatorios")
      .select("*, clientes(razon_social)")
      .order("fecha")
      .order("hora"),
  ]);

  const clientes      = (clientesData      ?? []) as ClienteCompletoRow[];
  const ventas        = (ventasData        ?? []) as VentaConUniones[];
  const recordatorios = (recordatoriosData ?? []) as RecordatorioConUniones[];

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const enVenta    = clientes.filter((c) => c.status === "Venta").length;
  const credito    = clientes.filter((c) => c.status === "Credito").length;
  const prospectos = clientes.filter((c) => c.status === "Prospecto").length;
  const sinStatus  = clientes.filter((c) => !c.status).length;

  const ventasGanadas   = ventas.filter((v) => v.estado === "ganada");
  const ventasEnProceso = ventas.filter((v) => v.estado === "en_proceso" || v.estado === "propuesta");
  const totalFacturado  = ventasGanadas.reduce((acc, v) => acc + Number(v.monto), 0);
  const pipeline        = ventasEnProceso.reduce((acc, v) => acc + Number(v.monto), 0);
  const tonGanadas      = ventasGanadas.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);
  const pendientes      = recordatorios.filter((r) => !r.completado).length;

  const today = new Date().toISOString().split("T")[0];
  const atrasados = recordatorios.filter((r) => !r.completado && r.fecha < today).length;

  const proximosRecordatorios = recordatorios.filter((r) => !r.completado).slice(0, 5);
  const ultimasVentas         = ventas.slice(0, 5);

  return (
    <div className="space-y-7">

      {/* ── Alerta de recordatorios vencidos ─────────────────── */}
      {atrasados > 0 && (
        <Link
          href="/recordatorios"
          className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 hover:bg-red-100 transition-colors"
        >
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            <strong>{atrasados}</strong> recordatorio{atrasados > 1 ? "s" : ""} vencido{atrasados > 1 ? "s" : ""} &mdash; haz clic para revisar
          </span>
          <svg className="w-4 h-4 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* ── Cartera de clientes ───────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cartera de Clientes</p>
          <Link href="/clientes" className="text-xs text-blue-600 hover:underline font-medium">Ver todos →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="En Venta"       value={enVenta}    color="text-emerald-600" bg="bg-emerald-50"  border="border-emerald-100" icon={<IcoCheckBadge cls="w-5 h-5 text-emerald-500" />} />
          <KpiCard label="Crédito"        value={credito}    color="text-blue-600"   bg="bg-blue-50"     border="border-blue-100"    icon={<IcoCreditCard cls="w-5 h-5 text-blue-500" />}   />
          <KpiCard label="Prospectos"     value={prospectos} color="text-amber-600"  bg="bg-amber-50"    border="border-amber-100"   icon={<IcoEye cls="w-5 h-5 text-amber-500" />}         />
          <KpiCard label="Sin clasificar" value={sinStatus}  color="text-gray-500"   bg="bg-gray-50"     border="border-gray-200"    icon={<IcoQuestion cls="w-5 h-5 text-gray-400" />}     />
        </div>
      </section>

      {/* ── Resumen de ventas ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resumen de Ventas</p>
          <Link href="/ventas" className="text-xs text-blue-600 hover:underline font-medium">Ver todas →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Total Facturado" value={formatMonto(totalFacturado)} color="text-emerald-600" bg="bg-white"      border="border-gray-100"    icon={<IcoCash cls="w-5 h-5 text-emerald-500" />}  />
          <KpiCard label="Pipeline Activo" value={formatMonto(pipeline)}       color="text-amber-600"  bg="bg-white"      border="border-gray-100"    icon={<IcoFunnel cls="w-5 h-5 text-amber-500" />}  />
          <KpiCard label="Ton. Entregadas" value={`${tonGanadas} ton`}         color="text-blue-600"   bg="bg-white"      border="border-gray-100"    icon={<IcoCube cls="w-5 h-5 text-blue-500" />}     />
          <KpiCard label="Recordatorios"   value={pendientes}                   color="text-red-600"    bg="bg-white"      border="border-gray-100"    icon={<IcoBell cls="w-5 h-5 text-red-500" />}      />
        </div>
      </section>

      {/* ── 2-col grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Últimas ventas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <SectionHeader title="Últimas Ventas" href="/ventas" linkLabel="Ver todas" />
          <div className="divide-y divide-gray-50">
            {ultimasVentas.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">Sin ventas registradas</p>
            )}
            {ultimasVentas.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {v.clientes?.razon_social ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {v.materiales?.nombre ?? v.descripcion}
                    {v.cantidad ? ` · ${v.cantidad} ton` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor[v.estado]}`}>
                    {estadoLabel[v.estado]}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 tabular-nums">
                    {formatMonto(Number(v.monto))}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {ultimasVentas.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-50">
              <Link href="/ventas" className="block text-center text-xs text-blue-600 hover:underline font-medium">
                Ver todas las ventas →
              </Link>
            </div>
          )}
        </div>

        {/* Recordatorios pendientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <SectionHeader title="Recordatorios Pendientes" href="/recordatorios" linkLabel="Ver todos" />
          <div className="divide-y divide-gray-50">
            {proximosRecordatorios.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">Sin recordatorios pendientes</p>
            )}
            {proximosRecordatorios.map((r) => {
              const isOverdue = r.fecha < today;
              return (
                <div key={r.id} className="flex items-start justify-between py-3 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.titulo}</p>
                    {r.clientes?.razon_social && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{r.clientes.razon_social}</p>
                    )}
                    <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                      {r.fecha} · {r.hora.slice(0, 5)}
                      {isOverdue ? " · Vencido" : ""}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${prioridadColor[r.prioridad]}`}>
                    {prioridadLabel[r.prioridad]}
                  </span>
                </div>
              );
            })}
          </div>
          {proximosRecordatorios.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-50">
              <Link href="/recordatorios" className="block text-center text-xs text-blue-600 hover:underline font-medium">
                Ver todos los recordatorios →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Clientes con comentarios ──────────────────────────── */}
      {clientes.filter((c) => c.comentarios).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <SectionHeader title="Clientes con Notas" href="/clientes" linkLabel="Ver todos" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clientes
              .filter((c) => c.comentarios)
              .slice(0, 6)
              .map((c) => {
                const cp = (c.contactos as Array<{ nombre: string; telefonos: string[]; correo: string | null }>)[0];
                return (
                  <Link
                    key={c.id}
                    href={`/clientes/${c.id}`}
                    className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center shrink-0">
                      <span className="text-amber-700 text-xs font-bold">
                        {c.razon_social.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-800 truncate">
                          {c.razon_social}
                        </span>
                        {c.sae && (
                          <span className="text-xs text-gray-400 shrink-0">SAE {c.sae}</span>
                        )}
                      </div>
                      {cp?.nombre && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{cp.nombre}</p>
                      )}
                      <p className="text-xs text-amber-700 mt-1 italic line-clamp-2">
                        {c.comentarios}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
          </div>
        </div>
      )}

    </div>
  );
}
