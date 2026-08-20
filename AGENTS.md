# AGENTS.md

Restaurant ordering system ("ComandAPP"). Two independent apps in one repo:

- **Backend**: REST API in `Backend/product-api/` (Node, Express 5, Sequelize 6, MySQL/MariaDB, CommonJS).
- **Frontend**: React 19 + Vite 8 app in `front/` (plain JS, no TS), wired to the API via axios.

## Commands

Backend (run from `Backend/product-api/`):
- `npm install` / `npm run dev` (nodemon) / `npm start`
- **No tests, lint, or typecheck exist.** Only verification is booting against a real MySQL and hitting endpoints: `curl http://localhost:3000/capp/<recurso>`.

Frontend (run from `front/`):
- `npm install` / `npm run dev` (http://localhost:5173) / `npm run build` → `dist/` / `npm run preview`
- **No tests configured.**

## Backend gotchas

- Requires MySQL/MariaDB. `.env` is **tracked in git** (both backend and front) — edit it in place, don't create one. Current defaults: user `root`, pass `rodri`, db `restaurante`, `PORT=3000`, `JWT_SECRET`, seed passwords. `.env.example` mirrors it.
- Boot flow (`src/server.js`): `initDatabase` creates the DB if missing → `sequelize.sync({ alter: true })` (**no migrations; changing a model mutates existing tables**) → seeds users → backfills a random `accessToken` onto any table missing one.
- Seeds two users on boot if absent: `admin@comandapp.com`/`admin123` (rol `administrador`) and `cocina@comandapp.com`/`cocina123` (rol `cocina`). Override via `ADMIN_PASSWORD`/`COCINA_PASSWORD`.
- JWT auth: `src/middlewares/authMiddleware.js` verifies `Authorization: Bearer <token>` with `JWT_SECRET`, sets `req.user = { id, rol }`. `roleMiddleware(...roles)` enforces roles. Every `/capp/*` route except `/capp/auth` and `/capp/pedido` requires auth; reads need `administrador`/`cocina`, writes need `administrador`.
- Customer flow is token-based, not JWT: each table has a unique `accessToken` (regenerate via `POST /capp/mesas/:id/regenerar-token`). Public routes under `/capp/pedido/*` take the token as `:token`. Note `/capp/pedido/mesas` publicly returns every active table's `accessToken`.
- All routes mounted under `/capp` in `src/app.js`: `/capp/auth`, `/capp/usuarios` (admin-only), `/capp/pedido`, `/capp/productos`, `/capp/categorias`, `/capp/mesas`, `/capp/ordenes`.
- CommonJS everywhere — match it.
- Associations are only registered when `./models/associations` is required (`server.js` does it; `app.js` does not). Loading a model standalone won't give you `include: { as: "mesa"/"items"/"producto" }` working.
- Models: English filenames, Spanish Sequelize name + `tableName` (e.g. `Product.js` → `"Producto"`, table `productos`). Aliases are Spanish (`as: "items"`, `as: "producto"`, `as: "mesa"`).
- `Order.total` is auto-computed in a `beforeValidate` hook from `items`; don't set it. Order creation runs in a transaction (`src/services/order.service.js`) and snapshots `productName`/`precio` onto `OrderItem` as history.
- `src/middlewares/validator.js` is an **empty stub**; `express-validator` installed but not wired. Validation happens inside services (throw `Error`); `errorHandler.js` maps `err.statusCode` and Sequelize errors to 400/409/500.
- Code style is inconsistent (some files use no spaces around `=`, others are formatted). No formatter/linter configured — match the style of the file you're editing.

## Frontend

- React 19 + Vite 8, plain JS (no TypeScript), `react-router-dom` v7, axios, CSS Modules (`.module.css` beside each component/page).
- `.env` (tracked): `VITE_API_URL=http://localhost:3000`, `VITE_PUBLIC_URL=http://localhost:5173`. The Vite dev server proxies `/capp` → `localhost:3000`, so relative `/capp` paths work in dev.
- JWT lives in `localStorage` keys `comandapp_token` / `comandapp_user`; the axios interceptor in `src/api/client.js` attaches the Bearer header automatically. `AuthContext` + `ProtectedRoute` (`src/components/ProtectedRoute`) guard routes by role.
- Routes: `/login`, `/pedido` (pick a table by public token), `/pedido/:token` (customer menu, public). Protected: `/` (Inicio, admin+cocina), `/menu` (admin), `/mesas` (admin), `/pedidos` (admin+cocina), `/reportes` (admin), `/cocina` (admin+cocina).
- Sequelize `DECIMAL` arrives as a **string** — always `Number(...)` prices/totals before using them (see `src/utils/format.js` and `CartContext`).