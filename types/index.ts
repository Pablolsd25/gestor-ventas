// ─── Cliente ────────────────────────────────────────────────────────────────
export type ClienteStatus = "Venta" | "Credito" | "Prospecto";

export const MATERIALES = [
  "1. ALAMBRE RECOCIDO",
  "2. RECOCIDO INDUSTRIAL",
  "3. RECOCIDO SUAVE",
  "4. PULIDO EN ROLLO",
  "5. PULIDO EN BOBINA",
  "6. GALVANIZADO",
  "7. TREFILADO",
  "8. CORRUGADO",
  "9. SEMIFLECHA",
] as const;

export type Material = (typeof MATERIALES)[number] | (string & {});

export interface Contacto {
  nombre: string;       // puede ser vacío si no se tiene el dato
  telefonos: string[];  // puede tener más de uno
  correo?: string;
}

export interface Cliente {
  id: string;
  sae?: string;             // Código SAE del sistema interno
  razonSocial: string;      // Razón social de la empresa
  contactos: Contacto[];    // Uno o varios contactos por empresa
  ciudad: string;           // Ciudad o Estado
  materiales: Material[];   // Materiales que consume
  status?: ClienteStatus;   // Venta | Credito | Prospecto | sin asignar
  comentarios?: string;     // Fecha de cierre, último contacto, motivos, etc.
}

// ─── Venta (oportunidad / pedido) ────────────────────────────────────────────
export type VentaEstado = "ganada" | "perdida" | "en_proceso" | "propuesta";

export interface Venta {
  id: string;
  clienteId: string;
  clienteNombre: string;  // razonSocial del cliente
  descripcion: string;
  material?: Material;    // Material involucrado
  cantidad?: number;      // Toneladas
  monto: number;
  estado: VentaEstado;
  fechaCreacion: string;  // ISO date
  fechaCierre?: string;   // ISO date estimado o real
  notas?: string;
}

// ─── Recordatorio ────────────────────────────────────────────────────────────
export type RecordatorioPrioridad = "alta" | "media" | "baja";
export type RecordatorioTipo =
  | "llamada"
  | "reunion"
  | "email"
  | "seguimiento"
  | "otro";

export interface Recordatorio {
  id: string;
  titulo: string;
  descripcion?: string;
  clienteId?: string;
  clienteNombre?: string;
  ventaId?: string;
  fecha: string; // ISO date
  hora: string;  // HH:mm
  prioridad: RecordatorioPrioridad;
  tipo: RecordatorioTipo;
  completado: boolean;
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface VentaMensual {
  mes: string;
  monto: number;
  cantidad: number; // toneladas
}
