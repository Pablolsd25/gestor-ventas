import { NextResponse } from "next/server";
import { getCajaFuertePinHash } from "@/lib/caja-fuerte";

export async function GET() {
  const hash = await getCajaFuertePinHash();
  return NextResponse.json({ configured: Boolean(hash) });
}
