# AGENTS.md

Restaurant ordering system ("ComandAPP"). No root manifest or workspace: every sub-project has its own `package.json` and must be run from its own directory.

| Path | What | Run |
|---|---|---|
| `Backend/product-api/` | Main REST API (Node, Express 5, Sequelize 6, MySQL/MariaDB, CommonJS) | `npm run dev` → :3000 |
| `front/` | Staff POS + customer web app (React 19, Vite 8, plain JS) | `npm run dev` → :5173 |
| `ComandAPP-Mobile/` | Expo SDK 57 / RN 0.86 APK (customer menu only) | `npm start` |
| `ComandAPP-Smart-Recommendations/` | Standalone recommendation PoC | `node backend/server.js` → :3001 |
| `MySQL/stack.yml` | Docker MySQL + Adminer (:8086) | `docker-compose -f stack.yml up -d` |

**No tests, lint, typecheck, or formatter exist in any sub-project.** Verification is booting against a real DB and using curl/UI. The only `test` script (Smart Recommendations) is a placeholder that exits 1.

Detailed docs: `Backend/product-api/README.md` (full endpoint table), `front/README.md`, root `README.md`.

## Backend (`Backend/product-api/`)

- Requires MySQL/MariaDB. `.env` is **tracked in git** — edit it, don't create one. Defaults: `root`/`rodri`, db `restaurante`, `DB_PORT=3306`, `PORT=3000`.
- `MySQL/stack.yml` starts MySQL with root password `rodri` (Adminer on :8086) and pre-creates an unused `appdb`; the API creates `restaurante` itself.
- Boot (`src/server.js`): `initDatabase` creates the DB → `sequelize.sync({ alter: true })` (**no migrations; editing a model rewrites tables**) → seed users → backfill `accessToken` on tables missing one.
- Seeds only create users **when absent** (`seedUser` returns early), so changing `ADMIN_PASSWORD`/`COCINA_PASSWORD` never updates an existing user. Defaults: `admin@comandapp.com`/`admin123`, `cocina@comandapp.com`/`cocina123`.
- A fresh DB contains users only: no mesas, categorías, or productos. `/pedido`, `/pedido/:token`, and the mobile app stay empty until a table and menu are created through the UI/API.
- Auth: JWT `Bearer` (`authMiddleware` → `req.user = { id, rol }`). Every `/capp/*` route except `/capp/auth/login` and `/capp/pedido` requires auth. Reads: `administrador` + `cocina`; writes: `administrador` — except order creation and `PUT /capp/ordenes/:id/estado`, which also allow `cocina`.
- Customer flow is not JWT: each table has a unique `accessToken` in the URL (`/capp/pedido/:token/...`), regenerated via `POST /capp/mesas/:id/regenerar-token`. `GET /capp/pedido/mesas` is public and returns every active table's token.
- Routes mount under `/capp` in `src/app.js`; `etag` is disabled and `Cache-Control: no-store` forced.
- Images: `POST /capp/productos/imagen` (admin, multipart, field **`imagen`**) writes to `Backend/product-api/uploads/` (gitignored) and returns an absolute `{ url }` built from the request host; `/uploads` is served unauthenticated. `Product.imagen` stores that full URL, and update/delete removes internal files.
- Associations register only when `src/models/associations` is required (`server.js` does; `app.js` does not), so `include: { as: "mesa"/"items"/"producto" }` breaks in standalone scripts unless you require it too.
- Models: English filename, Spanish Sequelize name/table (`Product.js` → `"Producto"` / `productos`), Spanish aliases.
- `Order.total` is computed by a `beforeValidate` hook from `items` — never set it. Creation is transactional (`src/services/order.service.js`) and snapshots `productName`/`precio` onto `OrderItem`.
- `src/middlewares/validator.js` is an empty stub (`express-validator` installed, unused); services throw `Error` with `statusCode`, and `errorHandler.js` maps that plus `MulterError` (5 MB limit) and Sequelize validation/unique errors to 400/409, else 500.
- Style is inconsistent (some files have no spaces around `=`). Match the file you are editing.

## Frontend (`front/`)

- Dev server proxies `/capp` → `localhost:3000`; `src/api/client.js` uses `baseURL: VITE_API_URL + '/capp'` and injects the Bearer token from `localStorage` (`comandapp_token`, `comandapp_user`).
- The response interceptor only logs 404/500 — there is no global 401 logout; `AuthContext` + `ProtectedRoute` guard by role.
- Routes: public `/login`, `/pedido`, `/pedido/:token`; `admin`+`cocina` `/`, `/pedidos`, `/cocina`; `admin` `/menu`, `/mesas`, `/reportes`; `*` → `/`.
- Sequelize `DECIMAL` arrives as a **string** — `Number(...)` prices/totals before math or formatting (`src/utils/format.js`, `CartContext`).
- `.env` (tracked): `VITE_API_URL`, `VITE_PUBLIC_URL`.

## Mobile (`ComandAPP-Mobile/`)

- Expo SDK 57 / RN 0.86. It has its own `AGENTS.md` (included by `CLAUDE.md`) requiring the versioned docs at https://docs.expo.dev/versions/v57.0.0/ — read that before touching Expo code.
- API host is hardcoded in `src/services/api.js` as `http://192.168.2.114:3000`; devices/emulators need the dev machine's LAN IP. Requests use `fetch` (not the imported axios), and `app.json` sets `usesCleartextTraffic` for plain HTTP.
- Only two screens: name entry → picks the **first** active table's `accessToken` → read-only menu. No JWT login, no order placement. `api.js` also contains a stray Flow annotation `(token: string)` in a plain `.js` file.
- APK builds go through EAS (`eas.json`, `preview` profile → APK); `/android` and `/ios` are gitignored (no local native folders).

## Smart Recommendations (`ComandAPP-Smart-Recommendations/`)

- Independent PoC, not connected to the API, web app, or APK. No `start` script — run `node backend/server.js`.
- `GET /api/recommendations/:productName` on :3001 (no `/capp` prefix) reads `data/orders.json`; unknown products return 404. Its README mentions a `frontend/` folder that does not exist.
