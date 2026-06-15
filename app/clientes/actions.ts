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
  correos: string[];
  correo?: string | null;
}

interface ClienteFormData {
  razon_social: string;
  sae: string;
  ciudad: string;
  pagina_web: string;
  status: "Venta" | "Credito" | "Prospecto" | "";
  semaforo: "verde" | "amarillo" | "rojo" | "";
  comentarios: string;
  contactos: ContactoData[];
  materiales: number[];
}

function parseContactos(raw: FormDataEntryValue | null): ContactoData[] {
  if (!raw || typeof raw !== "string") return [];
  try {
    return JSON.parse(raw) as ContactoData[];
  } catch {
    return [];
  }
}

function parseMateriales(raw: FormDataEntryValue | null): number[] {
  if (!raw || typeof raw !== "string") return [];
  try {
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

function normalizeContactos(contactos: ContactoData[]) {
  return contactos
    .filter((c) =>
      c.nombre.trim() ||
      c.telefonos.some((t) => t.trim()) ||
      (c.correos ?? []).some((e) => e.trim()) ||
      (c.correo?.trim() ?? "")
    )
    .map((c) => {
      const correos = (c.correos ?? [])
        .map((e) => e.trim())
        .filter(Boolean);
      const legacy = c.correo?.trim();
      if (legacy && !correos.includes(legacy)) correos.unshift(legacy);
      return {
        nombre: c.nombre.trim() || "",
        telefonos: c.telefonos.filter((t) => t.trim()),
        correos,
        correo: correos[0] ?? null,
      };
    });
}

function parseFormData(formData: FormData): ClienteFormData {
  return {
    razon_social: (formData.get("razon_social") as string | null)?.trim() ?? "",
    sae: (formData.get("sae") as string | null)?.trim() ?? "",
    ciudad: (formData.get("ciudad") as string | null)?.trim() ?? "",
    pagina_web: (formData.get("pagina_web") as string | null)?.trim() ?? "",
    status: (formData.get("status") as string | null) as ClienteFormData["status"] ?? "",
    semaforo: (formData.get("semaforo") as string | null) as ClienteFormData["semaforo"] ?? "",
    comentarios: (formData.get("comentarios") as string | null)?.trim() ?? "",
    contactos: parseContactos(formData.get("contactos")),
    materiales: parseMateriales(formData.get("materiales")),
  };
}

export async function createClienteAction(
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const data = parseFormData(formData);

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
    pagina_web: data.pagina_web || null,
    status: data.status || null,
    semaforo: data.semaforo || null,
    comentarios: data.comentarios || null,
  }).select("id").single();

  const cliente = clienteResult.data;
  const clienteError = clienteResult.error;

  if (clienteError || !cliente) {
    return { error: `Error al crear cliente: ${clienteError?.message}` };
  }

  const contactosToInsert = normalizeContactos(data.contactos).map((c) => ({
    cliente_id: cliente.id,
    ...c,
  }));

  if (contactosToInsert.length > 0) {
    const { error: contactosError } = await supabase.from("contactos").insert(contactosToInsert);
    if (contactosError) {
      return { error: `Error al guardar contactos: ${contactosError.message}` };
    }
  }

  if (data.materiales.length > 0) {
    const { error: materialesError } = await supabase.from("cliente_materiales").insert(
      data.materiales.map((material_id) => ({ cliente_id: cliente.id, material_id }))
    );
    if (materialesError) {
      return { error: `Error al guardar materiales: ${materialesError.message}` };
    }
  }

  revalidatePath("/clientes");
  redirect(`/clientes/${cliente.id}?toast=Cliente+creado+exitosamente`);
}

export async function updateClienteAction(
  id: string,
  prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const data = parseFormData(formData);

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
    pagina_web: data.pagina_web || null,
    status: data.status || null,
    semaforo: data.semaforo || null,
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

  const contactosToInsert = normalizeContactos(data.contactos).map((c) => ({
    cliente_id: id,
    ...c,
  }));

  if (contactosToInsert.length > 0) {
    await supabase.from("contactos").insert(contactosToInsert);
  }

  await supabase.from("cliente_materiales").delete().eq("cliente_id", id);

  if (data.materiales.length > 0) {
    await supabase.from("cliente_materiales").insert(
      data.materiales.map((material_id) => ({ cliente_id: id, material_id }))
    );
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}?toast=Cliente+actualizado+exitosamente`);
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
  redirect("/clientes?toast=Cliente+eliminado+correctamente");
}
