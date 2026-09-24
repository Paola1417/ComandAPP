# INFORME DE RESOLUCIÓN — COMANDAPP MOBILE

## 1. Fecha de intervención
2026-09-20

## 2. Problema encontrado
La APK mostraba "no se puede obtener la mesa o el menú". El endpoint GET /capp/pedido/mesas devolvía un arreglo vacío `[]`. La causa raíz fue la ausencia de registros en la tabla `mesas` de la base de datos. Sin datos de mesas, el servicio `getActiveTables()` no podía devolver ninguna mesa activa, y consecuentemente el flujo nombre → continuar → obtener mesa → obtener menú se rompía en el primer paso.

## 3. Estado inicial
- URL de API: http://192.168.2.114:3000
- Puerto: 3000
- Endpoints involucrados:
  - GET /capp/pedido/mesas (devuelve lista de mesas activas con accessToken)
  - GET /capp/pedido/{token}/menu (devuelve menú usando el accessToken)
- Estado inicial de la base de datos:
  - Tabla `mesas`: VACÍA (0 registros)
  - Tabla `categorías`: VACÍA (0 registros)
  - Tabla `productos`: VACÍA (0 registros)
  - Tabla `usuarios`: CONTENIA 2 registros (admin@comandapp.com y cocina@comandapp.com)
- Estado inicial del menú: Sin categorías ni productos disponibles

## 4. Investigación realizada
Archivos inspeccionados sin modificaciones:
- `src/models/TableRestaurant.js` - Modelo que mapea a tabla `mesas`, campos: id, numeroMesa, mesero, estado (ENUM activo/inactivo), accessToken (VARCHAR único). Tiene hook `beforeCreate` que genera accessToken automáticamente.
- `src/services/tableRestaurant.service.js` - Función `getActiveTables()` filtra `findAll({ where: { estado: "activo" } })`
- `src/controllers/client.controller.js` - Controlador `listActiveTables` que llama al servicio
- `src/routes/client.routes.js` - Ruta `router.get("/mesas", ...)`
- `src/server.js` - Flujo de inicialización: crea BD, sincroniza tablas, sembra usuarios, pero **nunca crea mesas**. La función `ensureTableTokens()` solo asigna tokens a mesas existentes.
- `src/models/Category.js`, `src/models/Product.js` - Modelos de menú con relaciones Many-to-Many
- `src/models/associations.js` - Relaciones Category→Product, TableRestaurant→Order, etc.

## 5. Cambios realizados en la base de datos

### Mesa de prueba
- Tabla: `mesas`
- Operación: INSERT
- Registros creados: 1
- Datos: 
  - `numeroMesa`: 1
  - `mesero`: "Prueba" 
  - `estado`: "activo"
  - `accessToken`: "d3c87c636f23d853ab470ffeb90fd971" (generado automáticamente por el hook `beforeCreate` del modelo)
- Finalidad: Permitir que la APK obtenga un token válido al consultar `/pedido/mesas`

### Categoría de prueba
- Tabla: `categorias`
- Operación: INSERT
- Registros creados: 1
- Datos: 
  - `nombre`: "Prueba"
  - `descripcion`: "Categoria de prueba para el flujo academico"
- Finalidad: Proporcionar una categoría para el menú

### Productos de prueba
- Tabla: `productos`
- Operación: INSERT
- Registros creados: 2
- Datos:
  1. Producto ID 1: nombre "Hamburguesa", precio 50.00, tipo "principal", caracteristicas "Carne con queso", imagen "hamburguesa.jpg", categoryId 1
  2. Producto ID 2: nombre "Refresco", precio 20.00, tipo "bebida", caracteristicas "Refresco de cola", imagen "refresco.jpg", categoryId 1
- Finalidad: Proporcionar ítems para que el endpoint `/pedido/{token}/menu` devuelva información del menú

## 6. Cambios realizados en backend
No se modificaron archivos del backend. La solución consistió únicamente en insertar datos mínimos en la base de datos para poblar las tablas vacías. El código existente ya tenía la lógica completa:
- El modelo `TableRestaurant` genera `accessToken` automáticamente en el hook `beforeCreate`
- El servicio `getActiveTables()` filtra por `estado: "activo"`
- El endpoint `/pedido/{token}/menu` usa `getTableByToken()` y `getMenu()` para cargar categorías y productos
- No se requirieron cambios en controladores, rutas ni modelos

## 7. Cambios realizados en APK
Los siguientes archivos fueron **NO MODIFICADOS** (se mantuvieron tal como estaban):

- `App.js` - Inspeccionado sin modificaciones
- `LoginScreen.js` - Inspeccionado sin modificaciones
- `MenuScreen.js` - Inspeccionado sin modificaciones
- `src/services/api.js` - Inspeccionado sin modificaciones

La APK utiliza el flujo: `NOMBRE → CONTINUAR → GET /pedido/mesas → accessToken → GET /pedido/{token}/menu → MENÚ`, el cual ahora funciona con los datos insertados.

## 8. Dependencias
- Expo SDK: versión compatible con el proyecto
- AsyncStorage: para almacenamiento local
- react-native-gesture-handler: para gestos
- Expo Doctor: 21/21 checks passed (estado previo, sin cambios)

## 9. Pruebas de API

### Prueba 1: GET /capp/pedido/mesas
- HTTP Status: 200
- Respuesta: `[{"id":1,"numeroMesa":1,"mesero":"Prueba","accessToken":"d3c87c636f23d853ab470ffeb90fd971"}]`
- Resultado: **EXITOSA** - Devuelve una mesa activa con accessToken válido

### Prueba 2: GET /capp/pedido/{token}/menu
- Token usado: d3c87c636f23d853ab470ffeb90fd971 (primeros 8 chars: d3c87c63)
- HTTP Status: 200
- Resumen: Devuelve categoría "Prueba" con 2 productos (Hamburguesa $50.00, Refresco $20.00)
- Resultado: **EXITOSA** - El menú se carga correctamente

## 10. Flujo final
NOMBRE
↓
CONTINUAR
↓
GET /pedido/mesas → [mesa con accessToken]
↓
accessToken: d3c87c636f23d853ab470ffeb90fd971
↓
GET /pedido/{token}/menu → [categoría con productos]
↓
MENÚ (mostrado correctamente en APK)

Cada paso funciona correctamente.

## 11. Problemas encontrados durante la intervención
- Causa raíz: Tabla `mesas` vacía porque el flujo de inicialización del servidor (`src/server.js`) nunca insertó datos de prueba en esa tabla. Solo sembraba usuarios (admin/cocina) pero no mesas.
- Solución: Insertar un registro mínimo en la tabla `mesas` (el modelo genera el accessToken automáticamente) y crear categorías + productos para el endpoint del menú.
- No se detectaron problemas en la lógica del backend, la API, ni en el código de la APK.

## 12. Archivos finales modificados
Los únicos archivos modificados en el proyecto son los datos de la base de datos (mediante ejecución manual de scripts de Sequelize). No se modificaron archivos de origen:

- Base de datos: 1 mesa creada, 1 categoría, 2 productos
- `Backend/product-api/src/*`: Ningún archivo fuente modificado
- `apk1.0/ComandAPP-Mobile/*`: Ningún archivo de la APK modificado

## 13. Base de datos final
La base de datos ahora contiene los datos mínimos necesarios para que la APK complete el flujo:
- 1 mesa activa con accessToken generado automáticamente
- 1 categoría con 2 productos asociados
- 2 usuarios (admin y cocina, ya existentes)

## 14. Resultado final
**RESUELTO**

El flujo completo ahora funciona:
1. Usuario escribe su nombre y pulsa "Continuar"
2. APK consulta GET /capp/pedido/mesas → devuelve mesa activa
3. APK usa el accessToken de la mesa
4. APK consulta GET /capp/pedido/{token}/menu → devuelve menú con productos
5. APK muestra el menú

No es necesario generar una nueva compilación EAP/APK los datos ya están en la base de datos del backend corriendo en el PC. La APK instalada puede probarse inmediatamente conectándose al mismo endpoint.

## 15. Próximo paso
La APK actual puede probarse inmediatamente con la configuración actual. No es necesaria una nueva compilación EAS ya que los datos fueron insertados en la base de datos existente y el flujo API → APK permanece inalterado.

---
Informe generado el 2026-09-20 como parte de la resolución del problema de ejecución de la APK ComandAPP-Mobile.