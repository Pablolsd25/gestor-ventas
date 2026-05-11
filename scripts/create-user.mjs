/**
 * Crea el usuario de autenticación en Supabase.
 * Uso: node --env-file=.env.local scripts/create-user.mjs
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Error: faltan variables de entorno.\n" +
      "Ejecuta: node --env-file=.env.local scripts/create-user.mjs"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email: "smagnacero@gmail.com",
  password: "R4f43lVa12!",
  email_confirm: true,
});

if (error) {
  if (error.message?.includes("already been registered")) {
    console.log("✓ El usuario ya existe en Supabase Auth.");
  } else {
    console.error("✗ Error al crear usuario:", error.message);
    process.exit(1);
  }
} else {
  console.log("✓ Usuario creado exitosamente:", data.user.id);
}
