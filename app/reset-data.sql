-- Logística Flash — borrar toda la data de prueba
-- Corre esto una sola vez en Supabase (Project > SQL Editor > New query)
-- cuando ya terminaste de probar y quieras arrancar limpio con clientes,
-- mensajeros y paquetes reales.
--
-- Borra: paquetes, clientes y mensajeros.
-- NO toca: app_settings (tu tarifa por libra y tipo de cambio quedan igual)
-- NO toca: los usuarios de acceso (admin@... en Supabase Auth) — ese login
-- sigue funcionando igual después de correr esto.
--
-- ADVERTENCIA: esto es irreversible. No hay "deshacer".

truncate table public.packages, public.clients, public.messengers restart identity cascade;
