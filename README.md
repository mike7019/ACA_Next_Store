# Lorena's Clothing Store — Base de Datos E-commerce

Base de datos relacional diseñada en **PostgreSQL** para gestionar el ciclo completo de un e-commerce de moda: productos, clientes, pedidos, envios y pagos. El entorno de desarrollo corre completamente en **Docker** con PostgreSQL y pgAdmin.

---

## Estructura del Proyecto

```ini
ACA BD/
├── ecommerce_schema.sql   # Definicion de tablas, tipos ENUM e indices
├── ecommerce_data.sql     # Datos de ejemplo (Lorena's Clothing Store)
├── ecommerce_queries.sql  # Consultas SELECT de ejemplo
├── docker-compose.yml     # Servicios Docker (PostgreSQL + pgAdmin)
├── .env                   # Variables de entorno (credenciales)
└── README.md              # Este archivo
```

---

## Modelo de Datos

### Relaciones

- Una **categoria** tiene muchos **productos**
- Un __cliente__ puede tener muchas __direcciones_envio__
- Un **cliente** puede realizar muchos **pedidos**
- Un __pedido__ puede tener muchos __detalle_pedido__
- Un __producto__ puede aparecer en muchos __detalle_pedido__
- Un **pedido** tiene un **envio** (relacion 1-a-1)
- Un __metodo_envio__ puede usarse en muchos __envios__
- Un **pedido** tiene un **pago** (relacion 1-a-1)

---

### Tablas

#### categorias

Organiza los productos en grupos tematicos.

| Columna       | Tipo         | Descripcion                    |
|---------------|--------------|--------------------------------|
| id            | SERIAL PK    | Identificador unico            |
| nombre        | VARCHAR(100) | Nombre unico de la categoria   |
| descripcion   | TEXT         | Descripcion opcional           |
| creado_en     | TIMESTAMP    | Fecha de creacion (automatica) |

#### productos

Almacena el catalogo de articulos disponibles.

| Columna          | Tipo          | Descripcion                             |
|------------------|---------------|-----------------------------------------|
| id               | SERIAL PK     | Identificador unico                     |
| categoria_id     | INT FK        | Categoria a la que pertenece            |
| nombre           | VARCHAR(200)  | Nombre del producto                     |
| descripcion      | TEXT          | Descripcion detallada                   |
| precio           | NUMERIC(10,2) | Precio actual (>= 0)                    |
| stock            | INT           | Unidades disponibles (>= 0)             |
| activo           | BOOLEAN       | Si el producto esta visible             |
| creado_en        | TIMESTAMP     | Fecha de registro                       |
| actualizado_en   | TIMESTAMP     | Ultima actualizacion                    |

#### clientes

Contiene la informacion personal de los compradores.

| Columna          | Tipo         | Descripcion                      |
|------------------|--------------|----------------------------------|
| id               | SERIAL PK    | Identificador unico              |
| nombre           | VARCHAR(100) | Nombre del cliente               |
| apellido         | VARCHAR(100) | Apellido del cliente             |
| email            | VARCHAR(255) | Correo electronico unico         |
| telefono         | VARCHAR(20)  | Telefono de contacto             |
| fecha_registro   | TIMESTAMP    | Fecha de registro en el sistema  |
| activo           | BOOLEAN      | Si la cuenta esta activa         |

#### direcciones_envio

Un cliente puede registrar multiples direcciones de entrega.

| Columna         | Tipo         | Descripcion                               |
|-----------------|--------------|-------------------------------------------|
| id              | SERIAL PK    | Identificador unico                       |
| cliente_id      | INT FK       | Cliente dueno de la direccion             |
| alias           | VARCHAR(50)  | Etiqueta descriptiva (ej. "Casa")         |
| calle           | VARCHAR(255) | Direccion completa                        |
| ciudad          | VARCHAR(100) | Ciudad de entrega                         |
| departamento    | VARCHAR(100) | Departamento / Region                     |
| codigo_postal   | VARCHAR(20)  | Codigo postal                             |
| pais            | VARCHAR(100) | Pais (default: Colombia)                  |
| es_principal    | BOOLEAN      | Indica si es la direccion predeterminada  |

#### metodos_envio

Define las opciones de transporte disponibles.

| Columna          | Tipo          | Descripcion                    |
|------------------|---------------|--------------------------------|
| id               | SERIAL PK     | Identificador unico            |
| nombre           | VARCHAR(100)  | Nombre de la transportadora    |
| descripcion      | TEXT          | Descripcion del servicio       |
| costo_base       | NUMERIC(10,2) | Costo fijo del envio           |
| dias_estimados   | INT           | Dias habituales de entrega     |
| activo           | BOOLEAN       | Si el metodo esta disponible   |

#### pedidos

Registra cada compra realizada por un cliente.

| Columna              | Tipo           | Descripcion                               |
|----------------------|----------------|-------------------------------------------|
| id                   | SERIAL PK      | Identificador unico                       |
| cliente_id           | INT FK         | Cliente que realizo el pedido             |
| direccion_envio_id   | INT FK         | Direccion de entrega seleccionada         |
| estado               | pedido_estado  | Estado actual del pedido (ENUM)           |
| total                | NUMERIC(12,2)  | Monto total del pedido                    |
| notas                | TEXT           | Instrucciones adicionales                 |
| creado_en            | TIMESTAMP      | Fecha y hora de creacion                  |
| actualizado_en       | TIMESTAMP      | Ultima modificacion                       |

ENUM pedido_estado: pendiente -> confirmado -> en_preparacion -> enviado -> entregado / cancelado

#### detalle_pedido

Lineas de productos incluidas en cada pedido.

| Columna       | Tipo          | Descripcion                                 |
|---------------|---------------|---------------------------------------------|
| id            | SERIAL PK     | Identificador unico                         |
| pedido_id     | INT FK        | Pedido al que pertenece                     |
| producto_id   | INT FK        | Producto comprado                           |
| cantidad      | INT           | Unidades compradas (> 0)                    |
| precio_unit   | NUMERIC(10,2) | Precio unitario al momento de la compra     |
| subtotal      | NUMERIC(12,2) | Columna generada: cantidad x precio_unit    |

La restriccion UNIQUE(pedido_id, producto_id) evita duplicados en el mismo pedido.

#### envios

Registra el seguimiento del envio de un pedido (relacion 1-a-1).

| Columna               | Tipo          | Descripcion                             |
|-----------------------|---------------|-----------------------------------------|
| id                    | SERIAL PK     | Identificador unico                     |
| pedido_id             | INT FK UNIQUE | Pedido asociado (un pedido = un envio)  |
| metodo_envio_id       | INT FK        | Metodo de transporte utilizado          |
| estado                | envio_estado  | Estado actual del envio (ENUM)          |
| numero_guia           | VARCHAR(100)  | Numero de rastreo                       |
| fecha_despacho        | TIMESTAMP     | Cuando salio el paquete                 |
| fecha_entrega_est     | DATE          | Fecha estimada de entrega               |
| fecha_entrega_real    | TIMESTAMP     | Fecha real de entrega                   |

ENUM envio_estado: preparando -> despachado -> en_transito -> entregado / devuelto

#### pagos

Almacena informacion del pago sin guardar datos sensibles completos.

| Columna               | Tipo          | Descripcion                                      |
|-----------------------|---------------|--------------------------------------------------|
| id                    | SERIAL PK     | Identificador unico                              |
| pedido_id             | INT FK UNIQUE | Pedido asociado (un pedido = un pago)            |
| metodo                | pago_metodo   | Metodo de pago utilizado (ENUM)                  |
| estado                | pago_estado   | Estado de la transaccion (ENUM)                  |
| monto                 | NUMERIC(12,2) | Monto cobrado                                    |
| referencia_externa    | VARCHAR(200)  | ID de la pasarela de pago (Wompi, PayU, etc.)    |
| ultimos_4_digitos     | CHAR(4)       | Ultimos 4 digitos de tarjeta (no dato sensible)  |
| fecha_pago            | TIMESTAMP     | Fecha y hora en que se proceso el pago           |

ENUM pago_metodo: tarjeta_credito / tarjeta_debito / transferencia / efectivo / billetera_digital
ENUM pago_estado: pendiente -> aprobado / rechazado / reembolsado

---

## Entorno Docker

### Servicios

| Servicio   | Imagen                  | Puerto | Descripcion                        |
|------------|-------------------------|--------|------------------------------------|
| postgres   | postgres:16-alpine      | 5432   | Motor de base de datos PostgreSQL  |
| pgadmin    | dpage/pgadmin4:latest   | 5050   | Interfaz grafica de administracion |

### Variables de entorno (.env)

```sh
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=ecommerce
PGADMIN_EMAIL=admin@ecommerce.com
PGADMIN_PASSWORD=admin123
```

Modifica estas credenciales antes de usar en produccion. No subas el .env a repositorios publicos.

### Inicializacion automatica

ecommerce_schema.sql se monta en /docker-entrypoint-initdb.d/ y PostgreSQL lo ejecuta automaticamente la primera vez que se crea el volumen.

---

## Levantar el Proyecto

Requisito: Docker Desktop instalado y en ejecucion.

```bash
# Levantar los servicios en segundo plano
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f

# Detener los servicios (conserva los datos)
docker compose down

# Detener Y eliminar todos los datos
docker compose down -v
```

---

## Acceso a pgAdmin

1. Abre el navegador en: http://localhost:5050
2. Inicia sesion: admin@ecommerce.com / admin123
3. Agrega un nuevo servidor:

| Campo          | Valor       |
|----------------|-------------|
| Host/Address   | postgres    |
| Port           | 5432        |
| Database       | ecommerce   |
| Username       | admin       |
| Password       | admin123    |

IMPORTANTE: El hostname debe ser "postgres" (nombre del servicio Docker), NO localhost.

---

## Cargar los Datos de Ejemplo

Los datos representan Lorena's Clothing Store: 4 categorias, 12 productos, 3 clientes con pedidos, envios y pagos.

Desde la terminal:

```bash
docker exec -i ecommerce_db psql -U admin -d ecommerce < ecommerce_data.sql
```

Desde pgAdmin: abre el Query Tool sobre la base ecommerce, pega el contenido del archivo y ejecutalo.

---

## Consultas Disponibles (ecommerce_queries.sql)

### 1. Todos los pedidos con informacion del cliente

```sql
SELECT
    p.id                          AS pedido_id,
    c.nombre || ' ' || c.apellido AS cliente,
    p.estado,
    p.total,
    p.creado_en
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.id
ORDER BY p.creado_en DESC;
```

### 2. Detalle de productos por pedido

```sql
SELECT
    p.id        AS pedido_id,
    pr.nombre   AS producto,
    dp.cantidad,
    dp.precio_unit,
    dp.subtotal
FROM detalle_pedido dp
JOIN pedidos   p  ON dp.pedido_id   = p.id
JOIN productos pr ON dp.producto_id = pr.id
ORDER BY p.id, pr.nombre;
```

### 3. Estado de envio y pago por pedido

```sql
SELECT
    p.id                          AS pedido_id,
    c.nombre || ' ' || c.apellido AS cliente,
    e.estado                      AS estado_envio,
    pg.estado                     AS estado_pago,
    pg.metodo                     AS metodo_pago,
    e.numero_guia
FROM pedidos p
JOIN      clientes c  ON p.cliente_id  = c.id
LEFT JOIN envios   e  ON e.pedido_id   = p.id
LEFT JOIN pagos    pg ON pg.pedido_id  = p.id
ORDER BY p.id;
```

Se usan LEFT JOIN en envios y pagos para mostrar pedidos que aun no tienen envio o pago registrado.

---

## Decisiones de Diseno

| Decision | Justificacion |
|---|---|
| precio_unit en detalle_pedido | Guarda el precio al momento de la compra; si el precio cambia, el historico queda intacto. |
| subtotal como columna generada | Se calcula automaticamente (cantidad x precio_unit), eliminando inconsistencias. |
| UNIQUE en envios.pedido_id y pagos.pedido_id | Garantiza relacion 1-a-1: un pedido tiene maximo un envio y un pago. |
| ENUMs para estados | Impiden valores invalidos a nivel de base de datos. |
| ON DELETE CASCADE en detalle_pedido | Si se elimina un pedido, sus lineas se eliminan automaticamente. |
| ON DELETE RESTRICT en productos | Impide eliminar un producto ya comprado, preservando el historial. |
| Indices en FK y columnas de filtro | Mejoran el rendimiento en JOINs y busquedas frecuentes. |
| Sin datos sensibles en pagos | Solo ultimos 4 digitos y referencia de pasarela (buenas practicas PCI-DSS). |
