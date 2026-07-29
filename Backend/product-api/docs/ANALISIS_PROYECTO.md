# Guía de análisis y aprendizaje del proyecto product-api

Este documento está pensado para que una persona que está empezando en programación pueda entender, de forma clara y ordenada, qué hace un proyecto tipo API de productos, cómo está organizado y por qué se construye así.

> Nota: este archivo sirve como guía pedagógica y explicativa del tipo de proyecto que normalmente se encuentra en un backend como `product-api`. Está escrito para ayudar a comprender la lógica, las librerías y las funciones más comunes, de forma didáctica.

---

## 1. ¿Qué es este proyecto?

Un proyecto como este normalmente es un backend, es decir, la parte del sistema que no ve el usuario directamente, pero que se encarga de recibir solicitudes, procesarlas y devolver respuestas.

En términos simples, un backend hace cosas como:

- recibir una solicitud desde una app o un navegador,
- comprobar si los datos son correctos,
- buscar o guardar información en una base de datos,
- devolver una respuesta clara al cliente.

En un sistema de pedidos o productos, el backend suele encargarse de tareas como:

- listar productos,
- crear un producto nuevo,
- actualizar información,
- eliminar productos,
- buscar productos por nombre o categoría,
- responder con mensajes de error cuando algo falla.

---

## 2. ¿Qué es una API?

Una API (Application Programming Interface) es una interfaz que permite que dos partes de un sistema se comuniquen.

Imagine que usted tiene una tienda y un empleado encargado de atender pedidos. El cliente le habla al empleado y le dice: “Quiero ver los productos” o “Quiero comprar este artículo”. El empleado entiende la solicitud y la procesa. La API hace exactamente eso, pero entre software.

En este caso:

- el cliente puede ser una app web, una app móvil o un navegador,
- la API recibe la solicitud,
- el backend la procesa,
- la API devuelve una respuesta en formato JSON.

### ¿Por qué se usa JSON?

JSON es un formato muy usado para intercambiar información entre aplicaciones porque es fácil de leer tanto para humanos como para máquinas.

Ejemplo:

```json
{
  "id": 1,
  "nombre": "Camiseta",
  "precio": 15000
}
```

Esto permite que el frontend y el backend se compartan información de una forma organizada.

---

## 3. ¿Qué es un backend y por qué se organiza así?

Un backend se organiza en módulos para que sea más fácil de mantener. Cuando un proyecto crece, no conviene tener todo en un único archivo gigante.

Por eso se suele separar en carpetas y archivos con responsabilidades específicas.

### Ejemplo de estructura típica

```text
product-api/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── middlewares/
│   ├── config/
│   └── app.js
├── package.json
├── .env
└── README.md
```

Cada carpeta cumple una función diferente:

- `src/`: es la carpeta principal donde vive el código del negocio.
- `controllers/`: contiene la lógica que decide qué hacer con una solicitud.
- `routes/`: define las URLs a las que se puede acceder.
- `models/`: describe cómo se almacenan y consultan los datos.
- `services/`: contiene lógica más compleja, separada de los controladores.
- `middlewares/`: funciones que se ejecutan antes o después de una petición.
- `config/`: contiene configuraciones como la conexión a la base de datos.
- `app.js`: es el punto de entrada principal del servidor.

---

## 4. ¿Por qué se separan las funciones en archivos distintos?

Porque así el código es más limpio, más fácil de entender y más fácil de modificar.

Si todo el código estuviera junto, sería muy difícil encontrar una parte específica. Por ejemplo, si un error aparece al guardar un producto, no sería fácil saber si el problema está en:

- la URL,
- la validación de datos,
- la base de datos,
- la respuesta que se devuelve al usuario.

La separación ayuda a que cada archivo tenga una sola responsabilidad.

### Regla sencilla

- una ruta define “a dónde” se accede,
- un controlador define “qué pasa”,
- un modelo define “cómo se guarda”,
- un middleware define “qué validar o interceptar”,
- un servicio define “lógica más compleja”.

---

## 5. Librerías que normalmente se usan en este tipo de proyecto

A continuación se explica, de forma sencilla, qué hace cada librería y por qué suele usarse.

### 5.1 Express

Express es una librería muy popular para crear servidores web con Node.js.

#### ¿Para qué sirve?
Sirve para:

- crear rutas,
- manejar peticiones HTTP,
- responder a los clientes,
- organizar el código de un backend.

#### ¿Por qué se usa?
Porque permite crear una API de forma rápida y sencilla. En lugar de trabajar con el servidor de Node.js de forma muy manual, Express nos ofrece herramientas listas para usar.

#### Ejemplo conceptual

```js
app.get('/productos', (req, res) => {
  res.json({ mensaje: 'Lista de productos' });
});
```

Esto significa:

- `app.get(...)`: define una ruta que responde a una solicitud GET.
- `req`: representa la petición que hizo el cliente.
- `res`: representa la respuesta que devolverá el servidor.

---

### 5.2 CORS

CORS es una librería o mecanismo que permite que un frontend de un dominio diferente pueda consumir la API.

#### ¿Para qué sirve?
Por ejemplo, si tu frontend está en una dirección diferente a la API, el navegador podría bloquear la conexión por seguridad. CORS permite autorizar esas peticiones.

#### ¿Por qué se usa?
Porque hoy en día es muy común tener:

- frontend en un puerto diferente,
- backend en otro puerto,
- o incluso en otro servidor.

Sin CORS, el navegador impediría esas solicitudes.

---

### 5.3 dotenv

Dotenv permite leer variables de entorno desde un archivo `.env`.

#### ¿Para qué sirve?
Las variables de entorno guardan datos sensibles o configurables, por ejemplo:

- puertos,
- claves secretas,
- URLs de base de datos,
- tokens de autenticación.

#### ¿Por qué se usa?
Porque no conviene escribir información sensible directamente en el código. El archivo `.env` ayuda a separar la configuración del código fuente.

Ejemplo:

```env
PORT=3000
DB_URL=mongodb://localhost:27017/productos
```

Luego el código puede leerlos de forma segura.

---

### 5.4 Nodemon

Nodemon es una herramienta que reinicia automáticamente el servidor cuando detecta cambios en el código.

#### ¿Para qué sirve?
Durante el desarrollo, normalmente se está modificando el código continuamente. Nodemon evita tener que detener y volver a ejecutar el servidor manualmente cada vez.

#### ¿Por qué se usa?
Porque ahorra tiempo y hace más cómodo el proceso de desarrollo.

---

### 5.5 Mongoose

Mongoose es una librería para trabajar con MongoDB desde Node.js.

#### ¿Para qué sirve?
Permite:

- conectar el backend con MongoDB,
- definir esquemas de datos,
- crear, leer, actualizar y eliminar documentos.

#### ¿Por qué se usa?
Porque facilita mucho la interacción con una base de datos NoSQL y ayuda a estructurar los datos.

#### Ejemplo conceptual

```js
const productoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number
});
```

Esto indica que un producto tendrá un nombre y un precio.

---

### 5.6 Bcrypt

Bcrypt se usa para encriptar contraseñas.

#### ¿Para qué sirve?
Cuando un usuario crea una contraseña, no se debe guardar en texto plano, porque eso sería inseguro.

#### ¿Por qué se usa?
Porque si alguien accede a la base de datos, no encontrará las contraseñas directamente.

---

### 5.7 JSON Web Token (JWT)

JWT se usa para crear tokens de autenticación.

#### ¿Para qué sirve?
Cuando un usuario inicia sesión, el sistema puede generar un token. Ese token sirve como una “credencial” para demostrar que la persona está autenticada.

#### ¿Por qué se usa?
Porque evita que el usuario tenga que ingresar sus credenciales en cada solicitud.

---

## 6. ¿Qué hacen las funciones más comunes en una API?

Aquí explicamos las funciones que suelen aparecer con más frecuencia.

### 6.1 `app.get()`

Se usa para definir una ruta que responde a solicitudes de tipo GET.

#### ¿Qué significa?
Un GET suele usarse para consultar información, por ejemplo:

- obtener todos los productos,
- buscar un producto por ID.

#### Ejemplo

```js
app.get('/productos', (req, res) => {
  res.json({ mensaje: 'Aquí van los productos' });
});
```

---

### 6.2 `app.post()`

Se usa para recibir datos nuevos.

#### ¿Qué significa?
El cliente envía información al servidor para crear algo nuevo. Por ejemplo:

- crear un nuevo producto,
- registrar un usuario,
- guardar un pedido.

#### Ejemplo

```js
app.post('/productos', (req, res) => {
  res.json({ mensaje: 'Producto creado' });
});
```

---

### 6.3 `app.put()`

Se usa para actualizar datos existentes.

#### ¿Qué significa?
Por ejemplo:

- cambiar el precio de un producto,
- modificar el nombre de una categoría.

---

### 6.4 `app.delete()`

Se usa para borrar datos.

#### ¿Qué significa?
Por ejemplo:

- borrar un producto,
- eliminar un pedido.

---

## 7. ¿Qué significan `req`, `res` y `next`?

Estas palabras son muy comunes en Express.

### `req`
Representa la solicitud del cliente.

Contiene información como:

- datos enviados por el usuario,
- parámetros de la URL,
- headers,
- cookies,
- query strings.

### `res`
Representa la respuesta que el servidor preparará para enviar al cliente.

Con `res` se puede:

- devolver JSON,
- devolver un estado HTTP,
- enviar un mensaje de error.

### `next`
Se usa para pasar el control a la siguiente función.

Por ejemplo, si hay un middleware que valida si el usuario está autenticado, puede ejecutar alguna lógica y luego llamar a `next()` para seguir con la siguiente parte.

---

## 8. ¿Qué son los middlewares?

Un middleware es una función intermedia que se ejecuta en el camino de una solicitud.

### Ejemplo de propósito
Un middleware puede:

- validar datos,
- revisar si el usuario está autenticado,
- registrar la petición en consola,
- verificar permisos.

### ¿Por qué se usan?
Porque permiten reutilizar lógica en varias rutas.

Por ejemplo, si todas las rutas de administración necesitan validar el token, en lugar de repetir esa lógica en cada ruta se puede usar un middleware.

---

## 9. ¿Qué es una ruta?

Una ruta es la dirección a la que se accede desde la API.

Ejemplos:

```text
GET /productos
POST /productos
GET /productos/:id
PUT /productos/:id
DELETE /productos/:id
```

### ¿Por qué son importantes?
Porque definen la estructura del sistema. El cliente sabe qué URL debe usar para cada acción.

---

## 10. ¿Qué es un controlador?

El controlador es donde se procesa la lógica de una ruta.

Por ejemplo:

- recibir datos,
- validar,
- llamar a una función de negocio,
- devolver una respuesta.

### Ejemplo conceptual

```js
function crearProducto(req, res) {
  const producto = req.body;
  res.json({ mensaje: 'Producto recibido', producto });
}
```

Aquí el controlador:

- recibe el producto desde el cuerpo de la solicitud,
- lo prepara,
- y devuelve una respuesta.

---

## 11. ¿Qué es un modelo?

Un modelo representa la estructura de un dato.

Por ejemplo, en un sistema de productos, un modelo puede indicar que un producto tiene:

- nombre,
- precio,
- stock,
- categoría.

### ¿Por qué es útil?
Porque ayuda a dar consistencia a la información y a que el sistema sepa cómo tratar los datos.

---

## 12. ¿Qué hace el flujo completo de una petición?

Aquí vemos cómo normalmente funciona una solicitud en una API.

### Flujo paso a paso

1. El cliente envía una petición a una URL.
2. El servidor recibe la solicitud.
3. La ruta decide qué controlador debe ejecutar.
4. El controlador interpreta los datos.
5. El controlador puede llamar a un servicio o modelo.
6. El modelo o servicio interactúa con la base de datos.
7. El sistema prepara una respuesta.
8. El servidor devuelve esa respuesta al cliente.

### Ejemplo

El cliente pide:

```text
GET /productos/1
```

El sistema puede hacer lo siguiente:

- encontrar el producto con ID 1,
- preparar la respuesta,
- devolverlo en formato JSON.

---

## 13. ¿Por qué se usan variables de entorno?

Porque el código no debe depender de valores fijos que cambian según el ambiente.

Por ejemplo:

- un servidor de desarrollo usa un puerto diferente al de producción,
- la base de datos puede cambiar,
- las claves secretas no deben quedar expuestas.

Por eso se usan archivos `.env` o configuraciones externas.

---

## 14. ¿Cómo se escribe código limpio en un backend?

Al programar un backend es importante pensar en:

- claridad,
- organización,
- reutilización,
- seguridad,
- mantenimiento.

### Buenas prácticas

- separar responsabilidades,
- nombrar funciones y variables con sentido,
- evitar repetir código,
- validar datos antes de guardarlos,
- no guardar contraseñas en texto plano,
- usar mensajes claros de error,
- documentar las rutas.

---

## 15. ¿Qué diferencia hay entre frontend y backend?

### Frontend
Es la parte que ven los usuarios.

Por ejemplo:

- páginas web,
- botones,
- formularios,
- listas,
- pantallas interactivas.

### Backend
Es la parte que procesa la lógica.

Por ejemplo:

- guardar datos,
- buscar productos,
- enviar respuestas,
- verificar usuarios.

### Analogía simple
- el frontend es el mostrador de la tienda,
- el backend es la cocina y el almacén.

---

## 16. ¿Por qué aprender esto es importante?

Aprender a leer un proyecto backend ayuda a:

- entender cómo se construyen sistemas reales,
- comprender cómo se comunican frontend y backend,
- aprender a depurar errores,
- mejorar como programador,
- trabajar mejor en equipos.

Además, este tipo de proyectos permiten aprender conceptos fundamentales como:

- rutas,
- controladores,
- bases de datos,
- autenticación,
- validación,
- servicios,
- middleware,
- HTTP.

---

## 17. Resumen final

Un proyecto como `product-api` normalmente sirve para gestionar productos a través de una API.

Su funcionamiento se basa en:

- recibir solicitudes,
- procesarlas,
- consultar o guardar datos,
- devolver respuestas.

Las librerías más comunes como Express, CORS, dotenv, Mongoose o JWT ayudan a:

- crear rutas,
- manejar peticiones,
- conectar con bases de datos,
- proteger información,
- organizar el proyecto.

La idea central es separar responsabilidades para que el sistema sea más ordenado, claro y fácil de mantener.

---

## 18. Glosario rápido

- API: interfaz que permite comunicar aplicaciones.
- Backend: parte del sistema que procesa la lógica.
- Frontend: parte visible para el usuario.
- Ruta: dirección o endpoint que recibe una solicitud.
- Middleware: función intermedia entre la petición y la respuesta.
- Controlador: lugar donde se organiza la lógica de una ruta.
- Modelo: estructura de un dato.
- DTO/Schema: forma de definir datos.
- Request (`req`): petición entrante.
- Response (`res`): respuesta saliente.
- `next()`: continuar con la siguiente función.

---

## 19. Consejos para estudiar este proyecto

Si quieres aprender bien este tipo de proyecto, te recomiendo:

1. abrir cada carpeta por separado,
2. leer primero el archivo principal del servidor,
3. identificar las rutas,
4. ver qué controlador se ejecuta,
5. entender qué modelo o base de datos utiliza,
6. revisar si hay middlewares o validaciones,
7. probar cada endpoint con una herramienta como Postman o Insomnia,
8. comparar el flujo con la lógica del negocio.

---

## 20. Conclusión

Entender un proyecto de backend no es solo saber escribir código; también es saber leerlo, analizarlo y comprender por qué está organizado de esa manera.

Estas estructuras se usan porque hacen que el software sea:

- más mantenible,
- más escalable,
- más seguro,
- más fácil de aprender y modificar.

Si aprendes a leer primero el flujo del proyecto, luego será mucho más sencillo entender cada archivo, cada librería y cada función.

---

