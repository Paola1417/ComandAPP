# Resumen — Despliegue del backend en Enzonic (E2E con GitHub Pages)

Documento de referencia del despliegue del API de **ComandAPP** en **Enzonic Deploy**, conectado a la base de datos MySQL de **Enzonic Databases** y consumido por el front publicado en **GitHub Pages**.

---

## 1. Arquitectura final

```text
┌──────────────────────────────┐        HTTPS + JWT (Bearer)        ┌────────────────────────────────┐
│  Front (React + Vite)        │ ─────────────────────────────────► │  Backend (Express 5)           │
│  GitHub Pages                │ ◄───────────────────────────────── │  Enzonic Deploy · server mode  │
│  https://paola1417.github.io │        JSON / imágenes             │  https://<proyecto>.enzonic.dev│
│  /ComandAPP/                 │                                    │  Backend/product-api           │
└──────────────────────────────┘                                    └───────────────┬────────────────┘
                                                                                    │ TLS (3306)
                                                                                    ▼
                                                                    ┌────────────────────────────────┐
                                                                    │  MySQL 8.4 · Enzonic Databases │
                                                                    │  comandapp-rt6fw5.db.enzonic.com│
                                                                    │  DB: main · DB_SSL=true        │
                                                                    └────────────────────────────────┘
```

| Pieza | Dónde | URL / host |
|---|---|---|
| Front (staff + cliente) | GitHub Pages (workflow `deploy-front.yml`) | `https://paola1417.github.io/ComandAPP/` |
| API | Enzonic Deploy (Express, *server mode*) | `https://<proyecto>.enzonic.dev` |
| Base de datos | Enzonic Databases (MySQL 8.4) | `comandapp-rt6fw5.db.enzonic.com:3306` |
| Imágenes de producto | `PUBLIC_BASE_URL/uploads/...` (disco efímero) o URL externa | — |

> El repositorio fue renombrado a `Paola1417/ComandAPP` (GitHub redirige desde `SistemaInteligenteDePedidos`). Al conectar Enzonic, selecciona **`Paola1417/ComandAPP`**.

---

## 2. Decisión: Enzonic Deploy (no el servidor del panel)

| Criterio | Enzonic Deploy ✅ | Servidor del panel (`nodejs-generic`) |
|---|---|---|
| HTTPS / dominio | `https://<proyecto>.enzonic.dev` automático | IP:puerto, sin TLS (requiere dominio + proxy propio) |
| Compatible con GitHub Pages (HTTPS) | Sí | No sin trabajo extra (mixed content) |
| Despliegue | `git push` / workflow | SFTP o `git clone` al arrancar |
| Express | Sí, *server mode* | Sí, proceso persistente |
| Disco | Efímero (las subidas se pierden) | 10 GB persistentes |
| Free | 150 GB/mes, 512 MB, duerme a los 15 min | 512 MB, 24/7 |

**Conclusión:** Deploy es la única opción que da HTTPS gratuito sin configurar dominio ni proxy. El coste es que el disco es efímero; se resuelve usando el campo **"URL de imagen"** del formulario de productos (ya existe en `front/src/pages/Menu/Menu.jsx`).

---

## 3. Cambios aplicados al código

| # | Archivo | Cambio | Motivo |
|---|---|---|---|
| 1 | `Backend/product-api/src/server.js` | Puerto `process.env.PORT \|\| process.env.SERVER_PORT \|\| 3000`; `app.listen(port, "0.0.0.0")`; `process.exit(1)` si falla el arranque | Deploy inyecta el puerto y necesita el proceso vivo/reintentable |
| 2 | `Backend/product-api/src/server.js` | `DB_SYNC`: `alter` (local) / `none` (producción) | Evita `sequelize.sync({ alter: true })` en cada *cold start* sobre 0.25 vCPU |
| 3 | `Backend/product-api/src/app.js` | `app.set("trust proxy", 1)` | Que `req.protocol` sea `https` detrás del proxy |
| 4 | `Backend/product-api/src/app.js` | `helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })` | Por defecto Helmet bloquea `/uploads/*` desde `github.io` |
| 5 | `Backend/product-api/src/app.js` | Rutas `GET /` y `GET /capp/health` → `{ ok: true }` | Health check y "despertar" el servidor gratuito |
| 6 | `Backend/product-api/src/app.js` | CORS configurable con `CORS_ORIGIN` (vacío = abierto) | Poder limitar al dominio de Pages sin romper local |
| 7 | `Backend/product-api/src/controllers/product.controller.js` | URL de imagen con `PUBLIC_BASE_URL` o `req.protocol` (antes `http://` fijo) | Evita *mixed content* en GitHub Pages |
| 8 | `Backend/product-api/src/config/database.js` | `pool: { max: 5, min: 0, idle: 10000, acquire: 60000 }`, `connectTimeout: 20000`, `retry: { max: 3 }` | La BD free duerme a los 5 min; el `acquire` amplio evita 500 al despertar |
| 9 | `Backend/product-api/package.json` | `main: src/server.js`, `engines.node >= 20` | Entry point real y runtime fijo en el builder |
| 10 | `.env` / `.env.example` | Nuevas variables `DB_SYNC`, `PUBLIC_BASE_URL`, `CORS_ORIGIN` | Configuración explícita por entorno |
| 11 | `Backend/product-api/README.md` | Tabla de variables, health check y middlewares actualizados | Documentación alineada con el código |

---

## 4. Variables de entorno

### 4.1 Producción (panel de Enzonic Deploy → Environment variables → Production)

```env
DB_HOST=comandapp-rt6fw5.db.enzonic.com
DB_PORT=3306
DB_USER=u_twzfmib7dp
DB_PASSWORD=<rotar antes de publicar>
DB_NAME=main
DB_SSL=true

DB_SYNC=none
PUBLIC_BASE_URL=https://<proyecto>.enzonic.dev
CORS_ORIGIN=https://paola1417.github.io

JWT_SECRET=<64 caracteres aleatorios nuevos>
JWT_EXPIRES_IN=8h
BCRYPT_SALT_ROUNDS=10
ADMIN_PASSWORD=admin123
COCINA_PASSWORD=cocina123
```

> **No definas `PORT`**: lo inyecta la plataforma.

### 4.2 Local (`.env` del repo)

```env
PORT=3000
DB_HOST=comandapp-rt6fw5.db.enzonic.com
DB_USER=u_twzfmib7dp
DB_PASSWORD=<la misma del panel>
DB_NAME=main
DB_PORT=3306
DB_SSL=true
DB_SYNC=alter
PUBLIC_BASE_URL=
CORS_ORIGIN=
JWT_SECRET=comandapp_super_secreto_2024
JWT_EXPIRES_IN=8h
BCRYPT_SALT_ROUNDS=10
ADMIN_PASSWORD=admin123
COCINA_PASSWORD=cocina123
```

### 4.3 Variables del front (GitHub → Settings → Secrets and variables → Actions → Variables)

| Variable | Valor | Efecto |
|---|---|---|
| `VITE_API_URL` | `https://<proyecto>.enzonic.dev` | `src/api/client.js` le añade `/capp` |
| `VITE_PUBLIC_URL` | `https://paola1417.github.io/ComandAPP` | Base de las URLs de mesa (`/#/pedido/<token>`) |

> Vite inyecta estas variables **en tiempo de build**: cambiarlas exige volver a ejecutar el workflow.

### 4.4 Notas importantes

- `dotenv` **no sobrescribe** variables ya definidas: las del panel tienen prioridad sobre el `.env` del repo.
- `ADMIN_PASSWORD` / `COCINA_PASSWORD` **solo crean usuarios nuevos**. Como la BD ya tiene los seeds de local, el login sigue siendo `admin123` / `cocina123`.
- El `.env` está versionado en git con la contraseña de la BD: **rota esa contraseña** y, si se puede, sácalo del repo (`git rm --cached` + `.gitignore`).

---

## 5. Paso a paso del despliegue

1. **Subir el código** a `main` (los cambios de la sección 3 ya están aplicados).
2. Entrar en `https://deploy.enzonic.com` e iniciar sesión con la misma cuenta de Enzonic.
3. **New project** → conectar GitHub → instalar la *Enzonic GitHub App* en `Paola1417/ComandAPP`.
4. Configurar el proyecto:

   | Campo | Valor |
   |---|---|
   | Repository | `Paola1417/ComandAPP` |
   | Branch | `main` |
   | **Root directory** | `Backend/product-api` |
   | Framework | Express / Node (server mode) |
   | Install command | `npm ci` |
   | Start command | `npm start` |
   | Node | 20 o superior |

   Si el panel no admite subcarpeta: Install `cd Backend/product-api && npm ci`, Start `node Backend/product-api/src/server.js`.

5. Pegar las variables de la sección 4.1 en **Production** y desplegar.
6. Revisar **Deployments → Logs**. Secuencia esperada:

   ```text
   Base de datos verificada correctamente.
   Conexión verificada (sincronización de tablas omitida).
   Usuario admin sembrado/verificado: admin@comandapp.com
   Usuario cocina sembrado/verificado: cocina@comandapp.com
   Servidor iniciado en puerto <asignado>
   ```

7. Anotar la URL pública (`https://<proyecto>.enzonic.dev`) y **volver a desplegar** si `PUBLIC_BASE_URL` se definió después del primer build.
8. Actualizar las variables del front (sección 4.3).
9. **Actions → Deploy front to GitHub Pages → Run workflow** y hacer *hard refresh* en la página publicada.

---

## 6. Verificación E2E

### 6.1 API directa (PowerShell)

```powershell
curl.exe https://<proyecto>.enzonic.dev/capp/health
curl.exe https://<proyecto>.enzonic.dev/capp/pedido/mesas
curl.exe -X POST https://<proyecto>.enzonic.dev/capp/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"correo\":\"admin@comandapp.com\",\"password\":\"admin123\"}'
```

| Prueba | Resultado esperado |
|---|---|
| `GET /` | `200 { "ok": true, "service": "ComandAPP API" }` |
| `GET /capp/health` | `200 { "ok": true, "timestamp": "..." }` |
| `GET /capp/pedido/mesas` | `200` con la lista de mesas activas |
| `POST /capp/auth/login` | `200` con `token` JWT |
| `GET /capp/productos` con `Authorization: Bearer <token>` | `200` con productos |
| `OPTIONS` desde `https://paola1417.github.io` | `Access-Control-Allow-Origin` presente |
| `GET <PUBLIC_BASE_URL>/uploads/<archivo>` | `200 image/*` y visible desde Pages |

### 6.2 Flujo completo desde GitHub Pages

| # | Acción | Criterio de éxito |
|---|---|---|
| 1 | Login `admin@comandapp.com` / `admin123` | Entra al dashboard |
| 2 | Crear categoría | Aparece en el listado |
| 3 | Crear producto con URL de imagen | La imagen se muestra en el menú |
| 4 | Subir imagen por archivo (opcional) | Devuelve `https://.../uploads/...` |
| 5 | Crear mesa y copiar su URL | URL con `#/pedido/<token>` |
| 6 | Abrir la URL en incógnito y pedir | Pedido creado |
| 7 | Ver el pedido en `/cocina` y cambiar estado | Estado actualizado |
| 8 | Revisar `/reportes` | Totales correctos (`DECIMAL` convertido a número) |
| 9 | Regenerar token de la mesa | La URL anterior deja de funcionar |
| 10 | Esperar >15 min y repetir el paso 1 | *Cold start* de ~10–30 s, sin error 500 |

---

## 7. Límites y comportamiento del plan gratuito

| Recurso | Límite free | Impacto |
|---|---|---|
| App Deploy | 512 MB, 1 instancia, duerme tras 15 min sin tráfico | Primer request lento tras inactividad |
| Invocaciones | 2 M/mes · 150 GB/mes | Suficiente para demo/portafolio |
| Logs | 1 día de retención | Revisar tras cada deploy |
| Base de datos | 3 GB, 0.25 vCPU/512 MB, duerme a los 5 min | Despertar lento; el `acquire` de 60 s lo cubre |
| Backups | 1 día | Exportar si hay datos importantes |
| Disco de la app | Efímero | Las imágenes subidas por archivo no persisten |

**Opcional:** un monitor gratuito (cron-job.org, Uptime Kuma) haciendo `GET /capp/health` cada 10 min mantiene app y BD despiertas durante la demo.

---

## 8. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| El proceso no arranca / no responde | No escucha el puerto inyectado | Verificar `PORT`/`SERVER_PORT` en logs; no fijar `PORT` a mano |
| `ER_SECURE_TRANSPORT_REQUIRED` | Falta TLS | `DB_SSL=true` |
| Timeout al conectar | BD dormida | Reintentar; revisar `acquire`/`connectTimeout` |
| Login falla con `admin123` | Contraseña distinta en la BD | Usar la contraseña real o crearla por API/UI |
| `Failed to fetch` / CORS en Pages | Origen bloqueado | Revisar `CORS_ORIGIN` o dejarlo vacío |
| Imágenes no cargan | `PUBLIC_BASE_URL` mal o CORP | URL `https` correcta y Helmet `cross-origin` |
| Imagen subida desaparece | Disco efímero | Usar el campo "URL de imagen" |
| 500 tras inactividad | Conexiones muertas a la BD dormida | Pool/`acquire` ya ajustados; reintentar |
| Front sigue llamando a localhost | Variable `VITE_API_URL` sin re-build | Actualizar variable y re-ejecutar el workflow |

---

## 9. Recomendaciones pendientes

1. **Rotar** la contraseña de MySQL y el `JWT_SECRET` (el `.env` está en git).
2. Sacar `.env` del control de versiones y dejar solo `.env.example`.
3. Evaluar almacenamiento externo para imágenes (Rapidfile/MinIO/Cloudinary) si se necesita persistencia.
4. Actualizar `ComandAPP-Mobile/src/services/api.js` (IP LAN hardcodeada) si el APK debe apuntar a producción.
5. Añadir un ping programado a `/capp/health` para evitar *cold starts* en demos.

---

## 10. Archivos modificados en este cambio

```text
Backend/product-api/src/server.js
Backend/product-api/src/app.js
Backend/product-api/src/config/database.js
Backend/product-api/src/controllers/product.controller.js
Backend/product-api/package.json
Backend/product-api/.env
Backend/product-api/.env.example
Backend/product-api/README.md
resumen.md
```

### Verificación ejecutada en local (contra la BD real de Enzonic)

| Prueba | Resultado |
|---|---|
| Arranque con `DB_SYNC=none` | `Base de datos verificada` → `Conexión verificada` → seeds → `Servidor iniciado` |
| `GET /capp/health` | `200 {"ok":true,...}` |
| `POST /capp/auth/login` (`admin@comandapp.com`) | `200`, JWT válido |
| `GET /capp/productos` con Bearer | `200` |
| `POST /capp/productos/imagen` (multipart `imagen`) | `201` con URL `https://.../uploads/...` |
| Cabeceras CORS / CORP / Cache-Control | `*` / `cross-origin` / `no-store` |

**Commit:** `c87636d` en `main` (repositorio `Paola1417/ComandAPP`).
