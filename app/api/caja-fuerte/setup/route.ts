import { NextResponse } from "next/server";
import { getCajaFuertePinHash, saveCajaFuertePinHash } from "@/lib/caja-fuerte";
import { hashPin, validatePinFormat } from "@/lib/pin-hash";
import { friendlyDbError } from "@/lib/db-errors";

export async function POST(request: Request) {
  const { pin, confirm } = (await request.json()) as { pin?: string; confirm?: string };

  const existing = await getCajaFuertePinHash();
  if (existing) {
    return NextResponse.json({ error: "El PIN ya está configurado." }, { status: 400 });
  }

  const formatError = validatePinFormat(pin ?? "");
  if (formatError) {
    return NextResponse.json({ error: formatError }, { status: 400 });
  }

  if (pin !== confirm) {
    return NextResponse.json({ error: "Los PIN no coinciden." }, { status: 400 });
  }

  const saveError = await saveCajaFuertePinHash(hashPin(pin!));
  if (saveError) {
    return NextResponse.json({ error: friendlyDbError(saveError) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
