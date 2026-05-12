"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
};

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
    })
    .select("id")
    .single();

  if (error || !venta) {
    return { error: `Error al crear venta: ${error?.message}` };
  }

  revalidatePath("/ventas");
  redirect(`/ventas`);
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
    })
    .eq("id", id);

  if (error) {
    return { error: `Error al actualizar venta: ${error.message}` };
  }

  revalidatePath("/ventas");
  redirect(`/ventas`);
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
  redirect("/ventas");
}
