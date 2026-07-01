import type { ClienteCompletoRow } from "@/types/database";
import type { TableColumn } from "@/lib/export-table";

type Contacto = {
  nombre: string;
  telefonos: string[];
  correos?: string[];
  correo: string | null;
};

const SEMAFORO_LABEL: Record<string, string> = {
  verde: "Verde",
  amarillo: "Amarillo",
  rojo: "Rojo",
};

export const CLIENTES_EXPORT_COLUMNS: TableColumn[] = [
  { key: "semaforo", label: "Semáforo", width: "10" },
  { key: "sae", label: "SAE", width: "8" },
  { key: "razonSocial", label: "Razón Social", width: "28" },
  { key: "contacto", label: "Contacto(s)", width: "22" },
  { key: "telefonos", label: "Teléfono(s)", width: "18" },
  { key: "correos", label: "Correo(s)", width: "26" },
  { key: "ciudad", label: "Ciudad / Estado", width: "16" },
  { key: "status", label: "Status", width: "12" },
  { key: "materiales", label: "Materiales", width: "22" },
  { key: "comentarios", label: "Comentarios", width: "24" },
];

function contactEmails(c: Contacto): string[] {
  const fromArray = (c.correos ?? []).filter(Boolean);
  if (fromArray.length) return fromArray;
  return c.correo ? [c.correo] : [];
}

export function clientesToExportRows(clientes: ClienteCompletoRow[]): Record<string, string>[] {
  return clientes.map((c) => {
    const contactos = (c.contactos ?? []) as Contacto[];
    const nombres = contactos.map((ct) => ct.nombre).filter(Boolean);
    const telefonos = contactos.flatMap((ct) => ct.telefonos ?? []).filter(Boolean);
    const correos = contactos.flatMap((ct) => contactEmails(ct));

    return {
      semaforo: c.semaforo ? (SEMAFORO_LABEL[c.semaforo] ?? c.semaforo) : "—",
      sae: c.sae ?? "—",
      razonSocial: c.razon_social,
      contacto: nombres.length ? nombres.join(" | ") : "—",
      telefonos: telefonos.length ? telefonos.join(" | ") : "—",
      correos: correos.length ? correos.join(" | ") : "—",
      ciudad: c.ciudad || "—",
      status: c.status ?? "Sin clasificar",
      materiales: ((c.materiales as string[]) ?? []).join(", ") || "—",
      comentarios: c.comentarios ?? "—",
    };
  });
}

export function clientesExportFilename(tabLabel: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug = tabLabel.toLowerCase().replace(/\s+/g, "-");
  return `clientes-${slug}-${date}.xlsx`;
}
