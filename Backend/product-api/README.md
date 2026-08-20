# Product API - ComandAPP

API REST para la gestión de productos, categorías, mesas, órdenes y usuarios del personal en un restaurante. Los clientes no tienen cuenta: acceden mediante el `accessToken` de cada mesa.

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js + Express 5 | Servidor HTTP y enrutado |
| Sequelize 6 + mysql2 | ORM y driver (MySQL / MariaDB) |
| jsonwebtoken | Autenticación JWT del personal |
| bcryptjs | Hash de contraseñas |
| multer | Subida de imágenes de productos (JPEG/PNG/WebP/GIF, máx. 5 MB) |
| dotenv | Variables de entorno |
| helmet / cors / morgan | Seguridad, CORS y logging HTTP |
| express-validator | Instalado pero **sin usar** (`src/middlewares/validator.js` está vacío) |

## Estructura del proyecto

```
Backend/product-api/
├── docs/                        # Documentación interna
├── uploads/                     # Imágenes subidas (gitignored; se sirve en /uploads)
└── src/
    ├── app.js                   # Express: middlewares globales + rutas bajo /capp
    ├── server.js                # Arranque: initDatabase → sync → seeds → listen
    ├── config/
    │   ├── database.js          # Conexión Sequelize
    │   └── initDatabase.js      # CREATE DATABASE IF NOT EXISTS
    ├── controllers/             # auth, category, client, order, product, tableRestaurant, user
    ├── middlewares/
    │   ├── authMiddleware.js    # Verifica JWT → req.user = { id, rol }
    │   ├── roleMiddleware.js    # Factory (...roles): 403 si el rol no está permitido
    │   ├── errorHandler.js      # Mapea errores a 400/409/500
    │   ├── uploadMiddleware.js  # Multer diskStorage + helpers de imágenes
    │   └── validator.js         # Stub vacío
    ├── models/
    │   ├── User.js              # "Usuario" → tabla usuarios
    │   ├── Category.js          # "Categoria" → tabla categorias
    │   ├── Product.js           # "Producto" → tabla productos
    │   ├── TableRestaurant.js   # "Mesa" → tabla mesas
    │   ├── Order.js             # "Pedido" → tabla ordenes
    │   ├── OrderItem.js         # "PedidoItem" → tabla ordenes_items
    │   └── associations.js      # Asociaciones con alias en español
    ├── routes/                  # auth, user, client, product, category, tableRestaurant, order
    └── services/                # Lógica de negocio por entidad
```

> **Nota:** `package.json` declara `"main": "index.js"`, pero ese archivo no existe. El punto de entrada real es `src/server.js`.

## Modelos principales

Los archivos usan nombre en inglés; el modelo Sequelize y la tabla, en español:

| Archivo | Modelo | Tabla | Campos clave |
|---|---|---|---|
| `User.js` | `Usuario` | `usuarios` | `nombre`, `correo` (único, email), `password` (hash bcrypt), `rol` ENUM(`administrador`,`cocina`), `estado` boolean |
| `Category.js` | `Categoria` | `categorias` | `nombre` único, `descripcion` |
| `Product.js` | `Producto` | `productos` | `tipo`, `nombre`, `precio` DECIMAL(10,2), `caracteristicas`, `imagen`, FK `categoryId` |
| `TableRestaurant.js` | `Mesa` | `mesas` | `numeroMesa` único, `mesero`, `estado` ENUM(`activo`,`inactivo`), `accessToken` único |
| `Order.js` | `Pedido` | `ordenes` | FK `tableRestaurantId`, `total` DECIMAL(10,2), `estado` ENUM(5 valores), `observaciones` |
| `OrderItem.js` | `PedidoItem` | `ordenes_items` | FKs `orderId` y `productId`, snapshot histórico `productName` + `precio`, `cantidad`, `subtotal` |

### Hooks

- `Mesa.beforeCreate`: genera `accessToken` aleatorio (`crypto.randomBytes(16).toString("hex")`) si no viene.
- `Order.beforeValidate`: recalcula `total` desde los `items` anidados (suma `precio × cantidad`). No enviar `total` al crear una orden con items.
- `OrderItem.beforeValidate`: calcula `subtotal = precio × cantidad`.

### Validaciones clave

- `Order.estado` solo puede ser: `pendiente`, `en preparación`, `listo para entrega`, `entregado`, `cancelado` (ENUM + validador `isIn`).
- `Order.total` ≥ 0.
- `OrderItem.cantidad` entero ≥ 1; `precio` y `subtotal` ≥ 0.
- `User.correo` formato email y único.
- `Category.nombre` y `TableRestaurant.numeroMesa` únicos.

## Relaciones (alias)

Registradas en `src/models/associations.js`. **Solo se activan si se hace `require` del archivo** (`server.js` lo hace; `app.js` no). Si cargas un modelo suelto, los `include` con alias no funcionarán.

| Asociación | Alias | FK |
|---|---|---|
| `Category.hasMany(Product)` | `productos` | `categoryId` |
| `Product.belongsTo(Category)` | `categoria` | `categoryId` |
| `TableRestaurant.hasMany(Order)` | `ordenes` | `tableRestaurantId` |
| `Order.belongsTo(TableRestaurant)` | `mesa` | `tableRestaurantId` |
| `Order.hasMany(OrderItem)` | `items` | `orderId` |
| `OrderItem.belongsTo(Order)` | `orden` | `orderId` |
| `Product.hasMany(OrderItem)` | `orderItems` | `productId` |
| `OrderItem.belongsTo(Product)` | `producto` | `productId` |

## Requisitos previos

- Node.js 18+ recomendado.
- MySQL o MariaDB en ejecución.
- Archivo `.env` configurado (hay `.env.example` como referencia):

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (defecto del proyecto: `3000`) |
| `DB_HOST` / `DB_PORT` | Host y puerto de MySQL |
| `DB_USER` / `DB_PASSWORD` | Credenciales de MySQL |
| `DB_NAME` | Nombre de la base (`restaurante`) |
| `JWT_SECRET` | Clave para firmar tokens JWT |
| `JWT_EXPIRES_IN` | Expiración del token (defecto: `8h`) |
| `BCRYPT_SALT_ROUNDS` | Rounds de bcrypt (defecto: `10`) |
| `ADMIN_PASSWORD` / `COCINA_PASSWORD` | Contraseñas iniciales de los usuarios seed |

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev     # nodemon src/server.js
npm start       # node src/server.js
```

La aplicación se ejecuta en el puerto definido en `.env` (`PORT`). No hay health check; para verificar que está vivo puedes llamar a un endpoint público como `GET /capp/pedido/mesas`.

## Inicialización de la base de datos (arranque)

Al iniciar el servidor (`src/server.js`) se ejecuta, en orden:

1. Registro de asociaciones (`models/associations`).
2. Creación de la base de datos si no existe (`src/config/initDatabase.js`). Si falla, el proceso termina.
3. Sincronización de tablas con `sequelize.sync({ alter: true })`. **No hay migraciones**: cambiar un modelo altera las tablas existentes al arrancar.
4. Seeds idempotentes de usuarios (solo se crean si el correo no existe):
   - `admin@comandapp.com` / `admin123` — rol `administrador`
   - `cocina@comandapp.com` / `cocina123` — rol `cocina`
   - Sobrescribibles con `ADMIN_PASSWORD` y `COCINA_PASSWORD`.
5. Backfill: asigna un `accessToken` aleatorio a cualquier mesa que no tenga uno.
6. `app.listen(PORT)`.

## Middlewares globales (`src/app.js`)

En orden: deshabilita `etag`, fuerza `Cache-Control: no-store`, sirve `/uploads` como estático (imágenes subidas, sin auth), `cors()` abierto, `helmet()`, `morgan("dev")` y `express.json()`. Al final monta `errorHandler`.

Manejo de errores (`errorHandler.js`):

- `MulterError` (archivo > 5 MB) → 400
- `SequelizeValidationError` → 400
- `SequelizeUniqueConstraintError` → 409
- `SequelizeForeignKeyConstraintError` → 400
- Genérico → `err.statusCode || err.status || 500`

Los servicios lanzan `Error` con `statusCode` adjunto para errores de negocio (patrón consistente).

## Autenticación y autorización

- **Personal:** login JWT vía `POST /capp/auth/login`; enviar el token en el header `Authorization: Bearer <token>`. `authMiddleware` lo verifica y setea `req.user = { id, rol }`; `roleMiddleware(...roles)` responde 403 si el rol no está permitido.
- **Roles:** `administrador` (acceso total) y `cocina` (lecturas + cambio de estado de órdenes).
- **Clientes:** sin JWT; usan el `accessToken` de la mesa en la URL (`/capp/pedido/:token`).

Regla general de las rutas protegidas: **lecturas** requieren admin o cocina; **escrituras** requieren admin.

## Rutas disponibles

Base global: `/capp`. Leyenda: 🔓 público · 🔒 admin+cocina · 👑 solo admin.

### Auth (`auth.routes.js`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/capp/auth/login` | 🔓 | Login del personal, devuelve `{ message, token, user }` |

Body:

```json
{
  "correo": "admin@comandapp.com",
  "password": "admin123"
}
```

Respuesta:

```json
{
  "message": "Login exitoso",
  "token": "JWT_TOKEN",
  "user": { "id": 1, "nombre": "Administrador", "correo": "...", "rol": "administrador" }
}
```

### Productos (`product.routes.js`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/capp/productos` | 🔒 | Todos los productos |
| GET | `/capp/productos/:id` | 🔒 | Un producto por id |
| POST | `/capp/productos/imagen` | 👑 | Sube imagen (multipart/form-data, campo `imagen`) → devuelve `{ url }` |
| POST | `/capp/productos` | 👑 | Crea producto |
| PUT | `/capp/productos/:id` | 👑 | Actualiza producto |
| DELETE | `/capp/productos/:id` | 👑 | Elimina producto (borra su imagen interna del disco si tenía) |

Body de creación:

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

### Categorías (`category.routes.js`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/capp/categorias` | 🔒 | Todas las categorías con sus productos |
| GET | `/capp/categorias/:id` | 🔒 | Una categoría con productos |
| GET | `/capp/categorias/:categoryId/productos` | 🔒 | Productos de una categoría |
| POST | `/capp/categorias` | 👑 | Crea categoría |
| POST | `/capp/categorias/:categoryId/productos` | 👑 | Crea producto dentro de una categoría |
| PUT | `/capp/categorias/:id` | 👑 | Actualiza categoría |
| DELETE | `/capp/categorias/:id` | 👑 | Elimina categoría |

> Las rutas anidadas usan el parámetro `:categoryId` (distinto de `:id`); Express 5 los resuelve porque son paths distintos.

Body de categoría:

```json
{ "nombre": "Bebidas", "descripcion": "Licores y refrescos" }
```

Body de producto dentro de categoría:

```json
{ "tipo": "bebida", "nombre": "Coca-Cola", "precio": 5.00, "caracteristicas": "Lata 355ml" }
```

### Mesas (`tableRestaurant.routes.js`)

Todo el router requiere JWT.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/capp/mesas` | 🔒 | Todas las mesas |
| GET | `/capp/mesas/:id` | 🔒 | Una mesa por id |
| POST | `/capp/mesas` | 👑 | Crea mesa (genera `accessToken` automáticamente) |
| PUT | `/capp/mesas/:id` | 👑 | Actualiza mesa (incluye `estado`: `activo`/`inactivo`) |
| POST | `/capp/mesas/:id/regenerar-token` | 👑 | Regenera el `accessToken` (invalida el QR anterior) |
| DELETE | `/capp/mesas/:id` | 👑 | Elimina mesa |

Body de creación:

```json
{ "numeroMesa": 5, "mesero": "Luis" }
```

El `accessToken` identifica a la mesa en las URLs públicas del cliente (`/pedido/:token`).

### Órdenes (`order.routes.js`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/capp/ordenes` | 🔒 | Órdenes con mesa e ítems |
| GET | `/capp/ordenes/:id` | 🔒 | Una orden completa |
| POST | `/capp/ordenes` | 🔒 | Crea orden (flujo interno/admin) |
| PUT | `/capp/ordenes/:id/estado` | 🔒 | Cambia el estado de la orden |
| PUT | `/capp/ordenes/:id` | 👑 | Actualiza otros campos |
| DELETE | `/capp/ordenes/:id` | 👑 | Elimina orden y sus ítems |

Estados válidos: `pendiente`, `en preparación`, `listo para entrega`, `entregado`, `cancelado`.

Body de creación:

```json
{
  "tableRestaurantId": 1,
  "observaciones": "Sin cebolla",
  "estado": "pendiente",
  "items": [
    { "productId": 10, "cantidad": 2 }
  ]
}
```

Body de cambio de estado:

```json
{ "estado": "en preparación" }
```

### Pedido — cliente público (`client.routes.js`)

Rutas públicas sin JWT, autenticadas por el token de la mesa.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/capp/pedido/mesas` | Mesas activas con su `accessToken` (para elegir mesa) |
| GET | `/capp/pedido/:token` | Resuelve la mesa por token (valida que exista y esté `activo`) |
| GET | `/capp/pedido/:token/menu` | Menú de categorías con productos |
| POST | `/capp/pedido/:token` | Crea pedido para la mesa |
| PUT | `/capp/pedido/:token/:orderId` | Edita un pedido propio (solo si su estado es `pendiente`) |
| GET | `/capp/pedido/:token/estado` | Último pedido (estado, total, observaciones, mesa) |
| GET | `/capp/pedido/:token/pedidos` | Historial de pedidos de la mesa |

Al crear/editar por token, el backend toma los precios reales desde la BD (ignora los enviados por el cliente) y fuerza `estado: "pendiente"`.

Body de creación/edición:

```json
{
  "observaciones": "Sin cebolla",
  "items": [
    { "productId": 10, "cantidad": 2 }
  ]
}
```

> **Nota de seguridad:** `GET /capp/pedido/mesas` expone públicamente los tokens de todas las mesas activas, y cualquiera con un token puede crear o editar pedidos en estado `pendiente`.

### Usuarios — admin (`user.routes.js`)

Todo el router requiere JWT + rol `administrador`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/capp/usuarios` | Lista usuarios (sin `password`) |
| GET | `/capp/usuarios/:id` | Un usuario |
| POST | `/capp/usuarios` | Crea usuario (hash bcrypt) |
| PUT | `/capp/usuarios/:id` | Actualiza usuario (hashea password si viene) |
| DELETE | `/capp/usuarios/:id` | Elimina usuario |

Roles internos: `administrador`, `cocina`. Los clientes no tienen cuenta.

## Servicios desarrollados

### Auth — `src/services/auth.service.js`

- `login(correo, password)`: valida credenciales contra el hash bcrypt.
- `generateToken(user)`: JWT con payload `{ id, rol }`, expira según `JWT_EXPIRES_IN` (defecto `8h`).
- `hashPassword(password)`
- `createUser(data)`: valida obligatorios (400) y correo duplicado (409).
- `seedUser(nombre, correo, password, rol)`: seed idempotente.

### Usuario — `src/services/user.service.js`

- `getAllUsers()`, `getUserById(id)`
- `updateUser(id, data)`: hashea password si viene; 404 si no existe.
- `deleteUser(id)`
- Todas las respuestas excluyen `password`.

### Producto — `src/services/product.service.js`

- `getAll()`, `getById(id)`, `create(data)`
- `update(id, data)`: borra la imagen anterior del disco si cambió.
- `remove(id)`: borra la imagen del disco.

### Categoría — `src/services/category.service.js`

- `getAll()` / `getById(id)`: incluyen productos.
- `create(data)`, `update(id, data)`, `remove(id)`
- `getProductsByCategory(categoryId)`: 404 si no existe la categoría.
- `createProduct(categoryId, data)`: valida tipo/nombre/precio (400).

### Mesa — `src/services/tableRestaurant.service.js`

- `getAllTables()`, `getActiveTables()`, `getTableById(id)`
- `getTableByToken(token)`, `generateAccessToken(id)`
- `getMenu()`: categorías con productos (menú público).
- `createTable(data)`, `updateTable(id, data)`, `deleteTable(id)`

### Pedido — `src/services/order.service.js`

- `getAllOrders()`, `getOrderById(id)`
- `createOrder(data)`: valida mesa e items, toma precios actuales de BD, crea `OrderItem` con snapshot (`productName`, `precio`) dentro de una transacción.
- `createOrderByToken(token, data)`: flujo cliente; 404 token inválido, 403 mesa inactiva, fuerza `estado: "pendiente"`, transacción.
- `updateOrderByToken(token, orderId, data)`: 403 si el pedido no está `pendiente`; destruye y recrea los items en transacción.
- `getLastOrderByToken(token)`, `getAllOrdersByToken(token)`
- `updateOrder(id, data)`, `deleteOrder(id)`

## Convenciones del proyecto

- CommonJS en todo el proyecto (`require` / `module.exports`).
- Nombres de archivo de modelos en inglés; modelo Sequelize y tabla en español.
- Alias de asociaciones en español (`as: "items"`, `as: "producto"`, `as: "mesa"`).
- `src/server.js` inicializa BD y sincroniza modelos; `src/app.js` monta rutas bajo `/capp`.
- Sin tests, linter ni formatter configurados. La verificación es manual contra una BD real.

## Ejecución de ejemplos

1. Login (la mayoría de escrituras requieren token):

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/capp/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@comandapp.com","password":"admin123"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")
```

2. Crear una mesa:

```bash
curl -X POST http://localhost:3000/capp/mesas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"numeroMesa": 1, "mesero": "Ana"}'
```

3. Crear una categoría:

```bash
curl -X POST http://localhost:3000/capp/categorias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nombre": "Entradas", "descripcion": "Platos de entrada"}'
```

4. Crear un producto:

```bash
curl -X POST http://localhost:3000/capp/productos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"tipo":"comida","nombre":"Nachos","precio":18.00,"categoryId":1}'
```

5. Crear una orden (interna):

```bash
curl -X POST http://localhost:3000/capp/ordenes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"tableRestaurantId":1,"observaciones":"Sin picante","estado":"pendiente","items":[{"productId":1,"cantidad":2}]}'
```

6. Flujo cliente público (sin token JWT):

```bash
# Mesas disponibles (devuelve sus accessToken)
curl http://localhost:3000/capp/pedido/mesas

# Menú para la mesa
curl http://localhost:3000/capp/pedido/<TOKEN_MESA>/menu

# Crear pedido desde la mesa
curl -X POST http://localhost:3000/capp/pedido/<TOKEN_MESA> \
  -H "Content-Type: application/json" \
  -d '{"observaciones":"Sin cebolla","items":[{"productId":1,"cantidad":2}]}'
```

## Contacto

Para dudas o mejoras, revisa la carpeta `src/` y los servicios de cada entidad.
