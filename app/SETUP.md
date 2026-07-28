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

## Notas de diseño / decisiones tomadas

- **Multi-dispositivo real**: ambas administradoras ven los mismos clientes,
  paquetes y mensajeros sin importar desde qué celular o computadora entren —
  los datos viven en Supabase, no en el navegador.
- **Login real**: el usuario/contraseña se valida en el servidor de Supabase,
  no hay contraseña visible en el código fuente como en el prototipo original.
- **Sin funciones "serverless" propias**: toda la lógica de negocio (cálculo
  de costo, armado del mensaje de WhatsApp, mensajero según zona, etc.) vive
  en `js/app.js` y llama directo a Supabase — no hay servidor intermedio que
  mantener.

## Algo que vale la pena revisar con el equipo

En el diseño final (ver `chats/chat1.md`), un paquete se crea **siempre**
con un cliente ya asignado — no existe una pantalla para volver a
identificar un paquete que quedó "sin cliente" (por ejemplo, tras usar el
botón de basurero en "Lista del día" para quitarlo de la ruta, o alguno de
los paquetes de ejemplo). Esos paquetes solo se cuentan en el contador
"Sin identificar" de Inicio, pero no hay manera de volver a asignarles un
cliente desde la interfaz — quedan huérfanos. Lo implementé tal cual quedó
en el diseño, pero si les va a pasar en la práctica (se equivocan y quitan un
paquete de la ruta), avísenme y agrego una forma sencilla de retomarlos.
