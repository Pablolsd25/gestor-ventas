-- PIN de la Caja Fuerte (hash, no texto plano)
ALTER TABLE perfil
  ADD COLUMN IF NOT EXISTS caja_fuerte_pin_hash TEXT;
