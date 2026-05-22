"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createMaterialAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const nombre = (formData.get("nombre") as string)?.trim();
  if (!nombre) return { error: "El nombre del material es obligatorio." };

  const supabase = await createSupabaseServerClient() as any;

  const { data: maxRow } = await supabase
    .from("materiales")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  const nextId = (maxRow?.id ?? 0) + 1;

  const { error } = await supabase.from("materiales").insert({ id: nextId, nombre });

  if (error) return { error: `Error al crear material: ${error.message}` };

  revalidatePath("/materiales");
  return { success: true };
}

export async function updateMaterialAction(
  id: number,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const nombre = (formData.get("nombre") as string)?.trim();
  if (!nombre) return { error: "El nombre del material es obligatorio." };

  const supabase = await createSupabaseServerClient() as any;

  const { error } = await supabase.from("materiales").update({ nombre }).eq("id", id);

  if (error) return { error: `Error al actualizar material: ${error.message}` };

  revalidatePath("/materiales");
  return { success: true };
}

export async function deleteMaterialAction(
  id: number
): Promise<ActionState> {
  const supabase = await createSupabaseServerClient() as any;

  const { error } = await supabase.from("materiales").delete().eq("id", id);

  if (error) return { error: `Error al eliminar material: ${error.message}` };

  revalidatePath("/materiales");
  return { success: true };
}
