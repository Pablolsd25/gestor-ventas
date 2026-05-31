"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
};

/** Lee y valida los campos de comisión del formulario. */
function parseComision(formData: FormData):
  | { comision_tipo: "porcentaje" | "monto" | null; comision_valor: number | null }
  | { error: string } {
  const tipoRaw = (formData.get("comision_tipo") as string | null)?.trim() || "";
  const valorRaw = (formData.get("comision_valor") as string | null)?.trim() || "";

  if (!tipoRaw) {
    return { comision_tipo: null, comision_valor: null };
  }
  if (tipoRaw !== "porcentaje" && tipoRaw !== "monto") {
    return { error: "Tipo de comision invalido." };
  }
  if (!valorRaw) {
    return { error: "Indica el valor de la comision o elige 'Sin comision'." };
  }
  const valor = Number(valorRaw);
  if (isNaN(valor) || valor < 0) {
    return { error: "El valor de la comision debe ser un numero valido." };
  }
  return { comision_tipo: tipoRaw, comision_valor: valor };
}

export async function createVentaAction(
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const cliente_id = (formData.get("cliente_id") as string | null)?.trim() || null;
  const descripcion = (formData.get("descripcion") as string | null)?.trim() ?? "";
  const material_id = (formData.get("material_id") as string | null)?.trim();
  const cantidad = (formData.get("cantidad") as string | null)?.trim();
  const monto = (formData.get("monto") as string | null)?.trim() ?? "";
  const estado = (formData.get("estado") as string | null) as "ganada" | "perdida" | "en_proceso" | "propuesta" ?? "";
  const fecha_creacion = (formData.get("fecha_creacion") as string | null)?.trim() || null;
  const fecha_cierre = (formData.get("fecha_cierre") as string | null)?.trim() || null;
  const notas = (formData.get("notas") as string | null)?.trim() || null;

  if (!descripcion) return { error: "La descripcion es obligatoria." };
  if (!monto) return { error: "El monto es obligatorio." };
  if (isNaN(Number(monto)) || Number(monto) < 0) return { error: "El monto debe ser un numero valido." };
  if (!estado) return { error: "El estado es obligatorio." };

  const comision = parseComision(formData);
  if ("error" in comision) return { error: comision.error };

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: venta, error } = await supabase
    .from("ventas")
    .insert({
      cliente_id: cliente_id || null,
      descripcion,
      material_id: material_id ? parseInt(material_id, 10) : null,
      cantidad: cantidad ? parseFloat(cantidad) : null,
      monto: parseFloat(monto),
      estado,
      fecha_creacion: fecha_creacion || null,
      fecha_cierre: fecha_cierre || null,
      notas: notas || null,
      comision_tipo: comision.comision_tipo,
      comision_valor: comision.comision_valor,
    })
    .select("id")
    .single();

  if (error || !venta) {
    return { error: `Error al crear venta: ${error?.message}` };
  }

  // ── Recordatorio automático de seguimiento (opcional) ──
  const crearRecordatorio = (formData.get("crear_recordatorio") as string | null) === "on";
  if (crearRecordatorio) {
    const recFecha = (formData.get("recordatorio_fecha") as string | null)?.trim() || null;
    const fecha = recFecha || defaultSeguimientoFecha();
    await supabase.from("recordatorios").insert({
      titulo: `Seguimiento: ${descripcion}`.slice(0, 200),
      descripcion: "Recordatorio creado automáticamente al registrar la venta.",
      cliente_id: cliente_id || null,
      venta_id: venta.id,
      fecha,
      hora: "09:00",
      prioridad: "media",
      tipo: "seguimiento",
    });
  }

  revalidatePath("/ventas");
  revalidatePath("/recordatorios");
  redirect(`/ventas?toast=Venta+creada+exitosamente`);
}

/** Devuelve la fecha (YYYY-MM-DD) a 7 días desde hoy para el seguimiento por defecto. */
function defaultSeguimientoFecha(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export async function updateVentaAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const cliente_id = (formData.get("cliente_id") as string | null)?.trim() || null;
  const descripcion = (formData.get("descripcion") as string | null)?.trim() ?? "";
  const material_id = (formData.get("material_id") as string | null)?.trim();
  const cantidad = (formData.get("cantidad") as string | null)?.trim();
  const monto = (formData.get("monto") as string | null)?.trim() ?? "";
  const estado = (formData.get("estado") as string | null) as "ganada" | "perdida" | "en_proceso" | "propuesta" ?? "";
  const fecha_creacion = (formData.get("fecha_creacion") as string | null)?.trim() || null;
  const fecha_cierre = (formData.get("fecha_cierre") as string | null)?.trim() || null;
  const notas = (formData.get("notas") as string | null)?.trim() || null;

  if (!descripcion) return { error: "La descripcion es obligatoria." };
  if (!monto) return { error: "El monto es obligatorio." };
  if (isNaN(Number(monto)) || Number(monto) < 0) return { error: "El monto debe ser un numero valido." };
  if (!estado) return { error: "El estado es obligatorio." };

  const comision = parseComision(formData);
  if ("error" in comision) return { error: comision.error };

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { error } = await supabase
    .from("ventas")
    .update({
      cliente_id: cliente_id || null,
      descripcion,
      material_id: material_id ? parseInt(material_id, 10) : null,
      cantidad: cantidad ? parseFloat(cantidad) : null,
      monto: parseFloat(monto),
      estado,
      fecha_creacion: fecha_creacion || null,
      fecha_cierre: fecha_cierre || null,
      notas: notas || null,
      comision_tipo: comision.comision_tipo,
      comision_valor: comision.comision_valor,
    })
    .eq("id", id);

  if (error) {
    return { error: `Error al actualizar venta: ${error.message}` };
  }

  revalidatePath("/ventas");
  redirect(`/ventas?toast=Venta+actualizada+exitosamente`);
}

export async function deleteVentaAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  void prev; void formData;
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { error } = await supabase.from("ventas").delete().eq("id", id);

  if (error) {
    return { error: `Error al eliminar venta: ${error.message}` };
  }

  revalidatePath("/ventas");
  redirect("/ventas?toast=Venta+eliminada+correctamente");
}
