# IronFuel — Tienda de Suplementos Deportivos

E-commerce construido con **Express (arquitectura MVC con vistas EJS renderizadas en el servidor)** + **Prisma** + **PostgreSQL**, con tienda publica (catalogo, carrito y checkout) y un **panel de administracion** para gestionar el catalogo, las categorias y los pedidos. El entorno de base de datos corre en **Docker**.

> Este proyecto es una migracion de una version anterior construida en Astro SSR. La version Astro queda respaldada en el tag de git `backup-astro-pre-migracion-20261009` y en una copia completa en disco.

---

## Stack

| Capa | Tecnologia |
|---|---|
| Backend | Express 4 + TypeScript, arquitectura MVC (routes → controllers → models → views) |
| Vistas | EJS (renderizado en el servidor, formularios HTML con POST/redirect) |
| Estilos | Tailwind CSS 4 vía CDN (`@tailwindcss/browser`), sin paso de build |
| Base de datos | PostgreSQL 16 (Docker) |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth admin | JWT (`jsonwebtoken`) en cookie `httpOnly`, password con `bcryptjs` |
| Carrito | Cookie firmada (`cart`) con `{productoId: cantidad}`; precios y stock siempre se leen de la BD |

---

## Estructura del proyecto (monorepo con npm workspaces)

```
Next-Store/
├── docker-compose.yml        # Postgres + pgAdmin
├── package.json              # raiz: workspace ["server"], scripts delegados
├── .env                      # variables compartidas (DB, JWT, puerto)
└── server/                   # App Express (MVC)
    ├── prisma/
    │   ├── schema.prisma     # Modelo de datos (catalogo, pedidos, envios, pagos, admins)
    │   ├── seed.ts           # Datos de ejemplo
    │   └── migrations/
    └── src/
        ├── server.ts         # bootstrap (app.listen)
        ├── app.ts            # express(): motor EJS, cookies, body parser, rutas, errores
        ├── config/env.ts     # variables de entorno
        ├── lib/prisma.ts     # cliente Prisma (singleton)
        ├── models/           # M: acceso a datos por entidad (Prisma)
        ├── views/            # V: plantillas EJS (tienda, checkout, admin/*, partials/)
        ├── controllers/      # C: leen el request, llaman al model y renderizan/redirigen
        │   └── admin/        #    controllers del panel de administracion
        ├── routes/           # web.routes.ts (tienda) y admin.routes.ts (/admin/**)
        ├── middlewares/      # requireAdmin, flash, storeLocals, errorHandler
        └── utils/            # format (COP/slug), jwt, password, cart, flash, AppError
```

---

## Modelo de datos

Definido en [`server/prisma/schema.prisma`](server/prisma/schema.prisma). Resumen:

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
| `onDelete: Restrict` en `Producto` y `Categoria` | Protege el historial de pedidos. El panel admin, al intentar "Eliminar" un producto con pedidos asociados, lo **desactiva** en vez de borrarlo; una categoria con productos no se puede eliminar. |
| `onDelete: Cascade` en `DetallePedido`, `Envio`, `Pago` | Si se borra un pedido, sus lineas/envio/pago se eliminan con el. |
| Sesion de admin firmada con JWT | Cookie `httpOnly` (`admin_session`) verificada en el middleware `requireAdmin` del servidor. |

---

## Requisitos

- Node.js ≥ 22.12
- Docker Desktop (para Postgres + pgAdmin)

---

## Puesta en marcha

```bash
# 1. Instalar dependencias (npm workspaces)
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Ajusta JWT_SECRET y las credenciales si vas a desplegar en produccion

# 3. Levantar Postgres + pgAdmin
docker compose up -d

# 4. Aplicar el esquema (crea las tablas)
npm run db:migrate

# 5. Cargar datos de ejemplo (categorias, productos, cuenta admin, pedidos demo)
npm run db:seed

# 6. Iniciar el servidor Express (puerto 4000, con recarga automatica)
npm run dev
```

- Tienda: http://localhost:4000
- Panel admin: http://localhost:4000/admin/login
  - Credenciales por defecto (definidas en `.env`): `ADMIN_EMAIL` / `ADMIN_PASSWORD` → `admin@ironfuel.com` / `admin123`
- pgAdmin: http://localhost:5050 (`PGADMIN_EMAIL` / `PGADMIN_PASSWORD` del `.env`)
  - Host del servidor Postgres dentro de Docker: `postgres` (no `localhost`)

## Scripts disponibles (desde la raiz)

```bash
npm run dev           # Servidor Express (4000) con recarga automatica
npm run build          # Verifica los tipos de TypeScript
npm run db:migrate     # Crea/aplica migraciones de Prisma
npm run db:deploy      # Aplica migraciones en produccion (sin generar nuevas)
npm run db:seed        # Reinicia y vuelve a poblar la base con datos de ejemplo
npm run db:studio      # Abre Prisma Studio para explorar la base de datos
```

---

## Flujo de la tienda

1. **Catalogo** (`/productos`): filtro por categoria y busqueda por nombre/marca.
2. **Ficha de producto** (`/productos/:slug`): selector de cantidad y "Agregar al carrito".
3. **Carrito** (`/carrito`): se guarda en una cookie firmada, permite cambiar cantidades y quitar productos.
4. **Checkout** (`/checkout`): formulario de datos de contacto/envio + metodo de envio y de pago. Al confirmar, el servidor (`POST /checkout`):
   - Valida stock y precios reales desde la base de datos (nunca confia en el precio enviado por el cliente).
   - Crea/actualiza el **Cliente**, su **DireccionEnvio**, el **Pedido** con sus **DetallePedido**, el **Envio** y el **Pago** (estado `pendiente`) dentro de una transaccion.
   - Descuenta el stock de cada producto.
   - Redirige a la confirmacion del pedido, que solo puede ver quien lo hizo (cookie firmada).

No hay integracion real con una pasarela de pago: el pago queda registrado como `pendiente` para que el admin lo marque como `aprobado` desde el panel.

## Panel de administracion

Protegido por el middleware `requireAdmin` del servidor: cualquier ruta bajo `/admin/*` (salvo `/admin/login`) requiere una cookie JWT valida (`admin_session`); si no la hay, redirige al login.

- **Dashboard** (`/admin`): metricas rapidas (productos activos, stock bajo, pedidos pendientes, ventas totales) y ultimos pedidos.
- **Productos** (`/admin/productos`): alta, edicion y baja (baja segura: si el producto ya tiene pedidos, se desactiva en vez de borrarse).
- **Categorias** (`/admin/categorias`): alta, edicion y baja.
- **Pedidos** (`/admin/pedidos`): listado filtrable por estado y detalle con actualizacion de estado del pedido, del envio (incluye numero de guia) y del pago.

Para crear administradores adicionales, usa `npm run db:studio` y agrega un registro en la tabla `Admin` con el password hasheado (`bcryptjs`), o reutiliza `hashPassword` de `server/src/utils/password.ts` en un script propio.

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
