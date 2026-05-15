-- ============================================================
-- fix_db.sql — Corrección de estado de base de datos
-- Ejecutar en: Supabase > SQL Editor > New query
-- ============================================================

-- 1. Asegurar columna pagina_web en clientes
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS pagina_web VARCHAR(500);

-- 2. Asegurar columna correo en contactos
ALTER TABLE contactos
  ADD COLUMN IF NOT EXISTS correo VARCHAR(255);

-- 3. Reinsertar los 9 materiales con los nombres exactos que usa la app
--    (ON CONFLICT DO UPDATE para corregir nombres si difieren)
INSERT INTO materiales (id, nombre) VALUES
  (1, '1. ALAMBRE RECOCIDO'),
  (2, '2. RECOCIDO INDUSTRIAL'),
  (3, '3. RECOCIDO SUAVE'),
  (4, '4. PULIDO EN ROLLO'),
  (5, '5. PULIDO EN BOBINA'),
  (6, '6. GALVANIZADO'),
  (7, '7. TREFILADO'),
  (8, '8. CORRUGADO'),
  (9, '9. SEMIFLECHA')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- 4. Recrear la vista v_clientes con todos los campos actuales
--    DROP primero porque CREATE OR REPLACE no puede cambiar el orden de columnas
DROP VIEW IF EXISTS v_clientes;
CREATE VIEW v_clientes AS
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
  COALESCE(
    ARRAY_AGG(DISTINCT m.nombre) FILTER (WHERE m.nombre IS NOT NULL),
    '{}'
  ) AS materiales
FROM clientes c
LEFT JOIN contactos         ct ON ct.cliente_id  = c.id
LEFT JOIN cliente_materiales cm ON cm.cliente_id  = c.id
LEFT JOIN materiales          m ON  m.id          = cm.material_id
GROUP BY c.id;
