# ComandAPP — Sistema Inteligente de Pedidos

Sistema de pedidos para restaurantes con dos aplicaciones independientes en un mismo repositorio:

| App | Stack | Ubicación |
|---|---|---|
| **Backend** | API REST — Node.js, Express 5, Sequelize 6, MySQL/MariaDB (CommonJS) | [`Backend/product-api/`](Backend/product-api/) |
| **Frontend** | React 19 + Vite 8, react-router-dom v7, axios, CSS Modules (JS puro) | [`front/`](front/) |

## Funcionalidades

- **Personal** (login JWT, roles `administrador`/`cocina`): POS de ventas, CRUD de menú y mesas, gestión de pedidos y estados, panel de cocina, reportes de ventas.
- **Cliente** (sin cuenta): accede por la URL pública de su mesa (`/pedido/:token`) para ver el menú, pedir y editar su pedido mientras esté `pendiente`.

## Requisitos

- Node.js >= 18
- MySQL o MariaDB en ejecución (ej. Docker: `docker run --name mysql-restaurante -e MYSQL_ROOT_PASSWORD=rodri -e MYSQL_DATABASE=restaurante -p 3306:3306 -d mysql:8`)

## Inicio rápido

```bash
# 1. Backend (puerto 3000) — auto-crea BD, tablas y usuarios seed
cd Backend/product-api
npm install
npm run dev

# 2. Frontend (puerto 5173)
cd front
npm install
npm run dev
```

Abrir http://localhost:5173

### Usuarios de prueba (seed automático)

| Correo | Contraseña | Rol |
|---|---|---|
| `admin@comandapp.com` | `admin123` | administrador |
| `cocina@comandapp.com` | `cocina123` | cocina |

Los clientes no inician sesión: entran por `http://localhost:5173/pedido` y eligen su mesa.

## Documentación detallada

- Backend: [`Backend/product-api/README.md`](Backend/product-api/README.md) — modelos, 31 endpoints con auth/roles, servicios, arranque.
- Frontend: [`front/README.md`](front/README.md) — arquitectura, rutas, contexts, servicios API, estilos.

## Notas

- Los `.env` de ambas apps están trackeados en git (proyecto de práctica); edítalos en lugar de crearlos.
- El backend usa `sequelize.sync({ alter: true })`: **no hay migraciones**, cambiar un modelo altera las tablas al arrancar.
- Sin tests ni linter configurados; la verificación es manual contra una BD real.
