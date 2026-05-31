"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type PerfilActionState = {
  error?: string;
  success?: boolean;
};

export async function updatePerfilAction(
  prev: PerfilActionState | undefined,
  formData: FormData
): Promise<PerfilActionState> {
  const nombre = (formData.get("nombre") as string | null)?.trim() || "";
  const puesto = (formData.get("puesto") as string | null)?.trim() || null;
  const foto_url = (formData.get("foto_url") as string | null)?.trim() || null;

  if (!nombre) return { error: "El nombre es obligatorio." };

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { error } = await supabase
    .from("perfil")
    .upsert({ id: 1, nombre, puesto, foto_url });

  if (error) {
    return { error: `Error al guardar el perfil: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
