-- CreateEnum
CREATE TYPE "EnvioEstado" AS ENUM ('preparando', 'despachado', 'en_transito', 'entregado', 'devuelto');

-- CreateEnum
CREATE TYPE "PedidoEstado" AS ENUM ('pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado');

-- CreateEnum
CREATE TYPE "PagoMetodo" AS ENUM ('tarjeta_credito', 'tarjeta_debito', 'transferencia', 'efectivo', 'billetera_digital');

-- CreateEnum
CREATE TYPE "PagoEstado" AS ENUM ('pendiente', 'aprobado', 'rechazado', 'reembolsado');

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "descripcion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "descripcion" TEXT,
    "marca" VARCHAR(100),
    "sabor" VARCHAR(100),
    "presentacion" VARCHAR(100),
    "precio" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imagenUrl" VARCHAR(500),
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones_envio" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "alias" VARCHAR(50),
    "calle" VARCHAR(255) NOT NULL,
    "ciudad" VARCHAR(100) NOT NULL,
    "departamento" VARCHAR(100),
    "codigoPostal" VARCHAR(20),
    "pais" VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direcciones_envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_envio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "costoBase" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "diasEstimados" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "metodos_envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envios" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "metodoEnvioId" INTEGER NOT NULL,
    "estado" "EnvioEstado" NOT NULL DEFAULT 'preparando',
    "numeroGuia" VARCHAR(100),
    "fechaDespacho" TIMESTAMP(3),
    "fechaEntregaEst" DATE,
    "fechaEntregaReal" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "envios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "direccionEnvioId" INTEGER,
    "estado" "PedidoEstado" NOT NULL DEFAULT 'pendiente',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "costoEnvio" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_pedido" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnit" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "detalle_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "metodo" "PagoMetodo" NOT NULL,
    "estado" "PagoEstado" NOT NULL DEFAULT 'pendiente',
    "monto" DECIMAL(12,2) NOT NULL,
    "referenciaExterna" VARCHAR(200),
    "ultimos4Digitos" CHAR(4),
    "fechaPago" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "productos_slug_key" ON "productos"("slug");

-- CreateIndex
CREATE INDEX "productos_categoriaId_idx" ON "productos"("categoriaId");

-- CreateIndex
CREATE INDEX "productos_activo_idx" ON "productos"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE INDEX "direcciones_envio_clienteId_idx" ON "direcciones_envio"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_envio_nombre_key" ON "metodos_envio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "envios_pedidoId_key" ON "envios"("pedidoId");

-- CreateIndex
CREATE INDEX "pedidos_clienteId_idx" ON "pedidos"("clienteId");

-- CreateIndex
CREATE INDEX "pedidos_estado_idx" ON "pedidos"("estado");

-- CreateIndex
CREATE INDEX "detalle_pedido_pedidoId_idx" ON "detalle_pedido"("pedidoId");

-- CreateIndex
CREATE INDEX "detalle_pedido_productoId_idx" ON "detalle_pedido"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "detalle_pedido_pedidoId_productoId_key" ON "detalle_pedido"("pedidoId", "productoId");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_pedidoId_key" ON "pagos"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones_envio" ADD CONSTRAINT "direcciones_envio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_metodoEnvioId_fkey" FOREIGN KEY ("metodoEnvioId") REFERENCES "metodos_envio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_direccionEnvioId_fkey" FOREIGN KEY ("direccionEnvioId") REFERENCES "direcciones_envio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
