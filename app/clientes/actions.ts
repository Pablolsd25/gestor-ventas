"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ActionState = {
  error?: string;
  success?: boolean;
};

interface ContactoData {
  id?: string;
  nombre: string;
  telefonos: string[];
  correo: string;
}

interface ClienteFormData {
  razon_social: string;
  sae: string;
  ciudad: string;
  status: "Venta" | "Credito" | "Prospecto" | "";
  comentarios: string;
  contactos: ContactoData[];
  materiales: string[];
}

function materialNameToId(nombre: string): number | null {
  const match = nombre.match(/^(\d+)\./);
  if (match) return parseInt(match[1], 10);
  return null;
}

function parseContactos(raw: FormDataEntryValue | null): ContactoData[] {
  if (!raw || typeof raw !== "string") return [];
  try {
    return JSON.parse(raw) as ContactoData[];
  } catch {
    return [];
  }
}

function parseMateriales(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== "string") return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function createClienteAction(
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const data: ClienteFormData = {
    razon_social: (formData.get("razon_social") as string | null)?.trim() ?? "",
    sae: (formData.get("sae") as string | null)?.trim() ?? "",
    ciudad: (formData.get("ciudad") as string | null)?.trim() ?? "",
    status: (formData.get("status") as string | null) as ClienteFormData["status"] ?? "",
    comentarios: (formData.get("comentarios") as string | null)?.trim() ?? "",
    contactos: parseContactos(formData.get("contactos")),
    materiales: parseMateriales(formData.get("materiales")),
  };

  if (!data.razon_social) {
    return { error: "La razon social es obligatoria." };
  }
  if (!data.ciudad) {
    return { error: "La ciudad es obligatoria." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = await createSupabaseServerClient();

  const clienteResult = await supabase.from("clientes").insert({
    razon_social: data.razon_social,
    sae: data.sae || null,
    ciudad: data.ciudad,
    status: data.status || null,
    comentarios: data.comentarios || null,
  }).select("id").single();

  const cliente = clienteResult.data;
  const clienteError = clienteResult.error;

  if (clienteError || !cliente) {
    return { error: `Error al crear cliente: ${clienteError?.message}` };
  }

  const contactosToInsert = data.contactos
    .filter((c) => c.nombre.trim() || c.telefonos.length > 0 || (c.correo?.trim() ?? ""))
    .map((c) => ({
      cliente_id: cliente.id,
      nombre: c.nombre.trim() || "",
      telefonos: c.telefonos.filter((t) => t.trim()),
      correo: (c.correo?.trim() || null) as string | null,
    }));

  if (contactosToInsert.length > 0) {
    const { error: contactosError } = await supabase.from("contactos").insert(contactosToInsert);
    if (contactosError) {
      return { error: `Error al guardar contactos: ${contactosError.message}` };
    }
  }

  const materialIds = data.materiales.map((m) => materialNameToId(m)).filter((id): id is number => id !== null);

  if (materialIds.length > 0) {
    const { error: materialesError } = await supabase.from("cliente_materiales").insert(
      materialIds.map((material_id) => ({ cliente_id: cliente.id, material_id }))
    );
    if (materialesError) {
      return { error: `Error al guardar materiales: ${materialesError.message}` };
    }
  }

  revalidatePath("/clientes");
  redirect(`/clientes/${cliente.id}`);
}

export async function updateClienteAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const data: ClienteFormData = {
    razon_social: (formData.get("razon_social") as string | null)?.trim() ?? "",
    sae: (formData.get("sae") as string | null)?.trim() ?? "",
    ciudad: (formData.get("ciudad") as string | null)?.trim() ?? "",
    status: (formData.get("status") as string | null) as ClienteFormData["status"] ?? "",
    comentarios: (formData.get("comentarios") as string | null)?.trim() ?? "",
    contactos: parseContactos(formData.get("contactos")),
    materiales: parseMateriales(formData.get("materiales")),
  };

  if (!data.razon_social) {
    return { error: "La razon social es obligatoria." };
  }
  if (!data.ciudad) {
    return { error: "La ciudad es obligatoria." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = await createSupabaseServerClient();

  const updateResult = await supabase.from("clientes").update({
    razon_social: data.razon_social,
    sae: data.sae || null,
    ciudad: data.ciudad,
    status: data.status || null,
    comentarios: data.comentarios || null,
  }).eq("id", id);

  const updateError = updateResult.error;

  if (updateError) {
    return { error: `Error al actualizar cliente: ${updateError.message}` };
  }

  const deleteResult = await supabase.from("contactos").delete().eq("cliente_id", id);

  const deleteContactosError = deleteResult.error;
  if (deleteContactosError) {
    return { error: `Error al actualizar contactos: ${deleteContactosError.message}` };
  }

  const contactosToInsert = data.contactos
    .filter((c) => c.nombre.trim() || c.telefonos.length > 0 || (c.correo?.trim() ?? ""))
    .map((c) => ({
      cliente_id: id,
      nombre: c.nombre.trim() || "",
      telefonos: c.telefonos.filter((t) => t.trim()),
      correo: (c.correo?.trim() || null) as string | null,
    }));

  if (contactosToInsert.length > 0) {
    await supabase.from("contactos").insert(contactosToInsert);
  }

  await supabase.from("cliente_materiales").delete().eq("cliente_id", id);

  const materialIds = data.materiales.map((m) => materialNameToId(m)).filter((mid): mid is number => mid !== null);

  if (materialIds.length > 0) {
    await supabase.from("cliente_materiales").insert(
      materialIds.map((material_id) => ({ cliente_id: id, material_id }))
    );
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function deleteClienteAction(
  id: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  void _prev; void _formData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = await createSupabaseServerClient();

  const deleteResult = await supabase.from("clientes").delete().eq("id", id);
  const error = deleteResult.error;

  if (error) {
    return { error: `Error al eliminar cliente: ${error.message}` };
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}
