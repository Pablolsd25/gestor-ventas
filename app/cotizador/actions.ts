"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
};

type ItemInput = {
  descripcion: string;
  material_id: number | null;
  cantidad: number;
  precio_unitario: number;
};

/** Lee los campos comunes del formulario de cotización. */
function parseForm(formData: FormData) {
  const cliente_id = (formData.get("cliente_id") as string | null)?.trim() || null;
  const cliente_nombre = (formData.get("cliente_nombre") as string | null)?.trim() || null;
  const fecha = (formData.get("fecha") as string | null)?.trim() || null;
  const validezRaw = (formData.get("validez_dias") as string | null)?.trim() || "15";
  const validez_dias = Math.max(0, parseInt(validezRaw, 10) || 15);
  const notas = (formData.get("notas") as string | null)?.trim() || null;
  const itemsRaw = (formData.get("items") as string | null) ?? "[]";

  let items: ItemInput[] = [];
  try {
    const parsed = JSON.parse(itemsRaw) as Array<Record<string, unknown>>;
    items = parsed
      .map((it) => ({
        descripcion: String(it.descripcion ?? "").trim(),
        material_id:
          it.material_id != null && it.material_id !== ""
            ? Number(it.material_id)
            : null,
        cantidad: Number(it.cantidad) || 0,
        precio_unitario: Number(it.precio_unitario) || 0,
      }))
      .filter((it) => it.descripcion.length > 0);
  } catch {
    items = [];
  }

  const total = items.reduce((sum, it) => sum + it.cantidad * it.precio_unitario, 0);

  return { cliente_id, cliente_nombre, fecha, validez_dias, notas, items, total };
}

export async function createCotizacionAction(
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const f = parseForm(formData);

  if (!f.cliente_nombre && !f.cliente_id) {
    return { error: "Indica el cliente o un nombre para la cotización." };
  }
  if (f.items.length === 0) {
    return { error: "Agrega al menos una partida con descripción." };
  }

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: cot, error } = await supabase
    .from("cotizaciones")
    .insert({
      cliente_id: f.cliente_id,
      cliente_nombre: f.cliente_nombre,
      fecha: f.fecha || undefined,
      validez_dias: f.validez_dias,
      notas: f.notas,
      total: f.total,
    })
    .select("id")
    .single();

  if (error || !cot) {
    return { error: `Error al crear la cotización: ${error?.message}` };
  }

  const itemsRows = f.items.map((it, i) => ({ ...it, cotizacion_id: cot.id, orden: i }));
  const { error: itemsError } = await supabase.from("cotizacion_items").insert(itemsRows);

  if (itemsError) {
    return { error: `Error al guardar las partidas: ${itemsError.message}` };
  }

  revalidatePath("/cotizador");
  redirect(`/cotizador/${cot.id}`);
}

export async function updateCotizacionAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const f = parseForm(formData);

  if (!f.cliente_nombre && !f.cliente_id) {
    return { error: "Indica el cliente o un nombre para la cotización." };
  }
  if (f.items.length === 0) {
    return { error: "Agrega al menos una partida con descripción." };
  }

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { error } = await supabase
    .from("cotizaciones")
    .update({
      cliente_id: f.cliente_id,
      cliente_nombre: f.cliente_nombre,
      fecha: f.fecha || undefined,
      validez_dias: f.validez_dias,
      notas: f.notas,
      total: f.total,
    })
    .eq("id", id);

  if (error) {
    return { error: `Error al actualizar la cotización: ${error.message}` };
  }

  // Reemplazar partidas
  await supabase.from("cotizacion_items").delete().eq("cotizacion_id", id);
  const itemsRows = f.items.map((it, i) => ({ ...it, cotizacion_id: id, orden: i }));
  const { error: itemsError } = await supabase.from("cotizacion_items").insert(itemsRows);

  if (itemsError) {
    return { error: `Error al guardar las partidas: ${itemsError.message}` };
  }

  revalidatePath("/cotizador");
  revalidatePath(`/cotizador/${id}`);
  redirect(`/cotizador/${id}`);
}

export async function deleteCotizacionAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  void prev; void formData;
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("cotizaciones").delete().eq("id", id);

  if (error) {
    return { error: `Error al eliminar la cotización: ${error.message}` };
  }

  revalidatePath("/cotizador");
  redirect("/cotizador");
}
