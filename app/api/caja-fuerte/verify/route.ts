import { NextResponse } from "next/server";
import { getCajaFuertePinHash } from "@/lib/caja-fuerte";
import { verifyPin } from "@/lib/pin-hash";

export async function POST(request: Request) {
  const { pin } = (await request.json()) as { pin?: string };
  const stored = await getCajaFuertePinHash();

  // Sin PIN en BD: aceptar variable de entorno como respaldo temporal
  if (!stored) {
    const fallback = process.env.CAJA_FUERTE_PIN;
    if (fallback && pin === fallback) {
      return NextResponse.json({ ok: true, needsSetup: true });
    }
    return NextResponse.json({ error: "Configura tu PIN primero." }, { status: 401 });
  }

  if (!pin || !verifyPin(pin, stored)) {
    return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
