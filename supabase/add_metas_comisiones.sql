-- ============================================================
-- GESTOR VENTAS — Migración: Metas mensuales + Comisión por venta
-- Ejecutar en: Supabase > SQL Editor > New query
-- Seguro de re-ejecutar (idempotente).
-- ============================================================

-- ─── 1. TABLA METAS (singleton: una sola fila editable) ──────
-- Define la meta mensual de facturación ($) y de toneladas (TN).
CREATE TABLE IF NOT EXISTS metas (
  id             SMALLINT      PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  meta_monto     NUMERIC(14,2) NOT NULL DEFAULT 0,   -- meta de $ por mes
  meta_toneladas NUMERIC(10,2) NOT NULL DEFAULT 0,   -- meta de TN por mes
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Fila inicial con valores de ejemplo (vender $2.5M / 150 TN al mes)
INSERT INTO metas (id, meta_monto, meta_toneladas)
  VALUES (1, 2500000, 150)
ON CONFLICT (id) DO NOTHING;

-- Trigger updated_at (reutiliza fn_set_updated_at del schema base)
DROP TRIGGER IF EXISTS trg_metas_updated_at ON metas;
CREATE TRIGGER trg_metas_updated_at
  BEFORE UPDATE ON metas
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- RLS: lectura/escritura para usuarios autenticados
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "metas_auth_all" ON metas;
CREATE POLICY "metas_auth_all" ON metas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ─── 2. COMISIÓN POR VENTA ───────────────────────────────────
-- comision_tipo:  'porcentaje' (valor = % del monto) | 'monto' (valor = $ fijo)
-- comision_valor: el porcentaje o el monto fijo según el tipo
ALTER TABLE ventas
  ADD COLUMN IF NOT EXISTS comision_tipo  VARCHAR(10)
    CHECK (comision_tipo IN ('porcentaje', 'monto')),
  ADD COLUMN IF NOT EXISTS comision_valor NUMERIC(14,2);
