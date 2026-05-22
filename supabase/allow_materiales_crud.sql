-- Migración: Permitir INSERT / UPDATE / DELETE en la tabla materiales
-- Ejecutar en: Supabase > SQL Editor > New query
-- ============================================================

-- 1. Eliminar la política de solo lectura existente
DROP POLICY IF EXISTS "materiales_auth_read" ON materiales;

-- 2. Crear política que permita todas las operaciones CRUD
CREATE POLICY "materiales_auth_all" ON materiales
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
