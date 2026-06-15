import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ClienteCompletoRow } from "@/types/database";
import Link from "next/link";
import { Suspense } from "react";
import DeleteClienteButton from "@/components/clientes/DeleteClienteButton";
import ClientesFilters from "@/components/clientes/ClientesFilters";
import SemaforoBadge from "@/components/clientes/SemaforoBadge";
import PrintButton from "@/components/ui/PrintButton";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  Venta:     "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  Credito:   "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Prospecto: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

type TabKey = "venta" | "credito" | "prospecto" | "sin" | "todos";

const TABS: { key: TabKey; label: string; color: string; activeClass: string; dotClass: string }[] = [
  {
    key:         "venta",
    label:       "En Venta",
    color:       "text-green-700",
    activeClass: "border-green-500 text-green-700 bg-green-50 dark:border-green-600 dark:text-green-300 dark:bg-green-900/30",
    dotClass:    "bg-green-500",
  },
  {
    key:         "credito",
    label:       "Crédito",
    color:       "text-blue-700",
    activeClass: "border-blue-500 text-blue-700 bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900/30",
    dotClass:    "bg-blue-500",
  },
  {
    key:         "prospecto",
    label:       "Prospectos",
    color:       "text-amber-700",
    activeClass: "border-amber-500 text-amber-700 bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:bg-amber-900/30",
    dotClass:    "bg-amber-500",
  },
  {
    key:         "sin",
    label:       "Sin clasificar",
    color:       "text-gray-500",
    activeClass: "border-gray-400 text-gray-700 bg-gray-50 dark:border-slate-500 dark:text-slate-300 dark:bg-slate-700",
    dotClass:    "bg-gray-400",
  },
  {
    key:         "todos",
    label:       "Todos",
    color:       "text-gray-600",
    activeClass: "border-gray-500 text-gray-800 bg-white dark:border-slate-400 dark:text-slate-100 dark:bg-slate-800",
    dotClass:    "bg-gray-500",
  },
];

function tabFilter(c: ClienteCompletoRow, tab: TabKey): boolean {
  switch (tab) {
    case "venta":     return c.status === "Venta";
    case "credito":   return c.status === "Credito";
    case "prospecto": return c.status === "Prospecto";
    case "sin":       return !c.status;
    case "todos":     return true;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; material?: string; ciudad?: string }>;
}) {
  const { tab: rawTab, material: rawMaterial, ciudad: rawCiudad } = await searchParams;
  const validTabs = new Set<string>(["venta", "credito", "prospecto", "sin", "todos"]);
  const activeTab: TabKey = (rawTab && validTabs.has(rawTab) ? rawTab : "venta") as TabKey;
  const fMaterial = rawMaterial?.trim() || "";
  const fCiudad = rawCiudad?.trim() || "";

  const supabase = await createSupabaseServerClient();

  const { data: clientesData } = await supabase
    .from("v_clientes")
    .select("*")
    .order("razon_social");

  const clientes = (clientesData ?? []) as ClienteCompletoRow[];

  // Opciones de filtro (valores distintos presentes en los datos)
  const ciudadesOpts = Array.from(
    new Set(clientes.map((c) => (c.ciudad ?? "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
  const materialesOpts = Array.from(
    new Set(clientes.flatMap((c) => (c.materiales as string[] | null) ?? []))
  ).sort((a, b) => a.localeCompare(b));

  const counts: Record<TabKey, number> = {
    venta:     clientes.filter((c) => c.status === "Venta").length,
    credito:   clientes.filter((c) => c.status === "Credito").length,
    prospecto: clientes.filter((c) => c.status === "Prospecto").length,
    sin:       clientes.filter((c) => !c.status).length,
    todos:     clientes.length,
  };

  const filtered = clientes.filter((c) => {
    if (!tabFilter(c, activeTab)) return false;
    if (fCiudad && (c.ciudad ?? "").trim() !== fCiudad) return false;
    if (fMaterial) {
      const mats = (c.materiales as string[] | null) ?? [];
      if (!mats.includes(fMaterial)) return false;
    }
    return true;
  });

  type Contacto = { id: string; nombre: string; telefonos: string[]; correos?: string[]; correo: string | null };

  function contactEmails(cp: Contacto | undefined): string[] {
    if (!cp) return [];
    const fromArray = (cp.correos ?? []).filter(Boolean);
    if (fromArray.length) return fromArray;
    return cp.correo ? [cp.correo] : [];
  }

  return (
    <div className="space-y-5 print:space-y-3">

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm px-2 py-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = t.key === activeTab;
            const tabParams = new URLSearchParams();
            tabParams.set("tab", t.key);
            if (fMaterial) tabParams.set("material", fMaterial);
            if (fCiudad) tabParams.set("ciudad", fCiudad);
            return (
              <Link
                key={t.key}
                href={`/clientes?${tabParams.toString()}`}
                className={[
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
                  isActive
                    ? `${t.activeClass} border-opacity-60 shadow-sm`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700",
                ].join(" ")}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? t.dotClass : "bg-gray-300"}`} />
                {t.label}
                <span className={[
                  "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                  isActive ? "bg-white/70 text-current" : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400",
                ].join(" ")}>
                  {counts[t.key]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Cabecera ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Suspense fallback={null}>
          <ClientesFilters ciudades={ciudadesOpts} materiales={materialesOpts} />
        </Suspense>
        <div className="flex items-center gap-3 ml-auto">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {filtered.length === clientes.length
              ? `${clientes.length} clientes en total`
              : `${filtered.length} de ${clientes.length} clientes`}
          </p>
          <PrintButton />
          <Link
            href="/clientes/nuevo"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Nuevo Cliente
          </Link>
        </div>
      </div>

      {/* ── Vista mobile: tarjetas ─────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-slate-500 text-sm">
            No hay clientes en esta categoría
          </div>
        )}
        {filtered.map((c) => {
          const contactos = (c.contactos ?? []) as Contacto[];
          const cp = contactos.find((ct) => ct.nombre) ?? contactos[0];
          const otrosContactos = contactos.length - 1;
          const emails = contactEmails(cp);
          return (
            <div key={c.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <SemaforoBadge semaforo={c.semaforo} />
                  <div>
                  <p className="font-semibold text-gray-900 dark:text-slate-100 leading-tight">{c.razon_social}</p>
                  {c.sae && (
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-0.5">SAE {c.sae}</p>
                  )}
                  </div>
                </div>
                {c.status ? (
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[c.status]}`}>
                    {c.status}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {cp?.nombre && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">Contacto</p>
                    <p className="text-gray-700 dark:text-slate-300">
                      {cp.nombre}
                      {otrosContactos > 0 && (
                        <span className="ml-1 text-xs text-blue-500">+{otrosContactos}</span>
                      )}
                    </p>
                  </div>
                )}
                {cp?.telefonos?.[0] && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">Teléfono</p>
                    <p className="text-gray-700 dark:text-slate-300">{cp.telefonos[0]}</p>
                  </div>
                )}
                {emails[0] && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">Correo</p>
                    <p className="text-gray-700 dark:text-slate-300 text-xs break-all">
                      {emails[0]}
                      {emails.length > 1 && (
                        <span className="ml-1 text-blue-500">+{emails.length - 1}</span>
                      )}
                    </p>
                  </div>
                )}
                {c.ciudad && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">Ciudad</p>
                    <p className="text-gray-700 dark:text-slate-300">{c.ciudad}</p>
                  </div>
                )}
                {(c.materiales as string[] | null)?.length ? (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">Materiales</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {(c.materiales as string[]).map((m) => (
                          <span key={m} className="text-xs bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                            {m}
                          </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-50 dark:border-slate-700">
                <Link
                  href={`/clientes/${c.id}`}
                  className="flex-1 text-center text-xs text-blue-600 dark:text-blue-400 font-medium py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Ver detalle
                </Link>
                <Link
                  href={`/clientes/${c.id}/editar`}
                  className="flex-1 text-center text-xs text-amber-600 dark:text-amber-400 font-medium py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                >
                  Editar
                </Link>
                <DeleteClienteButton id={c.id} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Vista desktop: tabla ──────────────────────────────────────── */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-slate-500 text-sm">
            No hay clientes en esta categoría
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium w-10">Sem.</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium w-16">SAE</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Razón Social</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Contacto</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Teléfono(s)</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Correo</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Ciudad / Estado</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Materiales</th>
                  {activeTab === "todos" && (
                    <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Status</th>
                  )}
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-slate-400 font-medium">Comentarios</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {filtered.map((c) => {
                  const contactos = (c.contactos ?? []) as Contacto[];
                  const cp = contactos.find((ct) => ct.nombre) ?? contactos[0];
                  const otrosContactos = contactos.length - 1;
                  const emails = contactEmails(cp);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors align-top">
                      <td className="px-4 py-3">
                        <SemaforoBadge semaforo={c.semaforo} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 dark:text-slate-500 font-mono text-xs">{c.sae ?? "—"}</td>

                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{c.razon_social}</td>

                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                        {cp?.nombre || <span className="text-gray-400 dark:text-slate-500 italic">Sin nombre</span>}
                        {otrosContactos > 0 && (
                          <span className="ml-1 text-xs text-blue-500">+{otrosContactos}</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                        {cp?.telefonos?.map((t, i) => <div key={i}>{t}</div>)}
                      </td>

                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300 max-w-[180px]">
                        {emails.length === 0 ? (
                          <span className="text-gray-400 dark:text-slate-500">—</span>
                        ) : (
                          <div className="space-y-0.5">
                            {emails.map((e, i) => (
                              <div key={i} className="break-all text-xs">{e}</div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{c.ciudad}</td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(c.materiales ?? []).length === 0 ? (
                            <span className="text-gray-400 text-xs">—</span>
                          ) : (
                            (c.materiales as string[]).map((m) => (
                              <span key={m} className="text-xs bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                                {m}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {activeTab === "todos" && (
                        <td className="px-4 py-3">
                          {c.status ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[c.status]}`}>
                              {c.status}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      )}

                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 max-w-[200px]">
                        {c.comentarios ? (
                          <span className="line-clamp-2" title={c.comentarios}>{c.comentarios}</span>
                        ) : (
                          <span className="text-gray-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/clientes/${c.id}`}
                            title="Ver cliente"
                            className="text-gray-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/clientes/${c.id}/editar`}
                            title="Editar cliente"
                            className="text-gray-400 hover:text-amber-600 dark:text-slate-500 dark:hover:text-amber-400 transition-colors p-1 rounded hover:bg-amber-50 dark:hover:bg-amber-900/30"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <DeleteClienteButton id={c.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
