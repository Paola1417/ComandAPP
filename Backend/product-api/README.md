# Product API - ComandAPP

API REST para la gestión de productos, categorías, mesas y pedidos en un restaurante.

## Tecnologías

- Node.js
- Express
- Sequelize
- MySQL / MariaDB
- dotenv
- helmet
- morgan
- cors

## Descripción

Esta API expone funcionalidades para:

- Crear, leer, actualizar y eliminar productos.
- Crear, leer, actualizar y eliminar categorías.
- Crear productos asociados a una categoría.
- Crear, leer, actualizar y eliminar mesas de restaurante.
- Registrar pedidos con relación a una mesa y productos.
- Almacenar en cada pedido el precio histórico del producto y la cantidad solicitada.

## Estructura de datos y arquitectura

### Modelos principales

- `Product` (`Producto`): representa los productos disponibles.
- `Category` (`Categoria`): agrupa productos por categorías.
- `TableRestaurant` (`Mesa`): representa las mesas del restaurante.
- `Order` (`Pedido`): representa la orden realizada por una mesa.
- `OrderItem` (`PedidoItem`): representa cada producto de una orden, con precio y cantidad.

### Relaciones

- `Category` tiene muchos `Product`.
- `Product` pertenece a `Category`.
- `TableRestaurant` tiene muchas `Order`.
- `Order` pertenece a `TableRestaurant`.
- `Order` tiene muchos `OrderItem`.
- `OrderItem` pertenece a `Order`.
- `Product` tiene muchos `OrderItem`.
- `OrderItem` pertenece a `Product`.

### Validaciones clave

- `Order.estado` solo puede ser:
  - `pendiente`
  - `en preparación`
  - `listo para entrega`
  - `entregado`
  - `cancelado`
- `OrderItem.cantidad` debe ser entero mayor o igual a 1.
- `OrderItem.precio` y `OrderItem.subtotal` deben ser valores no negativos.
- `Order.tableRestaurantId` debe existir.
- Los productos incluidos en la orden deben existir.

## Requisitos previos

- Node.js 18+ recomendado.
- MySQL o MariaDB en ejecución.
- Archivo `.env` configurado con:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `PORT`
  - `JWT_SECRET` (clave secreta para firmar tokens)
  - `JWT_EXPIRES_IN` (defecto: `8h`)
  - `BCRYPT_SALT_ROUNDS` (defecto: `10`)
  - `ADMIN_PASSWORD` / `COCINA_PASSWORD` (contraseñas iniciales de los usuarios seed)

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

La aplicación se ejecuta en el puerto definido en `.env`.

## Inicialización de la base de datos

Al iniciar el servidor, el proyecto realiza:

1. Creación de la base de datos si no existe (`src/config/initDatabase.js`).
2. Sincronización de tablas con Sequelize (`sequelize.sync({ alter: true })`).

## Rutas disponibles

La base de rutas es `/:appname`, donde `appname` es `capp`.

### Productos

Base: `/capp/productos`

- `GET /capp/productos`
  - Obtiene todos los productos.

- `GET /capp/productos/:id`
  - Obtiene un producto por su id.

- `POST /capp/productos`
  - Crea un producto.
  - Body ejemplo:

```json
{
  "tipo": "comida",
  "nombre": "Hamburguesa doble",
  "precio": 25.50,
  "caracteristicas": "Con queso y tocino",
  "imagen": "https://.../hamburguesa.jpg",
  "categoryId": 1
}
```

- `PUT /capp/productos/:id`
  - Actualiza un producto.
  - Body ejemplo:

```json
{
  "precio": 27.00,
  "caracteristicas": "Con doble queso"
}
```

- `DELETE /capp/productos/:id`
  - Elimina un producto.

### Categorías

Base: `/capp/categorias`

- `GET /capp/categorias`
  - Obtiene todas las categorías con sus productos.

- `GET /capp/categorias/:id`
  - Obtiene una categoría por id, incluyendo productos.

- `POST /capp/categorias`
  - Crea una categoría.
  - Body ejemplo:

```json
{
  "nombre": "Bebidas",
  "descripcion": "Licores y refrescos"
}
```

- `PUT /capp/categorias/:id`
  - Actualiza una categoría.

- `DELETE /capp/categorias/:id`
  - Elimina una categoría.

- `GET /capp/categorias/:categoryId/productos`
  - Obtiene los productos de una categoría específica.

- `POST /capp/categorias/:categoryId/productos`
  - Crea un producto dentro de una categoría.
  - Body ejemplo:

```json
{
  "tipo": "bebida",
  "nombre": "Coca-Cola",
  "precio": 5.00,
  "caracteristicas": "Lata 355ml"
}
```

### Mesas

Base: `/capp/mesas`

- `GET /capp/mesas`
  - Obtiene todas las mesas.

- `GET /capp/mesas/:id`
  - Obtiene una mesa por id.

- `POST /capp/mesas`
  - Crea una mesa.
  - Body ejemplo:

```json
{
  "numeroMesa": 5,
  "mesero": "Luis"
}
```

- `PUT /capp/mesas/:id`
  - Actualiza una mesa (requiere admin). Incluye `estado` (`activo`/`inactivo`).

- `POST /capp/mesas/:id/regenerar-token`
  - Regenera el `accessToken` de una mesa (requiere admin). Útil para invalidar un QR anterior.

- `DELETE /capp/mesas/:id`
  - Elimina una mesa (requiere admin).

Cada mesa genera automáticamente un `accessToken` único (aleatorio) al crearse. Este token identifica a la mesa en las URLs públicas del cliente (`/pedido/:token`).

### Órdenes

Base: `/capp/ordenes`

- `GET /capp/ordenes`
  - Obtiene todas las órdenes con sus mesas, ítems y datos de producto.

- `GET /capp/ordenes/:id`
  - Obtiene una orden por id con sus ítems.

- `POST /capp/ordenes`
  - Crea una orden (requiere auth: admin/cocina o uso interno).
  - Body recomendado:

```json
{
  "tableRestaurantId": 1,
  "observaciones": "Sin cebolla",
  "estado": "pendiente",
  "items": [
    {
      "productId": 10,
      "cantidad": 2
    }
  ]
}
```

- `PUT /capp/ordenes/:id/estado`
  - Cambia el estado de una orden (requiere auth: admin/cocina).
  - Body ejemplo:

```json
{
  "estado": "en preparación"
}
```

Estados válidos: `pendiente`, `en preparación`, `listo para entrega`, `entregado`, `cancelado`.

- `PUT /capp/ordenes/:id`
  - Actualiza otros campos de la orden (requiere admin).

- `DELETE /capp/ordenes/:id`
  - Elimina una orden y sus ítems (requiere admin).

### Autenticación y autorización (personal)

Base: `/capp/auth` y `/capp/usuarios`

- `POST /capp/auth/login`
  - Inicia sesión de personal.
  - Body:

```json
{
  "correo": "admin@comandapp.com",
  "password": "admin123"
}
```

- Respuesta:

```json
{
  "message": "Login exitoso",
  "token": "JWT_TOKEN",
  "user": { "id": 1, "nombre": "Administrador", "correo": "...", "rol": "administrador" }
}
```

- El token JWT se envía en el header `Authorization: Bearer <token>`.
- Middlewares: `authMiddleware` (verifica JWT, 401 si no/expirado) y `roleMiddleware(...roles)` (403 si el rol no está permitido).

### Rutas públicas (cliente)

Base: `/capp/pedido/:token`

- `GET /capp/pedido/:token` — resuelve la mesa por su `accessToken` (valida que exista y esté `activo`).
- `GET /capp/pedido/:token/menu` — menú de categorías/con productos para la mesa.
- `POST /capp/pedido/:token` — crea un pedido asociado a la mesa. El backend toma los precios reales desde la BD, ignora precios enviados por el cliente y deja el estado en `pendiente`. Body:

```json
{
  "observaciones": "Sin cebolla",
  "items": [
    { "productId": 10, "cantidad": 2 }
  ]
}
```

- `GET /capp/pedido/:token/estado` — consulta el último pedido (estado, total, observaciones, mesa).
- `GET /capp/pedido/:token/pedidos` — historial de pedidos de la mesa.

Los clientes **no** usan JWT: acceden mediante el `accessToken` de la mesa (identificador aleatorio no predecible). Estas rutas no requieren login, pero sí validan correctamente el token de la mesa.

### Usuarios (admin)

Base: `/capp/usuarios` — requiere auth (admin).

- `GET /capp/usuarios`, `GET /capp/usuarios/:id`
- `POST /capp/usuarios` — crea usuario (password hasheado con bcryptjs).
- `PUT /capp/usuarios/:id`, `DELETE /capp/usuarios/:id`

Roles internos: `administrador`, `cocina`. Los clientes no tienen cuenta; acceden por URL de mesa.

### Usuarios de prueba (seed)

Al iniciar el servidor se crean (si no existen):

- `admin@comandapp.com` / `admin123` — rol `administrador`
- `cocina@comandapp.com` / `cocina123` — rol `cocina`

Las contraseñas se pueden sobreescribir con `ADMIN_PASSWORD` y `COCINA_PASSWORD` en `.env`.

## Comportamiento del servicio de pedidos

El servicio de pedidos implementado en `src/services/Order.service.js` realiza lo siguiente:

- Valida que la mesa exista antes de crear la orden.
- Valida que el arreglo `items` sea válido y no esté vacío.
- Busca los productos relacionados a partir de `productId`.
- Rechaza la creación si algún producto no existe.
- Toma el precio actual de `Product.precio`.
- Crea registros de `OrderItem` con:
  - `productId`
  - `productName`
  - `cantidad`
  - `precio`
- Genera la orden dentro de una transacción para mantener integridad.

## Servicios desarrollados

### Producto

Implementado en `src/services/product.service.js`:

- `getAll()`: obtiene todos los productos.
- `getById(id)`: obtiene un producto por id.
- `create(data)`: crea un producto.
- `update(id, data)`: actualiza un producto existente.
- `remove(id)`: elimina un producto.

### Categoría

Implementado en `src/services/category.service.js`:

- `getAll()`: obtiene todas las categorías con sus productos.
- `getById(id)`: obtiene una categoría por id.
- `create(data)`: crea una categoría.
- `update(id, data)`: actualiza una categoría.
- `remove(id)`: elimina una categoría.
- `getProductsByCategory(categoryId)`: obtiene productos por categoría.
- `createProduct(categoryId, data)`: crea un producto vinculado a una categoría.

### Mesa de restaurante

Implementado en `src/services/tableRestaurant.service.js`:

- `getAllTables()`: obtiene todas las mesas.
- `getTableById(id)`: obtiene una mesa por id.
- `createTable(data)`: crea una mesa.
- `updateTable(id, data)`: actualiza una mesa.
- `deleteTable(id)`: elimina una mesa.

### Pedido

Implementado en `src/services/Order.service.js`:

- `getAllOrders()`: obtiene todas las órdenes con mesa e ítems.
- `getOrderById(id)`: obtiene una orden completa por id.
- `createOrder(data)`: crea una orden validando mesa y productos, y guarda ítems históricos.
- `updateOrder(id, data)`: actualiza datos de la orden.
- `deleteOrder(id)`: elimina una orden.

## Notas de buenas prácticas implementadas

- Normalización de datos con entidad intermedia `OrderItem`.
- Preservación de historial de productos en pedidos mediante `productName` y `precio` en cada ítem.
- Integridad referencial mediante claves foráneas.
- Validación de datos antes de guardar la orden.
- Uso de transacciones en creación de órdenes para mantener coherencia.
- Documentación clara de rutas y ejemplos de uso.

## Convenciones del proyecto

- Se utiliza CommonJS (`require` / `module.exports`).
- El archivo `src/server.js` inicializa la base de datos y sincroniza los modelos.
- El archivo `src/app.js` monta las rutas con prefijo `/capp`.

## Ejecución de ejemplos

1. Crear una mesa:

```bash
curl -X POST http://localhost:3000/capp/mesas \
  -H "Content-Type: application/json" \
  -d '{"numeroMesa": 1, "mesero": "Ana"}'
```

2. Crear una categoría:

```bash
curl -X POST http://localhost:3000/capp/categorias \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Entradas", "descripcion": "Platos de entrada"}'
```

3. Crear un producto:

```bash
curl -X POST http://localhost:3000/capp/productos \
  -H "Content-Type: application/json" \
  -d '{"tipo":"comida","nombre":"Nachos","precio":18.00,"categoryId":1}'
```

4. Crear una orden:

```bash
curl -X POST http://localhost:3000/capp/ordenes \
  -H "Content-Type: application/json" \
  -d '{"tableRestaurantId":1,"observaciones":"Sin picante","estado":"pendiente","items":[{"productId":1,"cantidad":2}]}'
```

## Contacto

Para dudas o mejoras, revisa la carpeta `src/` y los servicios de cada entidad.
