-- ============================================================
--  DATOS DE EJEMPLO
--  Lorena's Clothing Store
-- ============================================================

BEGIN;

TRUNCATE TABLE
	detalle_pedido,
	pagos,
	envios,
	pedidos,
	direcciones_envio,
	clientes,
	productos,
	metodos_envio,
	categorias
RESTART IDENTITY CASCADE;

-- 1. CATEGORIAS
INSERT INTO categorias (nombre, descripcion) VALUES
('Ropa',        'Prendas de vestir para mujer y hombre'),
('Zapatos',     'Calzado casual, formal y deportivo'),
('Bolsos',      'Bolsos, carteras y mochilas'),
('Accesorios',  'Complementos de moda como cinturones, gafas y joyería');

-- 2. PRODUCTOS
INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, activo) VALUES
(1, 'Vestido Floral Midi',          'Vestido estampado floral, manga corta, ideal para ocasiones casuales', 129900.00, 15, TRUE),
(1, 'Blusa Blanca Elegante',        'Blusa formal de tela ligera con detalle en cuello',                    89900.00, 20, TRUE),
(1, 'Jean Skinny Azul',             'Jean ajustado de tiro alto en denim azul',                           119900.00, 18, TRUE),

(2, 'Tacones Nude Clásicos',        'Zapatos de tacón medio color nude',                                  159900.00, 10, TRUE),
(2, 'Tenis Blancos Urbanos',        'Tenis casuales blancos para uso diario',                             179900.00, 12, TRUE),
(2, 'Sandalias Doradas',            'Sandalias elegantes con correa ajustable',                           139900.00,  8, TRUE),

(3, 'Bolso Tote Beige',             'Bolso amplio tipo tote en cuero sintético',                          149900.00,  9, TRUE),
(3, 'Cartera Negra Crossbody',      'Cartera pequeña con correa larga ajustable',                         109900.00, 14, TRUE),
(3, 'Mochila Urbana Gris',          'Mochila casual con compartimento principal amplio',                  134900.00, 11, TRUE),

(4, 'Cinturón Marrón',              'Cinturón clásico de hebilla metálica',                                49900.00, 25, TRUE),
(4, 'Gafas de Sol Cat Eye',         'Gafas de sol con montura estilo cat eye',                             69900.00, 16, TRUE),
(4, 'Aretes Dorados Minimalistas',  'Aretes pequeños de diseño elegante',                                  39900.00, 30, TRUE);

-- 3. CLIENTES
INSERT INTO clientes (nombre, apellido, email, direccion, telefono, activo) VALUES
('Laura',  'Martinez',  'laura.martinez@gmail.com',   'Calle 45 #23-67',   '3001112233', TRUE),
('Camila', 'Rodriguez', 'camila.rodriguez@gmail.com', 'Carrera 12 #34-56', '3012223344', TRUE),
('Sofia',  'Gomez',     'sofia.gomez@gmail.com',      'Avenida 68 #78-90', '3023334455', TRUE);

-- 4. DIRECCIONES_ENVIO
INSERT INTO direcciones_envio (cliente_id, alias, calle, ciudad, departamento, codigo_postal, pais, es_principal) VALUES
(1, 'Casa',        'Calle 45 #12-30',      'Bogotá',   'Cundinamarca',    '110111', 'Colombia', TRUE),
(2, 'Apartamento', 'Carrera 18 #50-22',    'Medellín', 'Antioquia',       '050021', 'Colombia', TRUE),
(3, 'Trabajo',     'Avenida 3N #25-18',    'Cali',     'Valle del Cauca', '760001', 'Colombia', TRUE);

-- 5. METODOS_ENVIO
INSERT INTO metodos_envio (nombre, descripcion, costo_base, dias_estimados, activo) VALUES
('Envío Estándar',      'Entrega nacional en tiempo regular',                   12000.00, 5, TRUE),
('Envío Express',       'Entrega prioritaria en ciudades principales',          22000.00, 2, TRUE),
('Recogida en Tienda',  'Recoge tu pedido directamente en el local',                0.00, 1, TRUE);

-- 6. PEDIDOS
INSERT INTO pedidos (cliente_id, direccion_envio_id, estado, total, notas) VALUES
(1, 1, 'confirmado', 199800.00, 'Pedido para evento de fin de semana'),
(2, 2, 'enviado',    289800.00, 'Entregar en horario de la tarde'),
(3, 3, 'pendiente',  219800.00, 'Confirmar disponibilidad antes de despacho');

-- 7. DETALLE_PEDIDO
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unit) VALUES
-- Pedido 1 (Laura)
(1,  2, 1,  89900.00),   -- Blusa Blanca Elegante
(1, 10, 1,  49900.00),   -- Cinturón Marrón
(1, 12, 1,  39900.00),   -- Aretes Dorados Minimalistas

-- Pedido 2 (Camila)
(2,  4, 1, 159900.00),   -- Tacones Nude Clásicos
(2,  8, 1, 109900.00),   -- Cartera Negra Crossbody
(2, 12, 1,  39900.00),   -- Aretes Dorados Minimalistas

-- Pedido 3 (Sofia)
(3,  1, 1, 129900.00),   -- Vestido Floral Midi
(3, 11, 1,  69900.00),   -- Gafas de Sol Cat Eye
(3, 10, 1,  49900.00);   -- Cinturón Marrón

-- 8. ENVIOS
INSERT INTO envios (pedido_id, metodo_envio_id, estado, numero_guia, fecha_despacho, fecha_entrega_est, fecha_entrega_real) VALUES
(1, 1, 'despachado',  'LCS001', '2026-03-05 09:30:00', '2026-03-10', NULL),
(2, 2, 'en_transito', 'LCS002', '2026-03-06 14:15:00', '2026-03-08', NULL),
(3, 3, 'preparando',  NULL,     NULL,                  '2026-03-08', NULL);

-- 9. PAGOS
INSERT INTO pagos (pedido_id, metodo, estado, monto, referencia_externa, ultimos_4_digitos, fecha_pago) VALUES
(1, 'tarjeta_credito',  'aprobado', 199800.00, 'PAY-LCS-1001', '4821', '2026-03-05 08:45:00'),
(2, 'transferencia',    'aprobado', 289800.00, 'PAY-LCS-1002', NULL,   '2026-03-06 12:10:00'),
(3, 'billetera_digital','pendiente',219800.00, 'PAY-LCS-1003', NULL,   NULL);

COMMIT;
