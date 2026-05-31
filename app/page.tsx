import { createSupabaseServerClient } from "@/lib/supabase-server";
import { formatMonto } from "@/lib/utils";
import type { ClienteCompletoRow, VentaConUniones, RecordatorioConUniones, MetaRow } from "@/types/database";
import MetasEditor from "@/components/dashboard/MetasEditor";
import Link from "next/link";

// ── Static maps ───────────────────────────────────────────────────────────────

const estadoColor: Record<string, string> = {
  ganada:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  perdida:    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  en_proceso: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  propuesta:  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};
const estadoLabel: Record<string, string> = {
  ganada:     "Ganada",
  perdida:    "Perdida",
  en_proceso: "En proceso",
  propuesta:  "Propuesta",
};
const prioridadColor: Record<string, string> = {
  alta:  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  media: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  baja:  "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400",
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
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-snug">{label}</p>
      </div>
      <div className={`shrink-0 w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

// ── Meta progress bar ─────────────────────────────────────────────────────────

function MetaBar({
  titulo, actualLabel, metaLabel, pct, barColor, cumplida, restante,
}: {
  titulo: string;
  actualLabel: string;
  metaLabel: string;
  pct: number;
  barColor: string;
  cumplida: boolean;
  restante: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{titulo}</span>
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {actualLabel} <span className="text-gray-300 dark:text-slate-600">/</span> {metaLabel}
        </span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${cumplida ? "bg-emerald-500" : barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-xs font-medium ${cumplida ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-slate-400"}`}>
          {cumplida ? "¡Meta cumplida! 🎉" : restante}
        </span>
        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{pct}%</span>
      </div>
    </div>
  );
}

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-base">{title}</h3>
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
    { data: metaData },
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
    supabase.from("metas").select("*").eq("id", 1).maybeSingle(),
  ]);

  const clientes      = (clientesData      ?? []) as ClienteCompletoRow[];
  const ventas        = (ventasData        ?? []) as VentaConUniones[];
  const recordatorios = (recordatoriosData ?? []) as RecordatorioConUniones[];
  const meta          = (metaData ?? null) as MetaRow | null;
  const metaMonto     = Number(meta?.meta_monto ?? 0);
  const metaToneladas = Number(meta?.meta_toneladas ?? 0);

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

  // ── Progreso de metas (mes en curso) ──────────────────────────────────────
  const mesActual = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const ganadasMes = ventasGanadas.filter((v) => v.fecha_creacion?.slice(0, 7) === mesActual);
  const montoMes = ganadasMes.reduce((acc, v) => acc + Number(v.monto), 0);
  const tonMes   = ganadasMes.reduce((acc, v) => acc + Number(v.cantidad ?? 0), 0);

  const pctMonto = metaMonto     > 0 ? Math.min(Math.round((montoMes / metaMonto) * 100), 100) : 0;
  const pctTon   = metaToneladas > 0 ? Math.min(Math.round((tonMes / metaToneladas) * 100), 100) : 0;
  const faltaMonto = Math.max(metaMonto - montoMes, 0);
  const faltaTon   = Math.max(metaToneladas - tonMes, 0);
  const nombreMes = new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  return (
    <div className="space-y-7">

      {/* ── Alerta de recordatorios vencidos ─────────────────── */}
      {atrasados > 0 && (
        <Link
          href="/recordatorios"
          className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
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

      {/* ── Metas del mes ─────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-base">Metas del Mes</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 capitalize mt-0.5">{nombreMes}</p>
          </div>
          <MetasEditor metaMonto={metaMonto} metaToneladas={metaToneladas} />
        </div>

        {metaMonto === 0 && metaToneladas === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">
            Aún no defines tus metas. Haz clic en &ldquo;Editar metas&rdquo; para empezar.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Meta de dinero */}
            <MetaBar
              titulo="Facturación"
              actualLabel={formatMonto(montoMes)}
              metaLabel={formatMonto(metaMonto)}
              pct={pctMonto}
              barColor="bg-emerald-500"
              cumplida={metaMonto > 0 && montoMes >= metaMonto}
              restante={metaMonto > 0 ? `Te faltan ${formatMonto(faltaMonto)}` : "Sin meta definida"}
            />
            {/* Meta de toneladas */}
            <MetaBar
              titulo="Toneladas"
              actualLabel={`${tonMes} ton`}
              metaLabel={`${metaToneladas} ton`}
              pct={pctTon}
              barColor="bg-blue-500"
              cumplida={metaToneladas > 0 && tonMes >= metaToneladas}
              restante={metaToneladas > 0 ? `Te faltan ${faltaTon} ton` : "Sin meta definida"}
            />
          </div>
        )}
      </section>

      {/* ── Cartera de clientes ───────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Cartera de Clientes</p>
          <Link href="/clientes" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Ver todos →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="En Venta"       value={enVenta}    color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/30"  border="border-emerald-100 dark:border-emerald-800" icon={<IcoCheckBadge cls="w-5 h-5 text-emerald-500" />} />
          <KpiCard label="Crédito"        value={credito}    color="text-blue-600 dark:text-blue-400"   bg="bg-blue-50 dark:bg-blue-900/30"     border="border-blue-100 dark:border-blue-800"    icon={<IcoCreditCard cls="w-5 h-5 text-blue-500" />}   />
          <KpiCard label="Prospectos"     value={prospectos} color="text-amber-600 dark:text-amber-400"  bg="bg-amber-50 dark:bg-amber-900/30"    border="border-amber-100 dark:border-amber-800"   icon={<IcoEye cls="w-5 h-5 text-amber-500" />}         />
          <KpiCard label="Sin clasificar" value={sinStatus}  color="text-gray-500 dark:text-slate-400"   bg="bg-gray-50 dark:bg-slate-800"     border="border-gray-200 dark:border-slate-600"    icon={<IcoQuestion cls="w-5 h-5 text-gray-400" />}     />
        </div>
      </section>

      {/* ── Resumen de ventas ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Resumen de Ventas</p>
          <Link href="/ventas" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Ver todas →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Total Facturado" value={formatMonto(totalFacturado)} color="text-emerald-600 dark:text-emerald-400" bg="bg-white dark:bg-slate-800"      border="border-gray-100 dark:border-slate-700"    icon={<IcoCash cls="w-5 h-5 text-emerald-500" />}  />
          <KpiCard label="Pipeline Activo" value={formatMonto(pipeline)}       color="text-amber-600 dark:text-amber-400"  bg="bg-white dark:bg-slate-800"      border="border-gray-100 dark:border-slate-700"    icon={<IcoFunnel cls="w-5 h-5 text-amber-500" />}  />
          <KpiCard label="Ton. Entregadas" value={`${tonGanadas} ton`}         color="text-blue-600 dark:text-blue-400"   bg="bg-white dark:bg-slate-800"      border="border-gray-100 dark:border-slate-700"    icon={<IcoCube cls="w-5 h-5 text-blue-500" />}     />
          <KpiCard label="Recordatorios"   value={pendientes}                   color="text-red-600 dark:text-red-400"    bg="bg-white dark:bg-slate-800"      border="border-gray-100 dark:border-slate-700"    icon={<IcoBell cls="w-5 h-5 text-red-500" />}      />
        </div>
      </section>

      {/* ── 2-col grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Últimas ventas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <SectionHeader title="Últimas Ventas" href="/ventas" linkLabel="Ver todas" />
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {ultimasVentas.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">Sin ventas registradas</p>
            )}
            {ultimasVentas.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate">
                    {v.clientes?.razon_social ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate mt-0.5">
                    {v.materiales?.nombre ?? v.descripcion}
                    {v.cantidad ? ` · ${v.cantidad} ton` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor[v.estado]}`}>
                    {estadoLabel[v.estado]}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 tabular-nums">
                    {formatMonto(Number(v.monto))}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {ultimasVentas.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-700/50">
              <Link href="/ventas" className="block text-center text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Ver todas las ventas →
              </Link>
            </div>
          )}
        </div>

        {/* Recordatorios pendientes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
          <SectionHeader title="Recordatorios Pendientes" href="/recordatorios" linkLabel="Ver todos" />
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {proximosRecordatorios.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">Sin recordatorios pendientes</p>
            )}
            {proximosRecordatorios.map((r) => {
              const isOverdue = r.fecha < today;
              return (
                <div key={r.id} className="flex items-start justify-between py-3 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate">{r.titulo}</p>
                    {r.clientes?.razon_social && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{r.clientes.razon_social}</p>
                    )}
                    <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400 dark:text-slate-500"}`}>
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
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-700/50">
              <Link href="/recordatorios" className="block text-center text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Ver todos los recordatorios →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Clientes con comentarios ──────────────────────────── */}
      {clientes.filter((c) => c.comentarios).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
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
                    className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800/40 dark:hover:bg-amber-900/30 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-amber-800 flex items-center justify-center shrink-0">
                      <span className="text-amber-700 dark:text-amber-200 text-xs font-bold">
                        {c.razon_social.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-800 dark:text-slate-100 truncate">
                          {c.razon_social}
                        </span>
                        {c.sae && (
                          <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">SAE {c.sae}</span>
                        )}
                      </div>
                      {cp?.nombre && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{cp.nombre}</p>
                      )}
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 italic line-clamp-2">
                        {c.comentarios}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 dark:text-slate-600 dark:group-hover:text-slate-400 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
