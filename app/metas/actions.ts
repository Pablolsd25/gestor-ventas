"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type MetaActionState = {
  error?: string;
  success?: boolean;
};

export async function updateMetaAction(
  prev: MetaActionState | undefined,
  formData: FormData
): Promise<MetaActionState> {
  const montoRaw = (formData.get("meta_monto") as string | null)?.trim() ?? "";
  const tonRaw = (formData.get("meta_toneladas") as string | null)?.trim() ?? "";

  const meta_monto = Number(montoRaw || 0);
  const meta_toneladas = Number(tonRaw || 0);

  if (isNaN(meta_monto) || meta_monto < 0) {
    return { error: "La meta de dinero debe ser un numero valido." };
  }
  if (isNaN(meta_toneladas) || meta_toneladas < 0) {
    return { error: "La meta de toneladas debe ser un numero valido." };
  }

  const supabase = await createSupabaseServerClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { error } = await supabase
    .from("metas")
    .upsert({ id: 1, meta_monto, meta_toneladas });

  if (error) {
    return { error: `Error al guardar la meta: ${error.message}` };
  }

  revalidatePath("/");
  return { success: true };
}
