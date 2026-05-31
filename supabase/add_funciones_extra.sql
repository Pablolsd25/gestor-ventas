-- ============================================================
-- GESTOR VENTAS — Migración: Funciones extra
-- (Perfil + Notas + Cotizador + Materiales editables)
-- Ejecutar en: Supabase > SQL Editor > New query
-- Seguro de re-ejecutar (idempotente).
-- ============================================================

-- ─── 1. PERFIL (singleton: datos del vendedor + foto) ────────
CREATE TABLE IF NOT EXISTS perfil (
  id         SMALLINT     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nombre     VARCHAR(120) NOT NULL DEFAULT 'Vendedor',
  puesto     VARCHAR(120),
  foto_url   TEXT,
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO perfil (id, nombre, puesto)
  VALUES (1, 'Vendedor', 'Panel del Vendedor')
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS trg_perfil_updated_at ON perfil;
CREATE TRIGGER trg_perfil_updated_at
  BEFORE UPDATE ON perfil
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "perfil_auth_all" ON perfil;
CREATE POLICY "perfil_auth_all" ON perfil
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ─── 2. NOTAS RÁPIDAS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notas (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo     VARCHAR(200) NOT NULL DEFAULT '',
  contenido  TEXT         NOT NULL DEFAULT '',
  color      VARCHAR(20)  NOT NULL DEFAULT 'amarillo'
               CHECK (color IN ('amarillo','azul','verde','rosa','morado','gris')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_notas_updated_at ON notas;
CREATE TRIGGER trg_notas_updated_at
  BEFORE UPDATE ON notas
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_notas_created ON notas(created_at DESC);

ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notas_auth_all" ON notas;
CREATE POLICY "notas_auth_all" ON notas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ─── 3. MATERIALES EDITABLES (policies de escritura) ─────────
-- El catálogo ya existe; antes solo permitía lectura. Ahora full CRUD.
DROP POLICY IF EXISTS "materiales_auth_all" ON materiales;
CREATE POLICY "materiales_auth_all" ON materiales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ─── 4. COTIZADOR ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cotizaciones (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  folio       SERIAL,                                  -- número correlativo legible
  cliente_id  UUID         REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre VARCHAR(255),                         -- snapshot por si no hay cliente_id
  fecha       DATE         NOT NULL DEFAULT CURRENT_DATE,
  validez_dias SMALLINT    NOT NULL DEFAULT 15,
  notas       TEXT,
  total       NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cotizacion_items (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id  UUID          NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  descripcion    VARCHAR(255)  NOT NULL,
  material_id    SMALLINT      REFERENCES materiales(id) ON DELETE SET NULL,
  cantidad       NUMERIC(10,2) NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(14,2) NOT NULL DEFAULT 0,
  orden          SMALLINT      NOT NULL DEFAULT 0
);

DROP TRIGGER IF EXISTS trg_cotizaciones_updated_at ON cotizaciones;
CREATE TRIGGER trg_cotizaciones_updated_at
  BEFORE UPDATE ON cotizaciones
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente ON cotizaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_fecha   ON cotizaciones(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_cot_items_cotizacion ON cotizacion_items(cotizacion_id);

ALTER TABLE cotizaciones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cotizaciones_auth_all" ON cotizaciones;
CREATE POLICY "cotizaciones_auth_all" ON cotizaciones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cotizacion_items_auth_all" ON cotizacion_items;
CREATE POLICY "cotizacion_items_auth_all" ON cotizacion_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
