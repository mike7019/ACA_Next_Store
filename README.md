# IronFuel — Tienda de Suplementos Deportivos

E-commerce construido en **Astro** (SSR) + **Prisma** + **PostgreSQL**, con tienda publica (catalogo, carrito y checkout) y un **panel de administracion** para gestionar el catalogo, las categorias y los pedidos. El entorno de base de datos corre en **Docker**.

---

## Stack

| Capa | Tecnologia |
|---|---|
| Framework | Astro 7 (output `server`, adapter `@astrojs/node`) |
| Estilos | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Base de datos | PostgreSQL 16 (Docker) |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth admin | Sesion propia: cookie firmada (HMAC) + password con `bcryptjs` |
| Carrito | `localStorage` en el cliente (sin backend hasta el checkout) |

---

## Estructura del proyecto

```
Next-Store/
├── docker-compose.yml        # Postgres + pgAdmin
├── prisma/
│   ├── schema.prisma         # Modelo de datos (catalogo, pedidos, envios, pagos, admins)
│   ├── seed.ts                # Datos de ejemplo (categorias, productos, pedidos demo)
│   └── migrations/
├── src/
│   ├── lib/
│   │   ├── prisma.ts          # Cliente Prisma (singleton)
│   │   ├── auth.ts            # Hash de password + firma/verificacion de sesion
│   │   ├── cart-client.ts     # Carrito en localStorage (solo cliente)
│   │   └── format.ts          # Formato de moneda COP y slugify
│   ├── middleware.ts          # Protege /admin/* con la cookie de sesion
│   ├── layouts/                # Layout publico y layout del admin
│   ├── components/             # Header, Footer, ProductCard, Sidebar admin
│   └── pages/
│       ├── index.astro                     # Home
│       ├── productos/                      # Catalogo + ficha de producto
│       ├── carrito.astro                   # Carrito (client-side)
│       ├── checkout.astro                  # Checkout (crea pedido/envio/pago)
│       ├── checkout/confirmacion/[id].astro
│       └── admin/
│           ├── login.astro / logout.ts
│           ├── index.astro                 # Dashboard
│           ├── productos/                  # CRUD de productos
│           ├── categorias/                 # CRUD de categorias
│           └── pedidos/                    # Listado + cambio de estado
```

---

## Modelo de datos

Definido en [`prisma/schema.prisma`](prisma/schema.prisma). Resumen:

- **Categoria** → tiene muchos **Producto** (con `marca`, `sabor`, `presentacion`, `precio`, `stock`, `destacado`).
- **Cliente** → tiene muchas **DireccionEnvio** y muchos **Pedido**.
- **Pedido** → tiene muchos **DetallePedido**, un **Envio** (1 a 1) y un **Pago** (1 a 1).
- **MetodoEnvio** → usado por muchos **Envio**.
- **Admin** → cuenta del panel de administracion (no se expone en la tienda publica).

Enums: `PedidoEstado`, `EnvioEstado`, `PagoMetodo`, `PagoEstado` (mismos estados que un flujo de e-commerce tradicional: pendiente → confirmado → en preparacion → enviado → entregado / cancelado).

Decisiones heredadas del diseño original:

| Decision | Justificacion |
|---|---|
| `precioUnit` y `subtotal` en `DetallePedido` | Se calculan en la app al crear el pedido con el precio vigente; si el precio del producto cambia despues, el historico no se altera. |
| `onDelete: Restrict` en `Producto` y `Categoria` | Protege el historial de pedidos. El panel admin, al intentar "Eliminar" un producto con pedidos asociados, lo **desactiva** en vez de borrarlo. |
| `onDelete: Cascade` en `DetallePedido`, `Envio`, `Pago` | Si se borra un pedido, sus lineas/envio/pago se eliminan con el. |
| Sesion de admin firmada con HMAC (sin JWT libs) | Cookie `httpOnly` con payload + firma `crypto.createHmac`, verificada en `src/middleware.ts`. Sin dependencias externas de auth. |

---

## Requisitos

- Node.js ≥ 22.12
- Docker Desktop (para Postgres + pgAdmin)

---

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Ajusta SESSION_SECRET y las credenciales si vas a desplegar en produccion

# 3. Levantar Postgres + pgAdmin
docker compose up -d

# 4. Aplicar el esquema (crea las tablas)
npm run db:migrate

# 5. Cargar datos de ejemplo (categorias, productos, cuenta admin, pedidos demo)
npm run db:seed

# 6. Iniciar el servidor de desarrollo
npm run dev
```

- Tienda: http://localhost:4321
- Panel admin: http://localhost:4321/admin/login
  - Credenciales por defecto (definidas en `.env`): `ADMIN_EMAIL` / `ADMIN_PASSWORD` → `admin@ironfuel.com` / `admin123`
- pgAdmin: http://localhost:5050 (`PGADMIN_EMAIL` / `PGADMIN_PASSWORD` del `.env`)
  - Host del servidor Postgres dentro de Docker: `postgres` (no `localhost`)

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build         # Build de produccion
npm run preview       # Sirve el build de produccion
npm run db:migrate    # Crea/aplica migraciones de Prisma
npm run db:deploy     # Aplica migraciones en produccion (sin generar nuevas)
npm run db:seed       # Reinicia y vuelve a poblar la base con datos de ejemplo
npm run db:studio     # Abre Prisma Studio para explorar la base de datos
```

---

## Flujo de la tienda

1. **Catalogo** (`/productos`): filtro por categoria y busqueda por nombre/marca.
2. **Ficha de producto** (`/productos/[slug]`): selector de cantidad y "Agregar al carrito".
3. **Carrito** (`/carrito`): se guarda en `localStorage`, permite cambiar cantidades y quitar productos.
4. **Checkout** (`/checkout`): formulario de datos de contacto/envio + metodo de envio y de pago. Al confirmar, el servidor:
   - Valida stock y precios reales desde la base de datos (nunca confia en el precio enviado por el cliente).
   - Crea/actualiza el **Cliente**, su **DireccionEnvio**, el **Pedido** con sus **DetallePedido**, el **Envio** y el **Pago** (estado `pendiente`) dentro de una transaccion.
   - Descuenta el stock de cada producto.
   - Redirige a la confirmacion del pedido.

No hay integracion real con una pasarela de pago: el pago queda registrado como `pendiente` para que el admin lo marque como `aprobado` desde el panel.

## Panel de administracion

Protegido por `src/middleware.ts`: cualquier ruta bajo `/admin` requiere una sesion valida (cookie `admin_session`), excepto `/admin/login`.

- **Dashboard** (`/admin`): metricas rapidas (productos activos, stock bajo, pedidos pendientes, ventas totales) y ultimos pedidos.
- **Productos** (`/admin/productos`): alta, edicion y baja (baja segura: si el producto ya tiene pedidos, se desactiva en vez de borrarse).
- **Categorias** (`/admin/categorias`): alta, edicion y baja.
- **Pedidos** (`/admin/pedidos`): listado filtrable por estado y detalle con actualizacion de estado del pedido, del envio (incluye numero de guia) y del pago.

Para crear administradores adicionales, usa `npm run db:studio` y agrega un registro en la tabla `Admin` con el password hasheado (`bcryptjs`), o agrega un script propio reutilizando `hashPassword` de `src/lib/auth.ts`.

---

## Entorno Docker

| Servicio | Imagen | Puerto | Descripcion |
|---|---|---|---|
| postgres | postgres:16-alpine | 5432 | Base de datos |
| pgadmin | dpage/pgadmin4:latest | 5050 | Interfaz grafica de administracion de la BD |

```bash
docker compose up -d       # Levantar en segundo plano
docker compose logs -f     # Ver logs
docker compose down        # Detener (conserva los datos)
docker compose down -v     # Detener y borrar todos los datos
```

---

## Proximos pasos sugeridos

- Integrar una pasarela de pago real (Wompi, PayU, Stripe) en lugar del pago simulado.
- Notificaciones por correo al cliente cuando cambia el estado del pedido.
- Paginacion en el catalogo y en el listado de pedidos del admin.
- Subida de imagenes de producto (hoy se guarda una URL) a un storage tipo S3/Cloudinary.
