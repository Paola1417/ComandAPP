# Frontend — Sistema Inteligente de Pedidos

Frontend en **React 19 + Vite 8** (JavaScript puro, sin TypeScript). Consume la API REST del backend (`Backend/product-api`) en tiempo real.

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

El backend auto-crea la base de datos y tablas (`sequelize.sync({ alter: true })`).

3. Verificar endpoints:
```bash
curl http://localhost:3000/capp/categorias
```

---

## Configuración del entorno

`.env` en la raíz de `front/`:
```env
VITE_API_URL=http://localhost:3000
```

> Vite expone variables públicas con prefijo `VITE_`.

### Proxy de desarrollo (`vite.config.js`)

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
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
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── client.js            # Instancia axios (baseURL + interceptors)
│   │   └── orderApi.js          # fetchCategories, fetchProducts, fetchTables,
│   │                            #   fetchOrders, createOrder, deleteOrder
│   ├── components/              # Reutilizables (+ .module.css)
│   │   ├── NavBar/              # Barra superior + navegación
│   │   ├── MesaSelector/        # Dropdown de mesas
│   │   ├── ProductCard/         # Card de producto
│   │   ├── CartItem/            # Item del carrito
│   │   ├── CartPanel/           # Panel lateral: carrito + mesa + confirmar
│   │   ├── CategoryFilter/      # Filtro por categorías
│   │   └── Modal/               # Modal de feedback (éxito/error)
│   ├── pages/                   # Vistas (+ .module.css)
│   │   ├── Inicio/              # Catálogo + carrito
│   │   ├── Menu/                # Menú completo
│   │   ├── Pedidos/             # Historial de órdenes
│   │   └── Reportes/            # Estadísticas
│   ├── hooks/
│   │   └── useApi.js            # Hook genérico: {data, loading, error, refetch}
│   ├── context/
│   │   └── CartContext.jsx      # Estado global: carrito, mesa, submitOrder
│   ├── styles/
│   │   └── globals.css          # Variables CSS + reset
│   ├── utils/
│   │   └── format.js            # formatCurrency, formatDate, formatOrderId, getCategoryIcon
│   ├── App.jsx                  # Rutas (react-router-dom v7)
│   └── main.jsx                 # Entry: React + BrowserRouter + CartProvider
├── vite.config.js
├── .env
└── package.json
```

---

## Servicios API (`src/api/`)

### Cliente base — `client.js`

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/capp',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.warn('Not found:', error.config.url);
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Funciones — `orderApi.js`

```js
import api from './client';

export const fetchCategories = async () => {
  const res = await api.get('/categorias');
  return res.data;
};

export const fetchProducts = async () => {
  const res = await api.get('/productos');
  return res.data;
};

export const fetchTables = async () => {
  const res = await api.get('/mesas');
  return res.data;
};

export const fetchOrders = async () => {
  const res = await api.get('/ordenes');
  return res.data;
};

export const createOrder = async (orderData) => {
  const res = await api.post('/ordenes', orderData);
  return res.data;
};
```

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
| `refetch` | `function` | Recargar manualmente |

#### Paso 3 — Llamada manual para mutaciones (POST/PUT/DELETE)

```jsx
import { useState } from 'react';
import { deleteOrder } from '../../api/orderApi';

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

---

## Estado global (React Context)

`src/context/CartContext.jsx`

### Estado

| Variable | Tipo | Descripción |
|---|---|---|
| `cartItems` | `array` | Items del carrito |
| `selectedMesa` | `object\|null` | Mesa seleccionada |
| `total` | `number` | Total del carrito (calculado) |
| `itemCount` | `number` | Total de unidades (calculado) |

### Acciones

| Función | Parámetro | Descripción |
|---|---|---|
| `addItem(product)` | Objeto producto | Agrega o incrementa cantidad |
| `removeItem(id)` | `number` | Elimina item |
| `updateQuantity(id, delta)` | `(id, +1\|-1)` | Cambia cantidad |
| `clearCart()` | — | Vacía el carrito |
| `setMesa(mesa)` | `{id, numeroMesa, mesero}` | Selecciona mesa |
| `submitOrder({observaciones})` | `{string}` | POST `/capp/ordenes` + limpia carrito |
| `formatCurrency(value)` | `number` | Formatea a $ colombianos |

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

`src/App.jsx` define 4 rutas:

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Inicio` | Catálogo por categoría + carrito |
| `/menu` | `Menu` | Menú completo |
| `/pedidos` | `Pedidos` | Historial de órdenes |
| `/reportes` | `Reportes` | Estadísticas |

### Agregar una nueva ruta

1. Crear `src/pages/NuevaPagina/NuevaPagina.jsx`
2. En `App.jsx`:
```jsx
<Route path="/nueva" element={<NuevaPagina />} />
```
3. En `NavBar.jsx`:
```jsx
<NavLink to="/nueva" className={styles['nav-link']}>Nueva Página</NavLink>
```

---

## Estilos (CSS Modules)

Cada componente/página tiene su archivo `.module.css`. Los estilos son locales.

```jsx
import styles from './ProductoCard.module.css';
<div className={styles.titulo}>
```

Variables CSS globales (`src/styles/globals.css`):
```css
:root {
  --primario: #ff6b00;
  --secundario: #2c2c2c;
  --claro: #ffffff;
  --fondo: #f4f6f8;
  --texto: #333639;
  --gris: #9e9e9e;
  --gris-claro: #e0e0e0;
  --exito: #4caf50;
  --error: #f44336;
}
```

---

## Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/capp/categorias` | Categorías con productos |
| `GET` | `/capp/categorias/:id` | Una categoría |
| `GET` | `/capp/categorias/:id/productos` | Productos de una categoría |
| `GET` | `/capp/productos` | Todos los productos |
| `GET` | `/capp/productos/:id` | Un producto |
| `GET` | `/capp/mesas` | Todas las mesas |
| `GET` | `/capp/ordenes` | Órdenes con mesa + items |
| `POST` | `/capp/ordenes` | Crear orden |
| `PUT` | `/capp/ordenes/:id` | Actualizar orden |
| `DELETE` | `/capp/ordenes/:id` | Eliminar orden |

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
| `orden.id` | Número de pedido |
| `orden.total` | `Number(orden.total)` |
| `orden.estado` | `estado` |
| `orden.items[].productName` | Nombre del producto |
| `orden.items[].cantidad` | Cantidad |
| `orden.items[].precio` | `Number(precio)` |
| `orden.items[].subtotal` | `Number(subtotal)` |

> **Importante:** Sequelize `DECIMAL` viene como **string**. Usar `Number()` o `parseFloat()`.

---

## Testing

### Estado actual

**No hay tests automatizados configurados.** Verificación manual:

```bash
# Terminal 1: backend
cd Backend/product-api && npm run dev

# Terminal 2: frontend
cd front && npm run dev

# Terminal 3: verificar API
curl http://localhost:3000/capp/categorias
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

# 3. Abrir http://localhost:5173
# 4. Agregar productos → seleccionar mesa → confirmar pedido
# 5. Ver historial en /pedidos, estadísticas en /reportes

# 6. Build de producción
cd front && npm run build
```
