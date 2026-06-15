import { createHash, timingSafeEqual } from "crypto";

const SALT = process.env.CAJA_FUERTE_SALT ?? "gestor-ventas-caja-fuerte";

export function hashPin(pin: string): string {
  return createHash("sha256").update(`${SALT}:${pin}`).digest("hex");
}

export function verifyPin(pin: string, storedHash: string): boolean {
  const a = Buffer.from(hashPin(pin));
  const b = Buffer.from(storedHash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function validatePinFormat(pin: string): string | null {
  if (!pin || pin.length < 4) return "El PIN debe tener al menos 4 caracteres.";
  if (pin.length > 8) return "El PIN no puede tener más de 8 caracteres.";
  if (!/^\d+$/.test(pin)) return "El PIN solo puede contener números.";
  return null;
}
