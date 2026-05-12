"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createRecordatorioAction(
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const titulo = (formData.get("titulo") as string | null)?.trim() ?? "";
  const descripcion = (formData.get("descripcion") as string | null)?.trim() || null;
  const cliente_id = (formData.get("cliente_id") as string | null)?.trim() || null;
  const venta_id = (formData.get("venta_id") as string | null)?.trim() || null;
  const fecha = (formData.get("fecha") as string | null)?.trim() ?? "";
  const hora = (formData.get("hora") as string | null)?.trim() ?? "";
  const prioridad = (formData.get("prioridad") as string | null) as "alta" | "media" | "baja" ?? "";
  const tipo = (formData.get("tipo") as string | null) as "llamada" | "reunion" | "email" | "seguimiento" | "otro" ?? "";

  if (!titulo) return { error: "El titulo es obligatorio." };
  if (!fecha) return { error: "La fecha es obligatoria." };
  if (!hora) return { error: "La hora es obligatoria." };
  if (!prioridad) return { error: "La prioridad es obligatoria." };
  if (!tipo) return { error: "El tipo es obligatorio." };

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: recordatorio, error } = await supabase
    .from("recordatorios")
    .insert({
      titulo,
      descripcion: descripcion || null,
      cliente_id: cliente_id || null,
      venta_id: venta_id || null,
      fecha,
      hora,
      prioridad,
      tipo,
    })
    .select("id")
    .single();

  if (error || !recordatorio) {
    return { error: `Error al crear recordatorio: ${error?.message}` };
  }

  revalidatePath("/recordatorios");
  redirect("/recordatorios");
}

export async function updateRecordatorioAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const titulo = (formData.get("titulo") as string | null)?.trim() ?? "";
  const descripcion = (formData.get("descripcion") as string | null)?.trim() || null;
  const cliente_id = (formData.get("cliente_id") as string | null)?.trim() || null;
  const venta_id = (formData.get("venta_id") as string | null)?.trim() || null;
  const fecha = (formData.get("fecha") as string | null)?.trim() ?? "";
  const hora = (formData.get("hora") as string | null)?.trim() ?? "";
  const prioridad = (formData.get("prioridad") as string | null) as "alta" | "media" | "baja" ?? "";
  const tipo = (formData.get("tipo") as string | null) as "llamada" | "reunion" | "email" | "seguimiento" | "otro" ?? "";

  if (!titulo) return { error: "El titulo es obligatorio." };
  if (!fecha) return { error: "La fecha es obligatoria." };
  if (!hora) return { error: "La hora es obligatoria." };
  if (!prioridad) return { error: "La prioridad es obligatoria." };
  if (!tipo) return { error: "El tipo es obligatorio." };

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { error } = await supabase
    .from("recordatorios")
    .update({
      titulo,
      descripcion: descripcion || null,
      cliente_id: cliente_id || null,
      venta_id: venta_id || null,
      fecha,
      hora,
      prioridad,
      tipo,
    })
    .eq("id", id);

  if (error) {
    return { error: `Error al actualizar recordatorio: ${error.message}` };
  }

  revalidatePath("/recordatorios");
  redirect("/recordatorios");
}

export async function completeRecordatorioAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  void prev; void formData;
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { error } = await supabase
    .from("recordatorios")
    .update({ completado: true })
    .eq("id", id);

  if (error) {
    return { error: `Error al completar recordatorio: ${error.message}` };
  }

  revalidatePath("/recordatorios");
  return { success: true };
}

export async function deleteRecordatorioAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  void prev; void formData;
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { error } = await supabase.from("recordatorios").delete().eq("id", id);

  if (error) {
    return { error: `Error al eliminar recordatorio: ${error.message}` };
  }

  revalidatePath("/recordatorios");
  redirect("/recordatorios");
}
