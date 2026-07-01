-- ============================================================
-- PIN de la Caja Fuerte
-- Copiar y pegar TODO el bloque de abajo (las 2 líneas juntas)
-- Supabase > SQL Editor > Run
-- ============================================================

ALTER TABLE perfil
ADD COLUMN IF NOT EXISTS caja_fuerte_pin_hash TEXT;
