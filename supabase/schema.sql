-- ============================================================
-- GESTOR VENTAS — Schema Supabase
-- Ejecutar en: Supabase > SQL Editor > New query
-- ============================================================

-- ─── CATÁLOGO: materiales ────────────────────────────────────
-- Tabla de referencia con los 9 tipos de producto
CREATE TABLE IF NOT EXISTS materiales (
  id     SMALLINT    PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- ─── CLIENTES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sae          VARCHAR(20),                           -- código SAE interno
  razon_social VARCHAR(255) NOT NULL,
  ciudad       VARCHAR(255) NOT NULL DEFAULT '',
  status       VARCHAR(20)  CHECK (status IN ('Venta', 'Credito', 'Prospecto')),
  comentarios  TEXT,                                  -- fechas, motivos, seguimientos
  pagina_web   VARCHAR(500),                          -- sitio web del cliente
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── CONTACTOS (N por cliente) ────────────────────────────────
CREATE TABLE IF NOT EXISTS contactos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  UUID        NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre      VARCHAR(255) NOT NULL DEFAULT '',
  telefonos   TEXT[]       NOT NULL DEFAULT '{}',     -- varios números por contacto
  correo      VARCHAR(255),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── MATERIALES POR CLIENTE (N:M) ────────────────────────────
CREATE TABLE IF NOT EXISTS cliente_materiales (
  cliente_id  UUID     NOT NULL REFERENCES clientes(id)   ON DELETE CASCADE,
  material_id SMALLINT NOT NULL REFERENCES materiales(id) ON DELETE CASCADE,
  PRIMARY KEY (cliente_id, material_id)
);

-- ─── VENTAS / PEDIDOS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ventas (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID         REFERENCES clientes(id)   ON DELETE SET NULL,
  descripcion    TEXT         NOT NULL,
  material_id    SMALLINT     REFERENCES materiales(id) ON DELETE SET NULL,
  cantidad       NUMERIC(10,2),                         -- toneladas
  monto          NUMERIC(14,2) NOT NULL DEFAULT 0,
  estado         VARCHAR(20)  NOT NULL
                   CHECK (estado IN ('ganada','perdida','en_proceso','propuesta')),
  fecha_creacion DATE         NOT NULL DEFAULT CURRENT_DATE,
  fecha_cierre   DATE,
  notas          TEXT,
  comision_tipo  VARCHAR(10)  CHECK (comision_tipo IN ('porcentaje','monto')),
  comision_valor NUMERIC(14,2),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── METAS (singleton: meta mensual de $ y toneladas) ────────
CREATE TABLE IF NOT EXISTS metas (
  id             SMALLINT      PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  meta_monto     NUMERIC(14,2) NOT NULL DEFAULT 0,
  meta_toneladas NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── RECORDATORIOS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recordatorios (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      VARCHAR(255) NOT NULL,
  descripcion TEXT,
  cliente_id  UUID         REFERENCES clientes(id) ON DELETE SET NULL,
  venta_id    UUID         REFERENCES ventas(id)   ON DELETE SET NULL,
  fecha       DATE         NOT NULL,
  hora        TIME         NOT NULL,
  prioridad   VARCHAR(10)  NOT NULL CHECK (prioridad IN ('alta','media','baja')),
  tipo        VARCHAR(20)  NOT NULL
                CHECK (tipo IN ('llamada','reunion','email','seguimiento','otro')),
  completado  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: mantener updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_ventas_updated_at
  BEFORE UPDATE ON ventas
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_recordatorios_updated_at
  BEFORE UPDATE ON recordatorios
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_metas_updated_at
  BEFORE UPDATE ON metas
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clientes_status        ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_sae           ON clientes(sae);
CREATE INDEX IF NOT EXISTS idx_clientes_razon_social  ON clientes(razon_social);
CREATE INDEX IF NOT EXISTS idx_contactos_cliente      ON contactos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente         ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_estado          ON ventas(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_creacion  ON ventas(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_recordatorios_cliente  ON recordatorios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_recordatorios_fecha    ON recordatorios(fecha);
CREATE INDEX IF NOT EXISTS idx_recordatorios_completado ON recordatorios(completado);

-- ============================================================
-- VISTA: clientes con sus contactos y materiales en un solo query
-- ============================================================
CREATE OR REPLACE VIEW v_clientes AS
SELECT
  c.id,
  c.sae,
  c.razon_social,
  c.ciudad,
  c.status,
  c.comentarios,
  c.pagina_web,
  c.created_at,
  c.updated_at,
  -- Contactos como JSON array
  COALESCE(
    JSON_AGG(
      DISTINCT JSONB_BUILD_OBJECT(
        'id',        ct.id,
        'nombre',    ct.nombre,
        'telefonos', ct.telefonos,
        'correo',    ct.correo
      )
    ) FILTER (WHERE ct.id IS NOT NULL),
    '[]'
  ) AS contactos,
  -- Materiales como array de texto
  COALESCE(
    ARRAY_AGG(DISTINCT m.nombre) FILTER (WHERE m.nombre IS NOT NULL),
    '{}'
  ) AS materiales
FROM clientes c
LEFT JOIN contactos         ct ON ct.cliente_id  = c.id
LEFT JOIN cliente_materiales cm ON cm.cliente_id  = c.id
LEFT JOIN materiales          m ON  m.id          = cm.material_id
GROUP BY c.id;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Ajustar políticas según el sistema de autenticación que uses.
-- Por ahora: acceso total para usuarios autenticados.
-- ============================================================
ALTER TABLE clientes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordatorios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales         ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas              ENABLE ROW LEVEL SECURITY;

-- Clientes: lectura/escritura para autenticados
CREATE POLICY "clientes_auth_all" ON clientes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "contactos_auth_all" ON contactos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "cliente_materiales_auth_all" ON cliente_materiales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "ventas_auth_all" ON ventas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "recordatorios_auth_all" ON recordatorios
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Materiales: lectura/escritura para autenticados (catálogo)
CREATE POLICY "materiales_auth_all" ON materiales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Metas: lectura/escritura para autenticados
CREATE POLICY "metas_auth_all" ON metas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
