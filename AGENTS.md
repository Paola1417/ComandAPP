# AGENTS.md

Restaurant ordering system ("Sistema Inteligente de Pedidos"). Two independent parts in one repo:

- **Backend**: REST API at `Backend/product-api/` (Node.js, Express 5, Sequelize 6, MySQL/MariaDB).
- **Frontend**: static vanilla JS site at repo root (`index.html`, `styles.css`, `script.js`). No build step, no framework, no tests. **It is not wired to the API** — product data is hardcoded in `script.js`.

## Backend commands (run from `Backend/product-api/`)

- `npm install` — install deps
- `npm run dev` — start with nodemon (`src/server.js`)
- `npm start` — plain start
- **No tests, lint, or typecheck exist.** The only verification is booting the server against a real MySQL and hitting endpoints. Verify with `curl http://localhost:3000/capp/<recurso>`.

## Backend gotchas

- Requires a running MySQL/MariaDB. DB config is in `Backend/product-api/.env` (untracked; copy from values like `localhost:3306`, user `root`, db `restaurante`, `PORT=3000`).
- On every boot, `src/server.js` creates the DB if missing (`src/config/initDatabase.js`) then runs `sequelize.sync({ alter: true })` — **there are no migrations; changing a model mutates existing tables automatically**, which can alter/drop columns.
- All routes are mounted under the `/capp` prefix (`src/app.js`): `/capp/productos`, `/capp/categorias`, `/capp/mesas`, `/capp/ordenes`.
- CommonJS everywhere (`require` / `module.exports`). Match that.
- Associations are only registered when `./models/associations` is required (`server.js` does it; `app.js` does not). Loading a model standalone won't give you `include: { as: "mesa"/"items"/"productos" }` working.
- Models: English filenames, Spanish Sequelize model name and `tableName` (e.g. `Product.js` → `"Producto"`, table `productos`). Aliases are Spanish (`as: "items"`, `as: "producto"`, `as: "mesa"`).
- `Order.total` is auto-computed in a `beforeValidate` hook from `items`; don't set it manually. Order creation runs in a transaction (`src/services/order.service.js`) and snapshots `productName`/`precio` onto `OrderItem` as history.
- `src/middlewares/errorHandler.js` and `validator.js` are **empty stubs**; `express-validator` is installed but not wired in. Input validation happens inside services (throws `Error`, controllers return 400/404).
- Code style is inconsistent (some files use no spaces around `=`, others are formatted). No formatter/linter configured — match the style of the file you're editing.

## Frontend

- Static site; just open `index.html` or serve the folder. No build/dev command.
- Sections switch via JS (`cambiarSeccion`); state (`pedido`, `historialPedidos`, `statsVentas`) is in-memory only and resets on reload.
