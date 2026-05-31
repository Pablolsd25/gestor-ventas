"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
};

const COLORES = ["amarillo", "azul", "verde", "rosa", "morado", "gris"];

export async function createNotaAction(
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const titulo = (formData.get("titulo") as string | null)?.trim() || "";
  const contenido = (formData.get("contenido") as string | null)?.trim() || "";
  const colorRaw = (formData.get("color") as string | null)?.trim() || "amarillo";
  const color = COLORES.includes(colorRaw) ? colorRaw : "amarillo";

  if (!titulo && !contenido) {
    return { error: "La nota necesita un título o contenido." };
  }

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("notas").insert({ titulo, contenido, color });

  if (error) return { error: `Error al crear la nota: ${error.message}` };

  revalidatePath("/notas");
  return { success: true };
}

export async function updateNotaAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const titulo = (formData.get("titulo") as string | null)?.trim() || "";
  const contenido = (formData.get("contenido") as string | null)?.trim() || "";
  const colorRaw = (formData.get("color") as string | null)?.trim() || "amarillo";
  const color = COLORES.includes(colorRaw) ? colorRaw : "amarillo";

  if (!titulo && !contenido) {
    return { error: "La nota necesita un título o contenido." };
  }

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from("notas")
    .update({ titulo, contenido, color })
    .eq("id", id);

  if (error) return { error: `Error al actualizar la nota: ${error.message}` };

  revalidatePath("/notas");
  return { success: true };
}

export async function deleteNotaAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  void prev; void formData;
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("notas").delete().eq("id", id);

  if (error) return { error: `Error al eliminar la nota: ${error.message}` };

  revalidatePath("/notas");
  return { success: true };
}
