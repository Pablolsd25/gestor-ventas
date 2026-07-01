import { NextResponse } from "next/server";
import { getCajaFuertePinHash, saveCajaFuertePinHash } from "@/lib/caja-fuerte";
import { hashPin, validatePinFormat, verifyPin } from "@/lib/pin-hash";
import { friendlyDbError } from "@/lib/db-errors";

export async function POST(request: Request) {
  const { currentPin, newPin, confirm } = (await request.json()) as {
    currentPin?: string;
    newPin?: string;
    confirm?: string;
  };

  const stored = await getCajaFuertePinHash();
  if (!stored) {
    return NextResponse.json({ error: "Primero debes crear un PIN." }, { status: 400 });
  }

  if (!currentPin || !verifyPin(currentPin, stored)) {
    return NextResponse.json({ error: "PIN actual incorrecto." }, { status: 401 });
  }

  const formatError = validatePinFormat(newPin ?? "");
  if (formatError) {
    return NextResponse.json({ error: formatError }, { status: 400 });
  }

  if (newPin !== confirm) {
    return NextResponse.json({ error: "Los PIN nuevos no coinciden." }, { status: 400 });
  }

  const saveError = await saveCajaFuertePinHash(hashPin(newPin!));
  if (saveError) {
    return NextResponse.json({ error: friendlyDbError(saveError) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
