// Tipos generados para las tablas de Supabase.
// Reflejan exactamente el schema de supabase/schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ─── materiales ──────────────────────────────────────────
      materiales: {
        Row: {
          id:     number;
          nombre: string;
        };
        Insert: {
          id:     number;
          nombre: string;
        };
        Update: {
          id?:     number;
          nombre?: string;
        };
      };

      // ─── clientes ────────────────────────────────────────────
      clientes: {
        Row: {
          id:           string;   // UUID
          sae:          string | null;
          razon_social: string;
          ciudad:       string;
          status:       "Venta" | "Credito" | "Prospecto" | null;
          semaforo:     "verde" | "amarillo" | "rojo" | null;
          comentarios:  string | null;
          pagina_web:   string | null;
          created_at:   string;
          updated_at:   string;
        };
        Insert: {
          id?:          string;
          sae?:         string | null;
          razon_social: string;
          ciudad?:      string;
          status?:      "Venta" | "Credito" | "Prospecto" | null;
          semaforo?:    "verde" | "amarillo" | "rojo" | null;
          comentarios?: string | null;
          pagina_web?:  string | null;
          created_at?:  string;
          updated_at?:  string;
        };
        Update: {
          id?:          string;
          sae?:         string | null;
          razon_social?: string;
          ciudad?:       string;
          status?:       "Venta" | "Credito" | "Prospecto" | null;
          semaforo?:     "verde" | "amarillo" | "rojo" | null;
          comentarios?:  string | null;
          pagina_web?:   string | null;
          updated_at?:   string;
        };
      };

      // ─── contactos ───────────────────────────────────────────
      contactos: {
        Row: {
          id:         string;   // UUID
          cliente_id: string;   // UUID → clientes.id
          nombre:     string;
          telefonos:  string[];
          correos:    string[];
          correo:     string | null;
          created_at: string;
        };
        Insert: {
          id?:        string;
          cliente_id: string;
          nombre?:    string;
          telefonos?: string[];
          correos?:   string[];
          correo?:    string | null;
          created_at?: string;
        };
        Update: {
          nombre?:    string;
          telefonos?: string[];
          correos?:   string[];
          correo?:    string | null;
        };
      };

      // ─── cliente_materiales ───────────────────────────────────
      cliente_materiales: {
        Row: {
          cliente_id:  string;   // UUID
          material_id: number;
        };
        Insert: {
          cliente_id:  string;
          material_id: number;
        };
        Update: never;
      };

      // ─── ventas ───────────────────────────────────────────────
      ventas: {
        Row: {
          id:             string;   // UUID
          cliente_id:     string | null;
          descripcion:    string;
          material_id:    number | null;
          cantidad:       number | null;
          monto:          number;
          estado:         "ganada" | "perdida" | "en_proceso" | "propuesta";
          fecha_creacion: string;   // DATE (ISO)
          fecha_cierre:   string | null;
          notas:          string | null;
          comision_tipo:  "porcentaje" | "monto" | null;
          comision_valor: number | null;
          created_at:     string;
          updated_at:     string;
        };
        Insert: {
          id?:            string;
          cliente_id?:    string | null;
          descripcion:    string;
          material_id?:   number | null;
          cantidad?:      number | null;
          monto?:         number;
          estado:         "ganada" | "perdida" | "en_proceso" | "propuesta";
          fecha_creacion?: string;
          fecha_cierre?:  string | null;
          notas?:         string | null;
          comision_tipo?:  "porcentaje" | "monto" | null;
          comision_valor?: number | null;
          created_at?:    string;
          updated_at?:    string;
        };
        Update: {
          cliente_id?:    string | null;
          descripcion?:   string;
          material_id?:   number | null;
          cantidad?:      number | null;
          monto?:         number;
          estado?:        "ganada" | "perdida" | "en_proceso" | "propuesta";
          fecha_creacion?: string;
          fecha_cierre?:  string | null;
          notas?:         string | null;
          comision_tipo?:  "porcentaje" | "monto" | null;
          comision_valor?: number | null;
          updated_at?:    string;
        };
      };

      // ─── recordatorios ────────────────────────────────────────
      recordatorios: {
        Row: {
          id:          string;   // UUID
          titulo:      string;
          descripcion: string | null;
          cliente_id:  string | null;
          venta_id:    string | null;
          fecha:       string;   // DATE (ISO)
          hora:        string;   // TIME (HH:mm:ss)
          prioridad:   "alta" | "media" | "baja";
          tipo:        "llamada" | "reunion" | "email" | "seguimiento" | "otro";
          completado:  boolean;
          created_at:  string;
          updated_at:  string;
        };
        Insert: {
          id?:         string;
          titulo:      string;
          descripcion?: string | null;
          cliente_id?: string | null;
          venta_id?:   string | null;
          fecha:       string;
          hora:        string;
          prioridad:   "alta" | "media" | "baja";
          tipo:        "llamada" | "reunion" | "email" | "seguimiento" | "otro";
          completado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          titulo?:      string;
          descripcion?: string | null;
          cliente_id?:  string | null;
          venta_id?:    string | null;
          fecha?:       string;
          hora?:        string;
          prioridad?:   "alta" | "media" | "baja";
          tipo?:        "llamada" | "reunion" | "email" | "seguimiento" | "otro";
          completado?:  boolean;
          updated_at?:  string;
        };
      };

      // ─── metas ────────────────────────────────────────────────
      metas: {
        Row: {
          id:             number;
          meta_monto:     number;
          meta_toneladas: number;
          updated_at:     string;
        };
        Insert: {
          id?:             number;
          meta_monto?:     number;
          meta_toneladas?: number;
          updated_at?:     string;
        };
        Update: {
          meta_monto?:     number;
          meta_toneladas?: number;
          updated_at?:     string;
        };
      };

      // ─── perfil ───────────────────────────────────────────────
      perfil: {
        Row: {
          id:         number;
          nombre:     string;
          puesto:     string | null;
          foto_url:   string | null;
          caja_fuerte_pin_hash: string | null;
          updated_at: string;
        };
        Insert: {
          id?:        number;
          nombre?:    string;
          puesto?:    string | null;
          foto_url?:  string | null;
          caja_fuerte_pin_hash?: string | null;
          updated_at?: string;
        };
        Update: {
          nombre?:    string;
          puesto?:    string | null;
          foto_url?:  string | null;
          caja_fuerte_pin_hash?: string | null;
          updated_at?: string;
        };
      };

      // ─── notas ────────────────────────────────────────────────
      notas: {
        Row: {
          id:         string;
          titulo:     string;
          contenido:  string;
          color:      "amarillo" | "azul" | "verde" | "rosa" | "morado" | "gris";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?:        string;
          titulo?:    string;
          contenido?: string;
          color?:     "amarillo" | "azul" | "verde" | "rosa" | "morado" | "gris";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          titulo?:    string;
          contenido?: string;
          color?:     "amarillo" | "azul" | "verde" | "rosa" | "morado" | "gris";
          updated_at?: string;
        };
      };

      // ─── cotizaciones ─────────────────────────────────────────
      cotizaciones: {
        Row: {
          id:             string;
          folio:          number;
          cliente_id:     string | null;
          cliente_nombre: string | null;
          fecha:          string;
          validez_dias:   number;
          notas:          string | null;
          total:          number;
          created_at:     string;
          updated_at:     string;
        };
        Insert: {
          id?:             string;
          cliente_id?:     string | null;
          cliente_nombre?: string | null;
          fecha?:          string;
          validez_dias?:   number;
          notas?:          string | null;
          total?:          number;
          created_at?:     string;
          updated_at?:     string;
        };
        Update: {
          cliente_id?:     string | null;
          cliente_nombre?: string | null;
          fecha?:          string;
          validez_dias?:   number;
          notas?:          string | null;
          total?:          number;
          updated_at?:     string;
        };
      };

      // ─── cotizacion_items ─────────────────────────────────────
      cotizacion_items: {
        Row: {
          id:              string;
          cotizacion_id:   string;
          descripcion:     string;
          material_id:     number | null;
          cantidad:        number;
          precio_unitario: number;
          orden:           number;
        };
        Insert: {
          id?:             string;
          cotizacion_id:   string;
          descripcion:     string;
          material_id?:    number | null;
          cantidad?:       number;
          precio_unitario?: number;
          orden?:          number;
        };
        Update: {
          descripcion?:     string;
          material_id?:     number | null;
          cantidad?:        number;
          precio_unitario?: number;
          orden?:           number;
        };
      };
    };

    Views: {
      // Vista v_clientes: clientes con sus contactos y materiales agregados
      v_clientes: {
        Row: {
          id:           string;
          sae:          string | null;
          razon_social: string;
          ciudad:       string;
          status:       "Venta" | "Credito" | "Prospecto" | null;
          semaforo:     "verde" | "amarillo" | "rojo" | null;
          comentarios:  string | null;
          pagina_web:   string | null;
          created_at:   string;
          updated_at:   string;
          contactos:    Array<{
            id:        string;
            nombre:    string;
            telefonos: string[];
            correos:   string[];
            correo:    string | null;
          }>;
          materiales:   string[];
        };
      };
    };

    Functions: Record<string, never>;
    Enums:     Record<string, never>;
  };
}

// ─── Helpers de tipo para uso en la app ──────────────────────
export type ClienteRow          = Database["public"]["Tables"]["clientes"]["Row"];
export type ClienteInsert       = Database["public"]["Tables"]["clientes"]["Insert"];
export type ContactoRow         = Database["public"]["Tables"]["contactos"]["Row"];
export type VentaRow            = Database["public"]["Tables"]["ventas"]["Row"];
export type RecordatorioRow     = Database["public"]["Tables"]["recordatorios"]["Row"];
export type MaterialRow         = Database["public"]["Tables"]["materiales"]["Row"];
export type MetaRow             = Database["public"]["Tables"]["metas"]["Row"];
export type PerfilRow           = Database["public"]["Tables"]["perfil"]["Row"];
export type NotaRow             = Database["public"]["Tables"]["notas"]["Row"];
export type CotizacionRow       = Database["public"]["Tables"]["cotizaciones"]["Row"];
export type CotizacionItemRow   = Database["public"]["Tables"]["cotizacion_items"]["Row"];
export type ClienteCompletoRow  = Database["public"]["Views"]["v_clientes"]["Row"];

// ─── Tipos con joins (para queries con .select que incluyen relaciones) ───────

/** Venta con nombre de cliente y nombre de material resueltos. */
export interface VentaConUniones {
  id:             string;
  cliente_id:     string | null;
  descripcion:    string;
  material_id:    number | null;
  cantidad:       number | null;
  monto:          number;
  estado:         "ganada" | "perdida" | "en_proceso" | "propuesta";
  fecha_creacion: string;
  fecha_cierre:   string | null;
  notas:          string | null;
  comision_tipo:  "porcentaje" | "monto" | null;
  comision_valor: number | null;
  created_at:     string;
  updated_at:     string;
  clientes:       { razon_social: string } | null;
  materiales:     { nombre: string } | null;
}

/** Recordatorio con nombre de cliente resuelto. */
export interface RecordatorioConUniones {
  id:          string;
  titulo:      string;
  descripcion: string | null;
  cliente_id:  string | null;
  venta_id:    string | null;
  fecha:       string;
  hora:        string;   // "HH:mm:ss" desde Postgres TIME
  prioridad:   "alta" | "media" | "baja";
  tipo:        "llamada" | "reunion" | "email" | "seguimiento" | "otro";
  completado:  boolean;
  created_at:  string;
  updated_at:  string;
  clientes:    { razon_social: string } | null;
}
