import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getCajaFuertePinHash(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("perfil")
    .select("caja_fuerte_pin_hash")
    .eq("id", 1)
    .maybeSingle();

  const row = data as { caja_fuerte_pin_hash?: string | null } | null;
  return row?.caja_fuerte_pin_hash ?? null;
}

export async function saveCajaFuertePinHash(hash: string): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("perfil")
    .select("id")
    .eq("id", 1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("perfil")
      .update({ caja_fuerte_pin_hash: hash })
      .eq("id", 1);
    return error?.message ?? null;
  }

  const { error } = await supabase.from("perfil").insert({
    id: 1,
    nombre: "Vendedor",
    caja_fuerte_pin_hash: hash,
  });

  return error?.message ?? null;
}
