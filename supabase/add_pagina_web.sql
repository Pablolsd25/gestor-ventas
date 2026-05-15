-- Migración: agregar campo pagina_web a la tabla clientes
-- Ejecutar en: Supabase > SQL Editor

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS pagina_web VARCHAR(500);

-- Actualizar la vista v_clientes para incluir pagina_web
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
