-- ============================================================
--  E-COMMERCE DATABASE SCHEMA
--  PostgreSQL
-- ============================================================

-- ============================================================
--  0. CREACION DE BASE DE DATOS
-- ============================================================
CREATE DATABASE tienda_online;

-- ============================================================
--  1. CATEGORIAS
--     Clasifica los productos
-- ============================================================
CREATE TABLE categorias (
    id          SERIAL          PRIMARY KEY,
    nombre      VARCHAR(100)    NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en   TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
--  2. PRODUCTOS
--     Almacena nombre, descripción, precio y stock
-- ============================================================
CREATE TABLE productos (
    id           SERIAL           PRIMARY KEY,
    categoria_id INT              NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nombre       VARCHAR(200)     NOT NULL,
    descripcion  TEXT,
    precio       NUMERIC(10, 2)   NOT NULL CHECK (precio >= 0),
    stock        INT              NOT NULL DEFAULT 0 CHECK (stock >= 0),
    activo       BOOLEAN          NOT NULL DEFAULT TRUE,
    creado_en    TIMESTAMP        NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ============================================================
--  3. CLIENTES
--     Guarda datos de los compradores
-- ============================================================
CREATE TABLE clientes (
    id             SERIAL        PRIMARY KEY,
    nombre         VARCHAR(100)  NOT NULL,
    apellido       VARCHAR(100)  NOT NULL,
    email          VARCHAR(255)  NOT NULL UNIQUE,
    direccion      VARCHAR(100)  NOT NULL,
    telefono       VARCHAR(20),
    fecha_registro TIMESTAMP     NOT NULL DEFAULT NOW(),
    activo         BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ============================================================
--  4. DIRECCIONES_ENVIO
--     Un cliente puede tener una o varias direcciones
-- ============================================================
CREATE TABLE direcciones_envio (
    id           SERIAL        PRIMARY KEY,
    cliente_id   INT           NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    alias        VARCHAR(50),                    -- ej. "Casa", "Trabajo"
    calle        VARCHAR(255)  NOT NULL,
    ciudad       VARCHAR(100)  NOT NULL,
    departamento VARCHAR(100),
    codigo_postal VARCHAR(20),
    pais         VARCHAR(100)  NOT NULL DEFAULT 'Colombia',
    es_principal BOOLEAN       NOT NULL DEFAULT FALSE,
    creado_en    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  5. METODOS_ENVIO
--     Define opciones de transporte
-- ============================================================
CREATE TABLE metodos_envio (
    id            SERIAL          PRIMARY KEY,
    nombre        VARCHAR(100)    NOT NULL UNIQUE,   -- ej. "Servientrega", "Coordinadora"
    descripcion   TEXT,
    costo_base    NUMERIC(10, 2)  NOT NULL DEFAULT 0 CHECK (costo_base >= 0),
    dias_estimados INT,
    activo        BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ============================================================
--  6. PEDIDOS
--     Registra cada compra realizada
-- ============================================================
CREATE TYPE pedido_estado AS ENUM (
    'pendiente',
    'confirmado',
    'en_preparacion',
    'enviado',
    'entregado',
    'cancelado'
);

CREATE TABLE pedidos (
    id                  SERIAL          PRIMARY KEY,
    cliente_id          INT             NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    direccion_envio_id  INT             REFERENCES direcciones_envio(id) ON DELETE SET NULL,
    estado              pedido_estado   NOT NULL DEFAULT 'pendiente',
    total               NUMERIC(12, 2)  NOT NULL CHECK (total >= 0),
    notas               TEXT,
    creado_en           TIMESTAMP       NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
--  7. DETALLE_PEDIDO
--     Guarda los productos incluidos en cada pedido
-- ============================================================
CREATE TABLE detalle_pedido (
    id           SERIAL          PRIMARY KEY,
    pedido_id    INT             NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id  INT             NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad     INT             NOT NULL CHECK (cantidad > 0),
    precio_unit  NUMERIC(10, 2)  NOT NULL CHECK (precio_unit >= 0),  -- precio al momento de compra
    subtotal     NUMERIC(12, 2)  GENERATED ALWAYS AS (cantidad * precio_unit) STORED,
    UNIQUE (pedido_id, producto_id)
);

-- ============================================================
--  8. ENVIOS
--     Registra el estado del envío de cada pedido
-- ============================================================
CREATE TYPE envio_estado AS ENUM (
    'preparando',
    'despachado',
    'en_transito',
    'entregado',
    'devuelto'
);

CREATE TABLE envios (
    id                SERIAL        PRIMARY KEY,
    pedido_id         INT           NOT NULL UNIQUE REFERENCES pedidos(id) ON DELETE CASCADE,
    metodo_envio_id   INT           NOT NULL REFERENCES metodos_envio(id) ON DELETE RESTRICT,
    estado            envio_estado  NOT NULL DEFAULT 'preparando',
    numero_guia       VARCHAR(100),
    fecha_despacho    TIMESTAMP,
    fecha_entrega_est DATE,
    fecha_entrega_real TIMESTAMP,
    creado_en         TIMESTAMP     NOT NULL DEFAULT NOW(),
    actualizado_en    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  9. PAGOS
--     Almacena información del pago sin guardar datos sensibles
-- ============================================================
CREATE TYPE pago_estado AS ENUM (
    'pendiente',
    'aprobado',
    'rechazado',
    'reembolsado'
);

CREATE TYPE pago_metodo AS ENUM (
    'tarjeta_credito',
    'tarjeta_debito',
    'transferencia',
    'efectivo',
    'billetera_digital'
);

CREATE TABLE pagos (
    id                   SERIAL        PRIMARY KEY,
    pedido_id            INT           NOT NULL UNIQUE REFERENCES pedidos(id) ON DELETE CASCADE,
    metodo               pago_metodo   NOT NULL,
    estado               pago_estado   NOT NULL DEFAULT 'pendiente',
    monto                NUMERIC(12, 2) NOT NULL CHECK (monto >= 0),
    referencia_externa   VARCHAR(200),            -- ID de la pasarela de pago (ej. Wompi, PayU)
    ultimos_4_digitos    CHAR(4),                 -- Solo los últimos 4 dígitos (no dato sensible)
    fecha_pago           TIMESTAMP,
    creado_en            TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================
--  ÍNDICES — mejoran el rendimiento en consultas frecuentes
-- ============================================================
CREATE INDEX idx_productos_categoria    ON productos(categoria_id);
CREATE INDEX idx_direcciones_cliente    ON direcciones_envio(cliente_id);
CREATE INDEX idx_pedidos_cliente        ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado         ON pedidos(estado);
CREATE INDEX idx_detalle_pedido_pedido  ON detalle_pedido(pedido_id);
CREATE INDEX idx_detalle_pedido_producto ON detalle_pedido(producto_id);
CREATE INDEX idx_envios_pedido          ON envios(pedido_id);
CREATE INDEX idx_pagos_pedido           ON pagos(pedido_id);
