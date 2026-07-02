-- ============================================================
--  CONSULTAS DE EJEMPLO
--  Lorena's Clothing Store
-- ============================================================

-- 1. Ver todos los pedidos con información del cliente
SELECT
    p.id                          AS pedido_id,
    c.nombre || ' ' || c.apellido AS cliente,
    p.estado,
    p.total,
    p.creado_en
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.id
ORDER BY p.creado_en DESC;

-- ============================================================

-- 2. Ver el detalle de productos comprados en cada pedido
SELECT
    p.id        AS pedido_id,
    pr.nombre   AS producto,
    dp.cantidad,
    dp.precio_unit,
    dp.subtotal
FROM detalle_pedido dp
JOIN pedidos  p  ON dp.pedido_id  = p.id
JOIN productos pr ON dp.producto_id = pr.id
ORDER BY p.id, pr.nombre;

-- ============================================================

-- 3. Ver estado de envío y pago de cada pedido
SELECT
    p.id                          AS pedido_id,
    c.nombre || ' ' || c.apellido AS cliente,
    e.estado                      AS estado_envio,
    pg.estado                     AS estado_pago,
    pg.metodo                     AS metodo_pago,
    e.numero_guia
FROM pedidos p
JOIN clientes c  ON p.cliente_id  = c.id
LEFT JOIN envios e  ON e.pedido_id  = p.id
LEFT JOIN pagos  pg ON pg.pedido_id = p.id
ORDER BY p.id;
