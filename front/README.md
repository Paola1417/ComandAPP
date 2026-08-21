# Frontend — Sistema Inteligente de Pedidos (ComandAPP)

Frontend en **React 19 + Vite 8** (JavaScript puro, sin TypeScript). Consume la API REST del backend (`Backend/product-api`). Tiene dos flujos:

- **Personal** (login JWT): POS de ventas, CRUD de menú, mesas, pedidos, cocina y reportes.
- **Cliente** (público, por token de mesa): selección de mesa y menú para pedir sin cuenta.

## Requisitos previos

| Requisito | Versión |
|---|---|
| Node.js | >= 18 |
| npm | >= 10 |
| Backend API | http://localhost:3000 |
| MySQL/MariaDB | localhost:3306 (DB: restaurante, user: root, pass: rodri) |

## Instalación

```bash
cd front
npm install
```

## Scripts disponibles

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve localmente la build |

---

## Cómo levantar el backend

1. Iniciar MySQL (Docker):
```bash
docker run --name mysql-restaurante -e MYSQL_ROOT_PASSWORD=rodri -e MYSQL_DATABASE=restaurante -p 3306:3306 -d mysql:8
```

2. Iniciar el backend:
```bash
cd Backend/product-api
npm run dev
```

El backend auto-crea la base de datos y tablas (`sequelize.sync({ alter: true })`), crea los usuarios seed y asigna tokens a las mesas.

3. Verificar endpoints:
```bash
curl http://localhost:3000/capp/pedido/mesas
```

---

## Configuración del entorno

`.env` en la raíz de `front/` (trackeado en git):
```env
VITE_API_URL=http://localhost:3000
VITE_PUBLIC_URL=http://localhost:5173
```

- `VITE_API_URL`: base de la API. La usan la instancia axios (`src/api/client.js`) y `fetchAllPedidosByToken` (fetch nativo).
- `VITE_PUBLIC_URL`: URL pública usada por la página **Mesas** para construir el enlace de acceso de cada mesa (`${VITE_PUBLIC_URL}/pedido/${accessToken}`), con fallback a `window.location.origin`.

> Vite solo expone variables con prefijo `VITE_`.

### Proxy de desarrollo (`vite.config.js`)

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/capp': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

---

## Arquitectura del proyecto

```
front/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/
│   │   ├── client.js            # Instancia axios: baseURL + interceptors (Bearer token)
│   │   ├── authApi.js           # login(correo, password)
│   │   └── orderApi.js          # ~28 funciones: órdenes, categorías, productos,
│   │                            #   mesas, usuarios y rutas públicas por token
│   ├── components/              # Reutilizables (+ .module.css)
│   │   ├── NavBar/              # Header global con links según rol
│   │   ├── ProtectedRoute/      # Guardia de rutas por sesión/rol (sin CSS module)
│   │   ├── MesaSelector/        # Dropdown de mesas (sincronizado con CartContext)
│   │   ├── ProductCard/         # Card de producto (modo editable para /menu)
│   │   ├── CartItem/            # Fila del carrito con controles −/+
│   │   ├── CartPanel/           # Panel lateral: carrito + mesa + confirmar
│   │   ├── CategoryFilter/      # Sidebar de categorías con iconos emoji
│   │   ├── FormModal/           # Modal genérico de formularios (CRUD, subida de archivos)
│   │   └── Modal/               # Modal de feedback (éxito/error)
│   ├── pages/
│   │   ├── Login/               # /login — login del personal
│   │   ├── Inicio/              # / — POS: catálogo + carrito (protegido)
│   │   ├── Menu/                # /menu — CRUD de categorías y productos (admin)
│   │   ├── Mesas/               # /mesas — CRUD de mesas + URLs de acceso (admin)
│   │   ├── Pedidos/             # /pedidos — historial y cambio de estado
│   │   ├── Kitchen/             # /cocina — panel de cocina
│   │   ├── Reportes/            # /reportes — estadísticas de ventas (admin)
│   │   ├── SeleccionMesa/       # /pedido — grid público de mesas
│   │   └── CustomerMenu/        # /pedido/:token — menú del cliente (público)
│   ├── hooks/
│   │   └── useApi.js            # Hook genérico: {data, loading, error, refetch}
│   ├── context/
│   │   ├── AuthContext.jsx      # Sesión JWT: user, token, login, logout
│   │   └── CartContext.jsx      # Carrito global del flujo interno
│   ├── styles/
│   │   └── globals.css          # Fuente Poppins + variables CSS + reset
│   ├── utils/
│   │   └── format.js            # formatCurrency, formatDate, formatOrderId, getCategoryIcon
│   ├── App.jsx                  # Rutas (react-router-dom v7)
│   └── main.jsx                 # Entry: BrowserRouter > AuthProvider > CartProvider > App
├── vite.config.js
├── .env
└── package.json
```

Cada componente/página tiene su `.module.css` al lado, excepto `ProtectedRoute`.

---

## Autenticación

### `AuthContext` (`src/context/AuthContext.jsx`)

Envuelto en `main.jsx` sobre toda la app.

| Miembro | Descripción |
|---|---|
| `user` | Objeto usuario o `null` (hidratado desde localStorage) |
| `token` | JWT o `null` |
| `loading` | `true` durante el montaje inicial |
| `isAuthenticated` | `!!token && !!user` |
| `rol` | `user?.rol \|\| null` (`administrador` / `cocina`) |
| `login(correo, password)` | Llama a la API, persiste sesión y devuelve el resultado |
| `logout()` | Limpia estado y localStorage |

Persistencia en `localStorage`:

| Clave | Contenido |
|---|---|
| `comandapp_token` | JWT |
| `comandapp_user` | JSON del usuario |

### Interceptor axios (`src/api/client.js`)

El request interceptor adjunta automáticamente `Authorization: Bearer <token>` leyendo `comandapp_token` de localStorage. El response interceptor solo loguea errores 404/500 (no redirige ni limpia sesión).

### `ProtectedRoute` (`src/components/ProtectedRoute`)

- Sin sesión → redirige a `/login` guardando la ruta de origen en `state.from`.
- Con sesión pero rol fuera de `roles` → redirige a `/`.
- Si pasa, renderiza `children`.

Usuarios seed de prueba (los crea el backend):

| Correo | Contraseña | Rol |
|---|---|---|
| `admin@comandapp.com` | `admin123` | administrador |
| `cocina@comandapp.com` | `cocina123` | cocina |

---

## Servicios API (`src/api/`)

### Cliente base — `client.js` (código real)

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/capp',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('comandapp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config.url);
    }
    if (error.response?.status === 500) {
      console.error('Server error:', error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
```

### `authApi.js`

| Función | Endpoint |
|---|---|
| `login(correo, password)` | `POST /auth/login` — la que usa `AuthContext` |

### Funciones — `orderApi.js`

Agrupadas por dominio. Las marcadas *(sin uso)* existen pero ninguna página las consume hoy.

**Lecturas (personal):**

| Función | Endpoint |
|---|---|
| `fetchCategories()` | `GET /categorias` |
| `fetchProducts()` | `GET /productos` *(sin uso)* |
| `fetchTables()` | `GET /mesas` |
| `fetchOrders()` | `GET /ordenes` |
| `fetchOrderById(id)` | `GET /ordenes/:id` *(sin uso)* |

**Órdenes:**

| Función | Endpoint |
|---|---|
| `createOrder(orderData)` | `POST /ordenes` |
| `updateOrderEstado(id, estado)` | `PUT /ordenes/:id/estado` |
| `updateOrder(id, data)` | `PUT /ordenes/:id` *(sin uso)* |
| `deleteOrder(id)` | `DELETE /ordenes/:id` |

**Categorías:**

| Función | Endpoint |
|---|---|
| `createCategory(data)` | `POST /categorias` |
| `createCategoryProduct(categoryId, data)` | `POST /categorias/:categoryId/productos` |
| `updateCategory(id, data)` | `PUT /categorias/:id` |
| `deleteCategory(id)` | `DELETE /categorias/:id` |

**Productos:**

| Función | Endpoint |
|---|---|
| `createProduct(data)` | `POST /productos` *(sin uso; Menu crea vía `createCategoryProduct`)* |
| `updateProduct(id, data)` | `PUT /productos/:id` *(sin uso)* |
| `deleteProduct(id)` | `DELETE /productos/:id` *(sin uso)* |
| `uploadProductImage(file)` | `POST /productos/imagen` (FormData campo `imagen`) → `{ url }` |

**Mesas:**

| Función | Endpoint |
|---|---|
| `createTable(data)` | `POST /mesas` |
| `updateTable(id, data)` | `PUT /mesas/:id` |
| `deleteTable(id)` | `DELETE /mesas/:id` |
| `regenerarTokenMesa(id)` | `POST /mesas/:id/regenerar-token` |

**Usuarios (implementadas, sin UI aún):**

| Función | Endpoint |
|---|---|
| `fetchUsers()` / `fetchUserById(id)` | `GET /usuarios`, `GET /usuarios/:id` |
| `createUser(data)` | `POST /usuarios` |
| `updateUser(id, data)` | `PUT /usuarios/:id` |
| `deleteUser(id)` | `DELETE /usuarios/:id` |

**Públicas (token de mesa, sin JWT):**

| Función | Endpoint |
|---|---|
| `fetchMesasPublicas()` | `GET /pedido/mesas` |
| `fetchMesaByToken(token)` | `GET /pedido/:token` |
| `fetchProductosPublicos(token)` | `GET /pedido/:token/menu` |
| `createOrderPublica(token, orderData)` | `POST /pedido/:token` |
| `updateOrderPublica(token, orderId, orderData)` | `PUT /pedido/:token/:orderId` |
| `fetchEstadoPedido(token)` | `GET /pedido/:token/estado` |
| `fetchAllPedidosByToken(token)` | `GET /pedido/:token/pedidos` *(usa `fetch` nativo, no axios; devuelve `[]` si falla; sin uso)* |

También existe un `login` exportado desde `orderApi.js` (duplicado del de `authApi.js`, sin uso).

---

## Cómo agregar un nuevo servicio API

### Ejemplo: eliminar una orden (`DELETE /capp/ordenes/:id`)

#### Paso 1 — Agregar función en `orderApi.js`

```js
export const deleteOrder = async (id) => {
  const res = await api.delete('/ordenes/' + id);
  return res.data;
};
```

#### Paso 2 — Hook `useApi` (fetch automático al montar)

```jsx
import { useApi } from '../../hooks/useApi';
import { fetchCategories } from '../../api/orderApi';

const { data, loading, error, refetch } = useApi(fetchCategories);
```

| Retorno | Tipo | Descripción |
|---|---|---|
| `data` | `any` | Resultado (null hasta cargar) |
| `loading` | `boolean` | true mientras se resuelve |
| `error` | `Error\|null` | Error si falla |
| `refetch` | `function` | Recargar manualmente (acepta argumentos) |

#### Paso 3 — Llamada manual para mutaciones (POST/PUT/DELETE)

```jsx
const handleDelete = async () => {
  setDeleting(true);
  try {
    await deleteOrder(id);
    // refrescar lista (ej. refetch del useApi padre)
  } catch (err) {
    console.error(err.response?.data?.message || err.message);
  } finally {
    setDeleting(false);
  }
};
```

> Convención: los mensajes de error del backend se leen con `err.response?.data?.message`. Las acciones destructivas se confirman con `window.confirm`.

---

## Estado global (React Context)

### `AuthContext` — sesión del personal

Ver sección [Autenticación](#autenticación). Expone `{ user, token, loading, isAuthenticated, rol, login, logout }`.

### `CartContext` (`src/context/CartContext.jsx`) — carrito del flujo interno

Usado por `Inicio`, `CartPanel`, `CartItem`, `MesaSelector` y `NavBar`. **Ojo:** `CustomerMenu` (cliente público) usa su propio carrito local con `useState`; no comparten estado.

#### Estado

| Variable | Tipo | Descripción |
|---|---|---|
| `cartItems` | `array` | Items del carrito |
| `selectedMesa` | `object\|null` | Mesa seleccionada |
| `total` | `number` | Total del carrito (calculado) |
| `itemCount` | `number` | Total de unidades (calculado) |

#### Acciones

| Función | Parámetro | Descripción |
|---|---|---|
| `addItem(product)` | Objeto producto | Agrega o incrementa cantidad (convierte `precio` string→Number) |
| `removeItem(id)` | `number` | Elimina item |
| `updateQuantity(id, delta)` | `(id, +1\|-1)` | Cambia cantidad (elimina si llega a 0) |
| `clearCart()` | — | Vacía el carrito |
| `setMesa(mesa)` | `{id, numeroMesa, mesero}` | Selecciona mesa |
| `submitOrder({observaciones})` | `{string}` | POST `/capp/ordenes` + limpia carrito y mesa |
| `formatCurrency(value)` | `number` | Re-export de `utils/format` |

### Ejemplo de uso

```jsx
import { useCart } from '../../context/CartContext';

const { cartItems, addItem, total, formatCurrency } = useCart();

<p>Total: {formatCurrency(total)}</p>
{cartItems.map(item => (
  <div key={item.id}>{item.nombre} x{item.cantidad}</div>
))}
```

---

## Routing (`react-router-dom` v7)

`src/App.jsx` define estas rutas (envueltas en `BrowserRouter` + providers):

| Ruta | Componente | Protección | Descripción |
|---|---|---|---|
| `/login` | `Login` | Pública | Login del personal; redirige según rol |
| `/pedido` | `SeleccionMesa` | Pública | Grid de mesas activas (elige por token) |
| `/pedido/:token` | `CustomerMenu` | Pública | Menú del cliente; crear/editar pedido pendiente |
| `/` | `Inicio` | admin+cocina | POS: catálogo por categoría + carrito |
| `/menu` | `Menu` | admin | CRUD de categorías y productos |
| `/mesas` | `Mesas` | admin | CRUD de mesas + copiar/regenerar URL de acceso |
| `/pedidos` | `Pedidos` | admin+cocina | Historial completo + cambio de estado + eliminar |
| `/reportes` | `Reportes` | admin | Ventas totales, promedios, top 5 productos |
| `/cocina` | `Kitchen` | admin+cocina | Pedidos activos y recientes, cambio de estado |
| `*` | `<Navigate to="/" replace />` | — | Catch-all |

La navegación (`NavBar`) muestra links según rol: Menú/Mesas/Reportes solo admin; Pedidos/Cocina para admin y cocina; si no hay sesión y estás en `/pedido/*`, link "Volver a seleccionar mesa".

### Agregar una nueva ruta

1. Crear `src/pages/NuevaPagina/NuevaPagina.jsx`
2. En `App.jsx`:
```jsx
<Route path="/nueva" element={
  <ProtectedRoute roles={['administrador']}>
    <NuevaPagina />
  </ProtectedRoute>
} />
```
3. En `NavBar.jsx` agregar el `NavLink` condicionado por rol si aplica.

---

## Páginas

| Página | Detalle |
|---|---|
| `Login` | Formulario correo/password; error desde `err.response.data.message`; pie con credenciales de prueba |
| `Inicio` | Vista tipo POS: `CategoryFilter` + grid de `ProductCard` + `CartPanel`; carga con `useApi(fetchCategories)` |
| `Menu` | CRUD completo vía `FormModal` + `Modal`; creación de productos anidados (`createCategoryProduct`); imagen por archivo (`uploadProductImage`) o URL con preview |
| `Mesas` | CRUD de mesas; muestra URL `${VITE_PUBLIC_URL}/pedido/${accessToken}` con copiar al portapapeles; botón regenerar token (solo mesas activas) |
| `Pedidos` | Historial inverso; badge de estado coloreado; select de estado + guardar (`updateOrderEstado`); eliminar con confirmación |
| `Kitchen` | "Pedidos activos" (≠ entregado/cancelado) con cambio de estado + "recientes" (últimos 15 entregados/cancelados) |
| `Reportes` | Métricas calculadas en cliente desde `fetchOrders`: ventas, pedidos, unidades, ticket promedio, top 5 con barras |
| `SeleccionMesa` | Público: tarjetas de mesas desde `fetchMesasPublicas`; navega a `/pedido/${accessToken}` |
| `CustomerMenu` | Público: carga mesa + menú + estado del pedido actual; si hay pedido `pendiente` hidrata el carrito local y permite editarlo (`createOrderPublica` vs `updateOrderPublica`); observaciones; pantalla de confirmación propia |

Estados de pedido usados en la UI (duplicados como constantes locales en `Pedidos`, `Kitchen` y `CustomerMenu`): `pendiente`, `en preparación`, `listo para entrega`, `entregado`, `cancelado`.

---

## Estilos (CSS Modules)

Cada componente/página tiene su archivo `.module.css`. Los estilos son locales.

```jsx
import styles from './ProductCard.module.css';
<div className={styles.titulo}>
```

Variables CSS globales (`src/styles/globals.css`):
```css
@import url('https://cdn.jsdelivr.net/npm/fontsource-poppins@5.0.0/index.css');

:root {
  --primario: #ff6b00;
  --primario-oscuro: #e65100;
  --secundario: #2c2c2c;
  --claro: #ffffff;
  --fondo: #f4f6f8;
  --texto: #333639;
  --gris: #9e9e9e;
  --gris-claro: #e0e0e0;
  --exito: #4caf50;
  --error: #f44336;
  --sombra-suave: 0 2px 8px rgba(0, 0, 0, 0.06);
  --sombra-fuerte: 0 6px 20px rgba(0, 0, 0, 0.12);
}
```

Fuente global: `'Poppins', sans-serif`. La app monta en `<div id="app">` (ver `index.html`).

---

## Endpoints de la API

Base: `VITE_API_URL + /capp`. Lecturas protegidas requieren JWT (admin/cocina); escrituras, admin. Las rutas `/auth/*` y `/pedido/*` son públicas.

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/capp/auth/login` | — | Login personal → `{ token, user }` |
| `GET` | `/capp/categorias` | 🔒 | Categorías con productos |
| `GET` | `/capp/categorias/:id` | 🔒 | Una categoría |
| `GET` | `/capp/categorias/:categoryId/productos` | 🔒 | Productos de una categoría |
| `POST` | `/capp/categorias` | 👑 | Crear categoría |
| `POST` | `/capp/categorias/:categoryId/productos` | 👑 | Crear producto en categoría |
| `PUT` | `/capp/categorias/:id` | 👑 | Actualizar categoría |
| `DELETE` | `/capp/categorias/:id` | 👑 | Eliminar categoría |
| `GET` | `/capp/productos` | 🔒 | Todos los productos |
| `GET` | `/capp/productos/:id` | 🔒 | Un producto |
| `POST` | `/capp/productos/imagen` | 👑 | Subir imagen (multipart, campo `imagen`) → `{ url }` |
| `POST` | `/capp/productos` | 👑 | Crear producto |
| `PUT` | `/capp/productos/:id` | 👑 | Actualizar producto |
| `DELETE` | `/capp/productos/:id` | 👑 | Eliminar producto |
| `GET` | `/capp/mesas` | 🔒 | Todas las mesas |
| `GET` | `/capp/mesas/:id` | 🔒 | Una mesa |
| `POST` | `/capp/mesas` | 👑 | Crear mesa |
| `PUT` | `/capp/mesas/:id` | 👑 | Actualizar mesa (incluye `estado`) |
| `POST` | `/capp/mesas/:id/regenerar-token` | 👑 | Regenerar `accessToken` |
| `DELETE` | `/capp/mesas/:id` | 👑 | Eliminar mesa |
| `GET` | `/capp/ordenes` | 🔒 | Órdenes con mesa + items |
| `GET` | `/capp/ordenes/:id` | 🔒 | Una orden |
| `POST` | `/capp/ordenes` | 🔒 | Crear orden |
| `PUT` | `/capp/ordenes/:id/estado` | 🔒 | Cambiar estado |
| `PUT` | `/capp/ordenes/:id` | 👑 | Actualizar orden |
| `DELETE` | `/capp/ordenes/:id` | 👑 | Eliminar orden |
| `GET` | `/capp/pedido/mesas` | — | Mesas activas con token (público) |
| `GET` | `/capp/pedido/:token` | — | Mesa por token |
| `GET` | `/capp/pedido/:token/menu` | — | Menú público |
| `POST` | `/capp/pedido/:token` | — | Crear pedido desde la mesa |
| `PUT` | `/capp/pedido/:token/:orderId` | — | Editar pedido propio (solo `pendiente`) |
| `GET` | `/capp/pedido/:token/estado` | — | Último pedido de la mesa |
| `GET` | `/capp/pedido/:token/pedidos` | — | Historial de pedidos de la mesa |
| `GET/POST/PUT/DELETE` | `/capp/usuarios*` | 👑 | Gestión de usuarios (sin UI aún) |

👑 = solo administrador · 🔒 = JWT (admin o cocina) · — = público

### Payload crear orden (`POST /capp/ordenes`)

```json
{
  "tableRestaurantId": 1,
  "observaciones": "Sin cebolla",
  "items": [
    { "productId": 2, "cantidad": 1 },
    { "productId": 1, "cantidad": 2 }
  ]
}
```

> El `total` se calcula en el backend (hook `beforeValidate`). No enviarlo.

---

## Mapeo de datos: Backend → Frontend

| Backend | Frontend |
|---|---|
| `producto.id` | `id` (number) |
| `producto.nombre` | `nombre` |
| `producto.tipo` | `tipo` |
| `producto.precio` | `Number(producto.precio)` |
| `producto.caracteristicas` | `descripcion` |
| `producto.imagen` | `imagen` (null → placeholder `🍽️`) |
| `categoria.nombre` | Nombre de categoría |
| `categoria.productos` | Array de productos |
| `mesa.id` | `id` |
| `mesa.numeroMesa` | `numeroMesa` |
| `mesa.mesero` | `mesero` |
| `mesa.accessToken` | Token para URL pública `/pedido/:token` |
| `orden.id` | Número de pedido (`#PED-XXXXXX` vía `formatOrderId`) |
| `orden.total` | `Number(orden.total)` |
| `orden.estado` | `estado` (badge/select) |
| `orden.items[].productName` | Nombre del producto |
| `orden.items[].cantidad` | Cantidad |
| `orden.items[].precio` | `Number(precio)` |
| `orden.items[].subtotal` | `Number(subtotal)` |
| `user.rol` | `administrador` / `cocina` (define rutas y links visibles) |

> **Importante:** Sequelize `DECIMAL` viene como **string**. Usar `Number()` o `parseFloat()` (lo hace `CartContext.addItem` y `format.js`).

---

## Testing

### Estado actual

**No hay tests automatizados configurados** (ni Vitest/Jest instalados, ni `setupTests.js`). Verificación manual:

```bash
# Terminal 1: backend
cd Backend/product-api && npm run dev

# Terminal 2: frontend
cd front && npm run dev

# Terminal 3: verificar API
curl http://localhost:3000/capp/pedido/mesas
```

### Cómo agregar tests (Vitest + React Testing Library)

Instalar dependencias:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Configurar en `vite.config.js`:
```js
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
  },
  server: {
    proxy: { '/capp': 'http://localhost:3000' },
  },
});
```

Crear `src/setupTests.js`:
```js
import '@testing-library/jest-dom';
```

Ejemplo de test (`src/components/ProductCard/ProductCard.test.jsx`):
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';
import { CartProvider } from '../../../context/CartContext';

const mockProduct = {
  id: 1,
  nombre: 'Hamburguesa Clásica',
  precio: '18000.00',
  caracteristicas: 'Carne de res, lechuga, tomate',
  imagen: 'https://example.com/img.jpg',
};

const renderWithProvider = (product) =>
  render(
    <CartProvider>
      <ProductCard product={product} />
    </CartProvider>
  );

describe('ProductCard', () => {
  test('muestra nombre y precio', () => {
    renderWithProvider(mockProduct);
    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    expect(screen.getByText('$18.000')).toBeInTheDocument();
  });

  test('renderiza imagen cuando existe', () => {
    renderWithProvider(mockProduct);
    expect(screen.getByAltText('Hamburguesa Clásica')).toBeInTheDocument();
  });

  test('placeholder cuando no hay imagen', () => {
    renderWithProvider({ ...mockProduct, imagen: null });
    expect(screen.getByText('🍽️')).toBeInTheDocument();
  });

  test('agrega producto al carrito al hacer clic', () => {
    renderWithProvider(mockProduct);
    fireEvent.click(screen.getByText('Agregar'));
  });
});
```

Comandos:
| Comando | Descripción |
|---|---|
| `npx vitest` | Modo watch (desarrollo) |
| `npx vitest run` | Ejecución única (CI) |
| `npx vitest ui` | Interfaz gráfica |

---

## Flujo de trabajo típico

```bash
# 1. Backend
cd Backend/product-api && npm run dev

# 2. Frontend
cd front && npm run dev

# 3. Personal: abrir http://localhost:5173 → login (admin@comandapp.com / admin123)
#    - POS en /, CRUD en /menu y /mesas, estados en /pedidos y /cocina, métricas en /reportes

# 4. Cliente: abrir http://localhost:5173/pedido → elegir mesa → pedir (sin login)

# 5. Build de producción
cd front && npm run build
```
