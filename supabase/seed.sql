-- ============================================================
-- GESTOR VENTAS — Seed Data
-- Ejecutar DESPUÉS de schema.sql
-- Supabase > SQL Editor > New query
-- ============================================================

-- ─── 1. CATÁLOGO DE MATERIALES ───────────────────────────────
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
ON CONFLICT (id) DO NOTHING;


-- ─── 2. CLIENTES ─────────────────────────────────────────────
-- UUIDs fijos para poder referenciarlos en las siguientes tablas

INSERT INTO clientes (id, sae, razon_social, ciudad, status, comentarios) VALUES
  ('c1000000-0000-0000-0000-000000000001', '934',  'Aceros y Perfiles González',      'Santiago Tianguistengo',   'Venta',     'Se tramitará línea de crédito. Consumen de 10 a 30 ton x mes.'),
  ('c1000000-0000-0000-0000-000000000002', '904',  'CEDIS R1',                         'ECATEPEC',                 'Venta',     NULL),
  ('c1000000-0000-0000-0000-000000000003', '055',  'Rejimex',                          'San Vicente Chicoloapan',  'Credito',   NULL),
  ('c1000000-0000-0000-0000-000000000004', '924',  'Cassamar',                         'TEXCOCO',                  'Venta',     NULL),
  ('c1000000-0000-0000-0000-000000000005', '610',  'Resortes ind. Tollan',             'HIDALGO',                  NULL,        'Lic. Cesvi Hernandez'),
  ('c1000000-0000-0000-0000-000000000006', '905',  'Barachiel',                        'TEXCOCO',                  NULL,        NULL),
  ('c1000000-0000-0000-0000-000000000007', '918',  'Materiales Silva',                 'ECATEPEC',                 NULL,        NULL),
  ('c1000000-0000-0000-0000-000000000008', '927',  'EP Metal Stamper',                 'CHIHUAHUA',                NULL,        NULL),
  ('c1000000-0000-0000-0000-000000000009', '921',  'Aceros Baztan',                    'TLALNEPANTLA',             NULL,        NULL),
  ('c1000000-0000-0000-0000-000000000010', NULL,   'Cementos y Fierros Mexedo',        'TECAMAC',                  NULL,        NULL),
  ('c1000000-0000-0000-0000-000000000011', '57',   'Distribuciones Industriales Melo', 'ECATEPEC',                 NULL,        NULL),
  ('c1000000-0000-0000-0000-000000000012', '147',  'Grupo comercial Ramaj',            'NICOLAS ROMERO',           'Prospecto', NULL),
  ('c1000000-0000-0000-0000-000000000013', '200',  'Aceros calibrados de México',      'COYOACAN',                 'Prospecto', NULL),
  ('c1000000-0000-0000-0000-000000000014', NULL,   'Promare MC',                       'LEON',                     'Prospecto', NULL),
  ('c1000000-0000-0000-0000-000000000015', '457',  'Bodegas Beloso',                   'IZTAPALAPA',               'Prospecto', NULL),
  ('c1000000-0000-0000-0000-000000000016', NULL,   'Grupo cementero La Uno 3.0',       'Pachuca Hgo.',             'Venta',     'Le entregamos 15 ton finales de enero.')
ON CONFLICT (id) DO NOTHING;


-- ─── 3. CONTACTOS ────────────────────────────────────────────

INSERT INTO contactos (cliente_id, nombre, telefonos, correo) VALUES
  -- Aceros y Perfiles González
  ('c1000000-0000-0000-0000-000000000001', 'Eduardo González',
   ARRAY['713 105 5470'], 'acerosyperfilez-gonzalez@hotmail.com'),

  -- CEDIS R1 — dos contactos
  ('c1000000-0000-0000-0000-000000000002', 'Paola Neri',
   ARRAY['414 140 7704'], 'dtulpetlac@gmail.com'),
  ('c1000000-0000-0000-0000-000000000002', 'Maria Elena',
   ARRAY['414 140 7704'], 'dtulpetlac@gmail.com'),

  -- Rejimex — dos teléfonos
  ('c1000000-0000-0000-0000-000000000003', 'Vanesa Alvarado',
   ARRAY['55 5852 0434', '55 7613 1750'], 'auxadmon.rin@rejimexinternacional.net'),

  -- Cassamar
  ('c1000000-0000-0000-0000-000000000004', 'Marco Antonio Gonzalez',
   ARRAY['55 6792 6607'], 'facturas@acassamar.com'),

  -- Resortes ind. Tollan — dos teléfonos
  ('c1000000-0000-0000-0000-000000000005', 'Ing. Pedro y Federico Hdz',
   ARRAY['772 128 6799', '55 2909 7133'], 'contabilidad@resortestollan.com.mx'),

  -- Barachiel
  ('c1000000-0000-0000-0000-000000000006', 'Victor Morales',
   ARRAY['55 5451 4010'], 'gamepaty@yahoo.com.mx'),

  -- Materiales Silva
  ('c1000000-0000-0000-0000-000000000007', 'Diego Silva',
   ARRAY['55 2584 7930'], NULL),

  -- EP Metal Stamper
  ('c1000000-0000-0000-0000-000000000008', 'Carlos Gonzalez',
   ARRAY['625 103 7076'], NULL),

  -- Aceros Baztan (teléfono incompleto en fuente original)
  ('c1000000-0000-0000-0000-000000000009', 'Lic. Carlos Mario Reyes',
   ARRAY['55 9194 0470'], NULL),

  -- Cementos y Fierros Mexedo
  ('c1000000-0000-0000-0000-000000000010', 'Victor Morales',
   ARRAY['55 5451 4338'], 'cfmexedo@grupogalmedhnos.com'),

  -- Distribuciones Industriales Melo (sin nombre de contacto)
  ('c1000000-0000-0000-0000-000000000011', '',
   ARRAY['55 9220 0277'], 'atn_clientes@melo.mx'),

  -- Grupo comercial Ramaj (sin nombre)
  ('c1000000-0000-0000-0000-000000000012', '',
   ARRAY['55 5996 7149'], 'gruporamaj@gmail.com'),

  -- Aceros calibrados de México (sin nombre)
  ('c1000000-0000-0000-0000-000000000013', '',
   ARRAY['55 5617 4515'], 'acerosjaosa01@prodigy.net'),

  -- Promare MC
  ('c1000000-0000-0000-0000-000000000014', 'Ramiro E Rodriguez M.',
   ARRAY['477 167 6130'], 'analuisaabad@yahoo.com.mx'),

  -- Bodegas Beloso (sin nombre)
  ('c1000000-0000-0000-0000-000000000015', '',
   ARRAY['55 5694 5092'], 'ipelizondo@bodegasbeloso.com'),

  -- Grupo cementero La Uno 3.0
  ('c1000000-0000-0000-0000-000000000016', 'Edwin',
   ARRAY['771 106 0368'], 'materialeslauno@hotmail.com');


-- ─── 4. MATERIALES POR CLIENTE ───────────────────────────────

INSERT INTO cliente_materiales (cliente_id, material_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 9),  -- Aceros González      → Semiflecha
  ('c1000000-0000-0000-0000-000000000002', 1),  -- CEDIS R1             → Alambre recocido
  ('c1000000-0000-0000-0000-000000000003', 4),  -- Rejimex              → Pulido en rollo
  ('c1000000-0000-0000-0000-000000000004', 1),  -- Cassamar             → Alambre recocido
  ('c1000000-0000-0000-0000-000000000005', 4),  -- Resortes Tollan      → Pulido en rollo
  ('c1000000-0000-0000-0000-000000000006', 1),  -- Barachiel            → Alambre recocido
  ('c1000000-0000-0000-0000-000000000007', 1),  -- Materiales Silva     → Alambre recocido
  ('c1000000-0000-0000-0000-000000000008', 5),  -- EP Metal Stamper     → Pulido en bobina
  ('c1000000-0000-0000-0000-000000000009', 9),  -- Aceros Baztan        → Semiflecha
  ('c1000000-0000-0000-0000-000000000010', 1),  -- Cementos Mexedo      → Alambre recocido
  ('c1000000-0000-0000-0000-000000000011', 2),  -- Dist. Melo           → Recocido industrial
  ('c1000000-0000-0000-0000-000000000012', 1),  -- Grupo Ramaj          → Alambre recocido
  ('c1000000-0000-0000-0000-000000000013', 2),  -- Aceros calibrados    → Recocido industrial
  ('c1000000-0000-0000-0000-000000000015', 2),  -- Bodegas Beloso       → Recocido industrial
  ('c1000000-0000-0000-0000-000000000016', 1)   -- Grupo La Uno 3.0     → Alambre recocido
ON CONFLICT DO NOTHING;
-- Nota: Promare MC (c14) no tiene material registrado en la fuente original.


-- ─── 5. VENTAS DE EJEMPLO ────────────────────────────────────

-- Nota: los UUIDs de ventas usan prefijo "e2" (hex válido) para distinguirlos de clientes
INSERT INTO ventas (id, cliente_id, descripcion, material_id, cantidad, monto, estado, fecha_creacion, fecha_cierre, notas) VALUES
  ('e2000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'Semiflecha mensual – tramitar línea de crédito', 9, 20, 280000,
   'en_proceso', '2024-01-15', '2024-02-28', 'Consumen entre 10 y 30 ton/mes'),

  ('e2000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000002',
   'Alambre recocido mensual', 1, 15, 180000,
   'ganada', '2024-01-10', '2024-01-31', NULL),

  ('e2000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000003',
   'Pulido en rollo Q1', 4, 8, 120000,
   'ganada', '2024-01-20', '2024-02-15', NULL),

  ('e2000000-0000-0000-0000-000000000004',
   'c1000000-0000-0000-0000-000000000016',
   'Entrega 15 ton alambre recocido', 1, 15, 195000,
   'ganada', '2024-01-25', '2024-01-31', 'Entregadas finales de enero'),

  ('e2000000-0000-0000-0000-000000000005',
   'c1000000-0000-0000-0000-000000000004',
   'Alambre recocido – pedido mensual', 1, 10, 130000,
   'en_proceso', '2024-02-01', '2024-03-15', NULL),

  ('e2000000-0000-0000-0000-000000000006',
   'c1000000-0000-0000-0000-000000000012',
   'Propuesta inicial alambre recocido', 1, 5, 65000,
   'propuesta', '2024-02-10', '2024-04-01', NULL),

  ('e2000000-0000-0000-0000-000000000007',
   'c1000000-0000-0000-0000-000000000009',
   'Semiflecha – cotización inicial', 9, 12, 168000,
   'propuesta', '2024-02-15', '2024-04-30', NULL)
ON CONFLICT (id) DO NOTHING;


-- ─── 6. RECORDATORIOS DE EJEMPLO ─────────────────────────────

INSERT INTO recordatorios (cliente_id, venta_id, titulo, fecha, hora, prioridad, tipo, completado) VALUES
  ('c1000000-0000-0000-0000-000000000001',
   'e2000000-0000-0000-0000-000000000001',
   'Tramitar línea de crédito – Aceros González',
   '2024-05-10', '10:00', 'alta', 'seguimiento', FALSE),

  ('c1000000-0000-0000-0000-000000000012',
   'e2000000-0000-0000-0000-000000000006',
   'Enviar propuesta a Grupo Ramaj',
   '2024-05-11', '09:00', 'alta', 'email', FALSE),

  ('c1000000-0000-0000-0000-000000000004',
   'e2000000-0000-0000-0000-000000000005',
   'Reunión cierre pedido – Cassamar',
   '2024-05-14', '15:00', 'media', 'reunion', FALSE),

  ('c1000000-0000-0000-0000-000000000002',
   NULL,
   'Llamar a CEDIS R1 – seguimiento',
   '2024-05-16', '11:00', 'media', 'llamada', FALSE),

  ('c1000000-0000-0000-0000-000000000014',
   NULL,
   'Contactar Promare MC',
   '2024-05-20', '10:00', 'media', 'llamada', FALSE),

  (NULL, NULL,
   'Revisar pipeline mensual',
   '2024-04-30', '08:00', 'baja', 'otro', TRUE);
