/** Convierte errores técnicos de Supabase en mensajes claros para el usuario. */
export function friendlyDbError(message: string): string {
  if (message.includes("caja_fuerte_pin_hash")) {
    return "Falta configurar la base de datos. El administrador debe ejecutar la migración add_caja_fuerte_pin.sql en Supabase.";
  }
  if (message.includes("semaforo") || message.includes("correos")) {
    return "Falta configurar la base de datos. El administrador debe ejecutar la migración add_correos_semaforo.sql en Supabase.";
  }
  return message;
}
