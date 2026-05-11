"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

/** Inicia sesión con email + contraseña. */
export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Credenciales incorrectas. Verifica tu correo y contraseña." };
  }

  redirect("/");
}

/** Cierra la sesión activa. */
export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
