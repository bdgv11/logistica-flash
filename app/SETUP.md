# Logística Flash — puesta en marcha

Esta app es HTML/CSS/JS estático (sin paso de build) respaldado por
[Supabase](https://supabase.com) para la base de datos y el login de los 2
administradores.

## 1. Crear el proyecto en Supabase

1. Crea una cuenta gratis en https://supabase.com y un nuevo proyecto.
2. Anota el **Project URL** y la **anon public key** (Project Settings → API).
   Los vas a necesitar en el paso 4.

## 2. Crear las tablas

1. En el panel de Supabase, ve a **SQL Editor → New query**.
2. Pega el contenido completo de [`schema.sql`](./schema.sql) y ejecútalo.
   Esto crea las tablas `clients`, `messengers`, `packages`, sus índices, y las
   políticas de seguridad (Row Level Security) que solo permiten leer/escribir
   a usuarios que iniciaron sesión.
3. (Opcional) Si quieres datos de ejemplo para probar la app, descomenta y
   ejecuta el bloque `insert` al final del archivo — hazlo solo en una base
   vacía, una sola vez.

## 3. Crear los 2 usuarios administradores

1. Ve a **Authentication → Users → Add user** (crea usuario manualmente).
2. Crea una cuenta para cada una de las 2 personas que administran el negocio,
   con su correo y una contraseña. Marca "Auto Confirm User" para que puedan
   entrar de inmediato sin verificar el correo.
3. No hay pantalla de registro público en la app — solo estas 2 cuentas
   (o las que tú agregues aquí) pueden iniciar sesión.

## 4. Configurar la app

Abre [`js/config.js`](./js/config.js) y reemplaza los valores de ejemplo con
los de tu proyecto:

```js
window.APP_CONFIG = {
  SUPABASE_URL: 'https://tu-proyecto.supabase.co',
  SUPABASE_ANON_KEY: 'tu-anon-public-key',
};
```

La "anon public key" está pensada para usarse en el navegador — es segura de
publicar porque las políticas de RLS del paso 2 son las que realmente
controlan el acceso a los datos.

## 5. Probarla localmente

Cualquier servidor estático sirve, por ejemplo:

```bash
cd app
python3 -m http.server 8080
```

Abre http://localhost:8080 e inicia sesión con uno de los usuarios del paso 3.

## 6. Publicarla

Sube la carpeta `app/` (tal cual, sin build) a cualquier hosting estático:
Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc. No necesitas backend
propio — Supabase es el backend.

## 7. (Opcional) Rutas optimizadas con Google Maps

Por defecto, "Lista del día" ya ordena las paradas de cada mensajero por
distancia en línea recta desde su punto de salida — gratis, sin configurar
nada. Este paso es solo si además quieren que el botón "Optimizar ruta con
Google Maps" use calles reales (Google Routes API) en vez de línea recta.
Si no lo hacen, el botón simplemente muestra un error y el resto de la app
sigue funcionando igual — no es necesario para usar Logística Flash.

Necesita 3 cosas que solo ustedes pueden crear (yo no tengo acceso a su
cuenta de Google ni a su proyecto de Supabase):

1. **Cuenta de Google Cloud** (https://console.cloud.google.com) con
   facturación activada, y la **Routes API** habilitada (Library → busca
   "Routes API" → Enable). Crea una API key (Credentials → Create
   Credentials → API key) y restríngela a la Routes API solamente (API
   restrictions). Con el volumen de esta app (una optimización por ruta al
   día, como mucho) el costo se queda dentro del cupo gratis mensual que da
   Google.
2. **Supabase CLI** instalado y logueado con acceso a este proyecto
   (https://supabase.com/docs/guides/cli):
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref TU-PROJECT-REF
   ```
   Si el CLI pide inicializar el proyecto primero, corre `supabase init`
   antes del `link` (crea un `supabase/config.toml` — no toca nada de lo
   que ya está en `supabase/functions/`).
3. Desde la carpeta `app/`, desplegar la función y guardar la API key como
   *secret* (nunca se guarda en el código del navegador):
   ```bash
   supabase functions deploy optimize-route
   supabase secrets set GOOGLE_MAPS_API_KEY=tu-api-key
   ```

Con eso listo, el botón empieza a funcionar solo — no hace falta ningún
cambio más en la app.

## Notas de diseño / decisiones tomadas

- **Multi-dispositivo real**: ambas administradoras ven los mismos clientes,
  paquetes y mensajeros sin importar desde qué celular o computadora entren —
  los datos viven en Supabase, no en el navegador.
- **Login real**: el usuario/contraseña se valida en el servidor de Supabase,
  no hay contraseña visible en el código fuente como en el prototipo original.
- **Casi sin funciones "serverless" propias**: toda la lógica de negocio
  (cálculo de costo, armado del mensaje de WhatsApp, mensajero según zona,
  etc.) vive en `js/app.js` y llama directo a Supabase — no hay servidor
  intermedio que mantener. La única excepción es
  `supabase/functions/optimize-route` (paso 7, opcional): la API key de
  Google no puede vivir en el navegador, así que esa única llamada pasa por
  una Edge Function que solo la sostiene y reenvía la respuesta — nada de
  lógica de negocio ahí tampoco.

## Algo que vale la pena revisar con el equipo

Quitar un paquete de la ruta (el basurero en "Lista del día") ya no lo deja
huérfano — vuelve a "Identificados — en tránsito" con el mismo cliente, y
cualquier cambio (monto, cliente, etc.) se hace desde ahí con el flujo
normal de edición.

El único caso que todavía puede dejar un paquete sin cliente es eliminar un
cliente que tiene paquetes activos (el diálogo de confirmación ya avisa de
esto). Ese contador aparece en "Sin identificar" en Inicio, pero no hay
pantalla para reasignarle un cliente desde la interfaz — es un caso raro
(requiere borrar un cliente a propósito), pero si les llega a pasar en la
práctica, avísenme y agrego una forma sencilla de retomarlos.
