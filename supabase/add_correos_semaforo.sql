-- ============================================================
-- Migración: múltiples correos por contacto + semáforo en clientes
-- Ejecutar TODO este archivo de una sola vez en Supabase > SQL Editor
-- ============================================================

-- ── PASO 1: columna semaforo en clientes ─────────────────────
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS semaforo VARCHAR(10);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clientes_semaforo_check'
  ) THEN
    ALTER TABLE clientes
      ADD CONSTRAINT clientes_semaforo_check
      CHECK (semaforo IS NULL OR semaforo IN ('verde', 'amarillo', 'rojo'));
  END IF;
END $$;

-- ── PASO 2: array correos en contactos ───────────────────────
ALTER TABLE contactos
  ADD COLUMN IF NOT EXISTS correos TEXT[] NOT NULL DEFAULT '{}';

UPDATE contactos
SET correos = ARRAY[correo]
WHERE correo IS NOT NULL
  AND correo <> ''
  AND (correos IS NULL OR correos = '{}');

-- ── PASO 3: recrear vista (no usar CREATE OR REPLACE) ────────
DROP VIEW IF EXISTS v_clientes;

CREATE VIEW v_clientes AS
SELECT
  c.id,
  c.sae,
  c.razon_social,
  c.ciudad,
  c.status,
  c.semaforo,
  c.comentarios,
  c.pagina_web,
  c.created_at,
  c.updated_at,
  COALESCE(
    JSON_AGG(
      DISTINCT JSONB_BUILD_OBJECT(
        'id',        ct.id,
        'nombre',    ct.nombre,
        'telefonos', ct.telefonos,
        'correos',   ct.correos,
        'correo',    COALESCE(ct.correos[1], ct.correo)
      )
    ) FILTER (WHERE ct.id IS NOT NULL),
    '[]'
  ) AS contactos,
  COALESCE(
    ARRAY_AGG(DISTINCT m.nombre) FILTER (WHERE m.nombre IS NOT NULL),
    '{}'
  ) AS materiales
FROM clientes c
LEFT JOIN contactos         ct ON ct.cliente_id  = c.id
LEFT JOIN cliente_materiales cm ON cm.cliente_id  = c.id
LEFT JOIN materiales          m ON  m.id          = cm.material_id
GROUP BY c.id;

-- ── Verificación (opcional) ────────────────────────────────────
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'clientes' AND column_name = 'semaforo';
