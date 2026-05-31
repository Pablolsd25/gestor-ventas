"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createMaterialAction(
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const nombre = (formData.get("nombre") as string | null)?.trim() || "";
  if (!nombre) return { error: "El nombre es obligatorio." };

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // id es SMALLINT manual: calculamos el siguiente disponible.
  const { data: maxRow } = await supabase
    .from("materiales")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextId = (maxRow?.id ?? 0) + 1;

  const { error } = await supabase.from("materiales").insert({ id: nextId, nombre });

  if (error) return { error: `Error al crear el material: ${error.message}` };

  revalidatePath("/materiales");
  return { success: true };
}

export async function updateMaterialAction(
  id: number,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const nombre = (formData.get("nombre") as string | null)?.trim() || "";
  if (!nombre) return { error: "El nombre es obligatorio." };

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("materiales").update({ nombre }).eq("id", id);

  if (error) return { error: `Error al actualizar el material: ${error.message}` };

  revalidatePath("/materiales");
  return { success: true };
}

export async function deleteMaterialAction(
  id: number,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  void prev; void formData;
  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("materiales").delete().eq("id", id);

  if (error) {
    return {
      error:
        "No se pudo eliminar. Es posible que el material esté en uso por clientes o ventas.",
    };
  }

  revalidatePath("/materiales");
  return { success: true };
}
