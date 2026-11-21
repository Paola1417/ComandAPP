# HANDOFF — Despliegue del backend en Enzonic

**Fecha:** 21/11/2026
**Sesión de referencia:** `ses_e0487b0e1ffe7O5qAuaPV5tdIz` (*Desplegar backend en Enzonic con conexión E2E*)
**Objetivo:** dejar el backend (Express + Sequelize + MySQL) desplegado en Enzonic Deploy y conectado E2E con el front de GitHub Pages.

---

## 1. Estado general

| Pieza | Estado | Detalle |
|---|---|---|
| Front (React + Vite) | ✅ Publicado | `https://paola1417.github.io/ComandAPP/` (workflow `deploy-front.yml`) |
| Backend en Enzonic Deploy | ⚠️ Build OK, runtime no arranca | `https://comandapp.enzonic.dev` → `503 COLD_START_TIMEOUT` |
| Base de datos (Enzonic Databases) | ✅ Operativa | Esquema creado y login verificado contra ella |
| Conexión E2E front → API | ⛔ Bloqueada | El API no responde hasta resolver el arranque |

**Bloqueo actual:** el contenedor del deployment muere antes de `app.listen`. El log solo muestra
`instance failed to start: docker run: signal: killed` y **no hay registros de runtime**.

---

## 2. Infraestructura

### 2.1 Repositorio

| Dato | Valor |
|---|---|
| Remoto | `https://github.com/Paola1417/ComandAPP` (antes `SistemaInteligenteDePedidos`) |
| Rama desplegada | `main` |
| Último commit | `f84a0eb` (*fix .gitignore*) |
| `.env` | **Eliminado del remoto**; queda solo `.env.example`. El `.env` local sigue existiendo sin trackear |

### 2.2 Enzonic Deploy

| Ajuste | Valor |
|---|---|
| Proyecto | `comandapp` |
| URL | `https://comandapp.enzonic.dev` |
| Framework | Express 5 (npm) → `mode: server` |
| Rama | `main` |
| Directorio raíz | `Backend/product-api` |
| Node | 22 (LTS) |
| Instalación | `npm ci` |
| Compilación | *(vacía)* |
| Carpeta de salida | *(vacía)* |
| Inicio | `npm start` (auto, no hay campo visible) |
| Puerto | **No definir `PORT`**; el código abre 3000 y el puerto inyectado |

### 2.3 Base de datos

| Dato | Valor |
|---|---|
| Host | `comandapp-db-kb00bw.db.enzonic.com` |
| Puerto | `3306` |
| Usuario | `u_efsso1iyq7` |
| Base | `main` |
| TLS | `DB_SSL=true` (obligatorio) |
| Contraseña | En el panel de Enzonic / gestor de secretos. **No** se documenta aquí |

> La BD estaba **vacía (0 tablas)**. Se creó el esquema con `sequelize.sync({ alter: true })` usando estas credenciales; ya existen `usuarios`, `categorias`, `productos`, `mesas`, `ordenes` y `order_items`, con los usuarios semilla `admin@comandapp.com` / `cocina@comandapp.com`.

---

## 3. Variables de entorno

### 3.1 Panel de Enzonic (Entorno · Producción)

```env
# Base de datos
DB_HOST=comandapp-db-kb00bw.db.enzonic.com
DB_PORT=3306
DB_USER=u_efsso1iyq7
DB_PASSWORD=<la del panel>
DB_NAME=main
DB_SSL=true
DB_SYNC=none

# API
CORS_ORIGIN=https://paola1417.github.io
PUBLIC_BASE_URL=https://comandapp.enzonic.dev   # añadir si falta
UPLOADS_DIR=/tmp/comandapp-uploads              # añadir si falta

# Auth
JWT_SECRET=<rotar: el actual es el de ejemplo>
JWT_EXPIRES_IN=8h
BCRYPT_SALT_ROUNDS=10
ADMIN_PASSWORD=admin123
COCINA_PASSWORD=cocina123
```

Notas:

- `PORT` **no debe existir**.
- `DATABASE_URL` está definida pero el código **no la usa**.
- `ADMIN_PASSWORD`/`COCINA_PASSWORD` no cambian usuarios ya creados.
- `PUBLIC_BASE_URL` y `UPLOADS_DIR` no aparecían en la última captura; conviene añadirlas.

### 3.2 GitHub Actions (Variables, no secretos)

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://comandapp.enzonic.dev` (sin `/capp`) |
| `VITE_PUBLIC_URL` | `https://paola1417.github.io/ComandAPP` |

> Vite las incrusta en build: hay que re-ejecutar el workflow *Deploy front to GitHub Pages* después de cambiarlas.

---

## 4. Cambios de código ya aplicados (en `main`)

| Commit | Archivo | Cambio |
|---|---|---|
| `c87636d` | `src/server.js` | Puerto `PORT`/`SERVER_PORT`/3000, bind `0.0.0.0`, `DB_SYNC` |
| `c87636d` | `src/app.js` | `trust proxy`, Helmet CORP `cross-origin`, health `GET /` y `/capp/health`, CORS por `CORS_ORIGIN` |
| `c87636d` | `src/controllers/product.controller.js` | URL de imagen con `PUBLIC_BASE_URL`/`req.protocol` |
| `c87636d` | `src/config/database.js` | Pool `acquire: 60s`, `connectTimeout`, `retry` |
| `c87636d` | `package.json` | `main: src/server.js`, `engines.node >= 20` |
| `d574660` | `src/middlewares/uploadMiddleware.js` | Resuelve directorio escribible (`UPLOADS_DIR` → `uploads/` → `/tmp`) |
| `f181888` | `src/server.js`, `src/config/initDatabase.js` | `app.listen` **antes** de la BD, 5 reintentos de 15 s, `DB_INIT` |
| `4217090` | `src/server.js` | Escucha en 3000 **y** en el puerto inyectado (sin duplicados) |
| `f84a0eb` | `.gitignore` | Ajustes varios |

`resumen.md` documenta el despliegue completo (arquitectura, variables, E2E, troubleshooting).

---

## 5. Verificación hecha en local (contra la BD real)

Ejecutado con las credenciales de la sección 2.3 y `DB_SYNC=alter`:

```text
Servidor iniciado en puerto 3000
Servidor iniciado en puerto 3999
Base de datos verificada correctamente.
Tablas verificadas correctamente.
Usuario admin sembrado/verificado: admin@comandapp.com
Usuario cocina sembrado/verificado: cocina@comandapp.com
```

| Prueba | Resultado |
|---|---|
| `GET /capp/health` | `200 {"ok":true,"db":true}` |
| `POST /capp/auth/login` (admin) | `200` + JWT |
| `GET /capp/productos` con Bearer | `200` |
| `GET /capp/pedido/mesas` | `200` |
| Fallback de uploads con ruta inválida | Cae a `uploads/` sin romper |
| Fallback con BD inválida | El puerto responde y `/capp/health` devuelve `db:false` |

**Conclusión:** el código y la BD funcionan. El problema está en el arranque del contenedor en Enzonic Deploy.

---

## 6. Bloqueo actual y causa probable

Síntomas:

- `503 · COLD_START_TIMEOUT` en `https://comandapp.enzonic.dev/capp/health`.
- Runtime log: `instance failed to start: docker run: signal: killed`.
- **Sin logs de la app** (ni `Servidor iniciado en puerto 3000`).

Interpretación: el proceso muere **antes de `app.listen`**. El único punto que se ejecuta antes y puede lanzar es `uploadMiddleware` al hacer `require("./app")`:

```text
require("./app")
  └─ require("./middlewares/uploadMiddleware")
       └─ resolveUploadsDir()
            ├─ UPLOADS_DIR        (sin definir)
            ├─ /var/task/uploads  (solo lectura → falla)
            └─ /tmp/...           (si el sandbox también lo bloquea → falla)
       └─ throw new Error(...)
```

Hipótesis alternativas (menos probables, descartar en este orden):

1. El deployment en ejecución no es `f84a0eb` (build viejo).
2. El proyecto corre en modo *función* en lugar de *servidor* (el log lo prefija `function us`).
3. El contenedor se queda sin memoria (límite 512 MB).

---

## 7. Siguiente paso: fix pendiente de `uploadMiddleware`

Objetivo: que el arranque **nunca** dependa del sistema de archivos.

| # | Archivo | Cambio |
|---|---|---|
| 1 | `src/middlewares/uploadMiddleware.js` | `resolveUploadsDir()` devuelve `null` en vez de lanzar |
| 2 | `src/middlewares/uploadMiddleware.js` | Si es `null` → `multer.memoryStorage()` |
| 3 | `src/app.js` | `express.static(UPLOADS_DIR)` solo si `UPLOADS_DIR` existe |
| 4 | `src/controllers/product.controller.js` | Sin almacenamiento → `503` con mensaje claro |
| 5 | `src/server.js` | Log `[boot]` en `stderr` y `try/catch` en los `require` para que cualquier error fatal quede visible |

Después: commit en `main`, redeploy en Enzonic y comprobar `/capp/health`.

---

## 8. Plan de continuación

1. Aplicar el fix de la sección 7 y hacer commit/push en `main`.
2. En Enzonic: **Redeploy** y confirmar que el deployment es del commit nuevo y está en *Producción actual*.
3. Verificar:

   ```powershell
   curl.exe -s https://comandapp.enzonic.dev/capp/health
   ```

   Esperado: `{"ok":true,"db":true,...}`.

4. Si sigue el 503 sin logs, probar un servidor mínimo en **Ajustes → Comando de inicio**:

   ```bash
   node -e "require('http').createServer((q,s)=>s.end('ok')).listen(3000,'0.0.0.0',()=>console.log('minimal up'))"
   ```

   - Responde `ok` → el problema es la app.
   - Sigue `killed` → problema de plataforma/modo/recursos (revisar *Ajustes* o abrir ticket).

5. Actualizar las variables de GitHub Actions y re-ejecutar el workflow del front.
6. Prueba E2E: login → categoría → producto con **URL de imagen** → mesa → pedido en incógnito → cocina → reportes → regenerar token.

---

## 9. Gotchas conocidos

| Tema | Detalle |
|---|---|
| `PORT` | No definirlo en el panel; el código ya abre 3000 y el inyectado |
| BD vacía + `DB_SYNC=none` | No se crean tablas; usar `alter` en el primer arranque o crearlas aparte |
| Seeds | Solo crean usuarios si no existen; cambiar `ADMIN_PASSWORD` no actualiza la contraseña |
| Disco | Efímero en Deploy: las imágenes subidas se pierden; usar el campo "URL de imagen" |
| Cold start | App duerme a los 15 min; BD a los 5 min |
| `.env` | Ya no está en el remoto; no volver a subirlo. El local tiene el host viejo |
| JWT | `JWT_SECRET` sigue siendo el de ejemplo: rotarlo |
| Repo | GitHub redirige desde `SistemaInteligenteDePedidos` a `ComandAPP` |

---

## 10. Comandos útiles

```powershell
# Reabrir la sesión de referencia
opencode -s ses_e0487b0e1ffe7O5qAuaPV5tdIz

# Listar sesiones
opencode session list

# Verificación del API
curl.exe -s https://comandapp.enzonic.dev/capp/health
curl.exe -s https://comandapp.enzonic.dev/capp/pedido/mesas

# Login
curl.exe -X POST https://comandapp.enzonic.dev/capp/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"correo\":\"admin@comandapp.com\",\"password\":\"admin123\"}'

# Arranque local contra la BD de Enzonic
cd Backend/product-api
$env:DB_HOST="comandapp-db-kb00bw.db.enzonic.com"
$env:DB_USER="u_efsso1iyq7"
$env:DB_NAME="main"
$env:DB_PORT="3306"
$env:DB_SSL="true"
$env:DB_SYNC="none"
$env:DB_INIT="false"
npm start
```
