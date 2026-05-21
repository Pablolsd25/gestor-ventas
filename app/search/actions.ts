"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export type SearchResult = {
  id:       string;
  type:     "cliente" | "venta" | "recordatorio";
  title:    string;
  subtitle: string;
  href:     string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const supabase = await createSupabaseServerClient();
  const pattern  = `%${q}%`;

  const [clientesRes, ventasRes, recordatoriosRes] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, razon_social, sae, status")
      .or(`razon_social.ilike.${pattern},sae.ilike.${pattern}`)
      .limit(4),

    supabase
      .from("ventas")
      .select("id, descripcion, estado, clientes(razon_social)")
      .ilike("descripcion", pattern)
      .limit(4),

    supabase
      .from("recordatorios")
      .select("id, titulo, fecha, prioridad, completado, clientes(razon_social)")
      .ilike("titulo", pattern)
      .eq("completado", false)
      .limit(4),
  ]);

  const results: SearchResult[] = [];

  for (const c of (clientesRes.data ?? []) as Array<{
    id: string; razon_social: string; sae: string | null; status: string | null;
  }>) {
    const parts = [c.sae ? `SAE ${c.sae}` : null, c.status].filter(Boolean);
    results.push({
      id:       c.id,
      type:     "cliente",
      title:    c.razon_social,
      subtitle: parts.join(" · "),
      href:     `/clientes/${c.id}`,
    });
  }

  for (const v of (ventasRes.data ?? []) as Array<{
    id: string; descripcion: string; estado: string;
    clientes: { razon_social: string } | null;
  }>) {
    const parts = [
      v.clientes?.razon_social ?? null,
      v.estado,
    ].filter(Boolean);
    results.push({
      id:       v.id,
      type:     "venta",
      title:    v.descripcion,
      subtitle: parts.join(" · "),
      href:     `/ventas/${v.id}/editar`,
    });
  }

  for (const r of (recordatoriosRes.data ?? []) as Array<{
    id: string; titulo: string; fecha: string; prioridad: string;
    clientes: { razon_social: string } | null;
  }>) {
    const parts = [r.fecha, r.clientes?.razon_social ?? null].filter(Boolean);
    results.push({
      id:       r.id,
      type:     "recordatorio",
      title:    r.titulo,
      subtitle: parts.join(" · "),
      href:     `/recordatorios/${r.id}/editar`,
    });
  }

  return results;
}
