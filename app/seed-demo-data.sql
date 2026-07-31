-- Logística Flash — datos de prueba
-- Corre esto una sola vez en Supabase (Project > SQL Editor > New query).
-- Crea: 3 mensajeros (uno por zona), 10 clientes (uno sin cobertura de
-- mensajero, a propósito, para probar ese caso) y 16 paquetes repartidos
-- en todos los estados posibles, para poder probar cada pantalla:
--   - En Tránsito / Pre-alerta (con cliente y sin cliente)
--   - En Bodega — Falta info (con cliente y sin cliente)
--   - En Bodega — Por entregar (listos para asignar, incluye uno sin
--     mensajero para su zona, para ver ese botón deshabilitado)
--   - En ruta (ya asignados a un mensajero, sin entregar)
--   - Entregado — Debe (entregado pero sin cobrar, marcado en amarillo)
--   - Historial (ya pagados, con fechas repartidas en las últimas semanas
--     para probar los filtros y el total del mes en Inicio)
--
-- No borra nada, solo agrega — corre sin problema aunque ya tengas
-- mensajeros o clientes reales cargados. Pero no lo corras dos veces
-- seguidas: no valida duplicados, así que la segunda corrida te deja
-- todo el nombre repetido. Si ya corriste reset-data.sql antes, esto te
-- deja la app lista para probar de una vez.

-- ── Mensajeros ────────────────────────────────────────────────────────────
insert into public.messengers (name, phone, origin, zones) values
  ('Kevin Mora Salas',        '8811-2233', 'https://maps.google.com/?q=9.9281,-84.0907',  array['San José']),
  ('Diego Vindas Chinchilla', '8822-3344', 'https://maps.google.com/?q=10.0028,-84.1165', array['Heredia']),
  ('Andrés Solano Rojas',     '8833-4455', 'https://maps.google.com/?q=10.0163,-84.2115', array['Alajuela']);

-- ── Clientes ──────────────────────────────────────────────────────────────
-- El código (JG-01, JG-02, ...) se asigna solo, en el orden en que se
-- insertan estas filas.
insert into public.clients (name, phone, address, province, canton) values
  ('María Fernández Jiménez',  '8801-0001', 'https://maps.google.com/?q=9.9281,-84.0907',  'San José', 'San José'),
  ('Carlos Rodríguez Vargas',  '8801-0002', 'https://maps.google.com/?q=9.9189,-84.1449',  'San José', 'Escazú'),
  ('Ana Lucía Chacón Solís',   '8801-0003', 'https://maps.google.com/?q=9.9167,-84.0333',  'San José', 'Curridabat'),
  ('Esteban Campos Rojas',     '8801-0004', 'https://maps.google.com/?q=10.0028,-84.1165', 'Heredia',  'Heredia'),
  ('Gabriela Sánchez Ortiz',   '8801-0005', 'https://maps.google.com/?q=10.0333,-84.1167', 'Heredia',  'Barva'),
  ('Rodrigo Alvarado Miranda', '8801-0006', 'https://maps.google.com/?q=9.9833,-84.0917',  'Heredia',  'Santo Domingo'),
  ('Melissa Vargas Cordero',   '8801-0007', 'https://maps.google.com/?q=10.0163,-84.2115', 'Alajuela', 'Alajuela'),
  ('Randall Quesada Brenes',   '8801-0008', 'https://maps.google.com/?q=10.0930,-84.4761', 'Alajuela', 'San Ramón'),
  ('Silvia Elena Mata Rojas',  '8801-0009', 'https://maps.google.com/?q=10.0725,-84.3128', 'Alajuela', 'Grecia'),
  -- Puntarenas no tiene mensajero asignado — a propósito, para ver el botón
  -- "Sin mensajero para su zona" deshabilitado en Registrar paquete.
  ('Óscar Andrey Zúñiga Porras','8801-0010', 'https://maps.google.com/?q=9.9833,-84.8333', 'Puntarenas', 'Puntarenas');

-- ── Paquetes ──────────────────────────────────────────────────────────────

-- En Tránsito / Pre-alerta — avisado, sin llegar todavía.
insert into public.packages (tracking, weight, cost, client_id, arrived) values
  ('TBA9PRE001', null, null, (select id from public.clients where phone = '8801-0001'), false),
  ('TBA9PRE002', null, null, (select id from public.clients where phone = '8801-0002'), false);
-- Sin cliente y sin llegar — nada más se guardó el tracking.
insert into public.packages (tracking, weight, cost, client_id, arrived) values
  ('TBA9PRE003', null, null, null, false);

-- En Bodega — Falta info (llegó físicamente pero falta peso/costo, o
-- cliente, antes de poder asignarse a un mensajero).
insert into public.packages (tracking, weight, cost, client_id, arrived, assigned_date) values
  ('TBA9FALTA001', null, null, (select id from public.clients where phone = '8801-0003'), true, current_date),
  ('TBA9FALTA002', 2.3, 9.78, null, true, current_date); -- Desconocido, ya en bodega

-- En Bodega — Por entregar (info completa, esperando que alguien le dé
-- "Asignar al mensajero").
insert into public.packages (tracking, weight, cost, client_id, arrived, assigned_date) values
  ('TBA9LISTO001', 3.5, 14.88, (select id from public.clients where phone = '8801-0004'), true, current_date),
  ('TBA9LISTO002', 5.1, 21.68, (select id from public.clients where phone = '8801-0005'), true, current_date),
  ('TBA9SINMSGR01', 1.8, 7.65, (select id from public.clients where phone = '8801-0010'), true, current_date);

-- En ruta — ya asignados a un mensajero, todavía sin entregar.
insert into public.packages (tracking, weight, cost, client_id, arrived, assigned_date, routed, routed_date) values
  ('TBA9RUTA001', 4.2, 17.85, (select id from public.clients where phone = '8801-0006'), true, current_date - 1, true, current_date),
  ('TBA9RUTA002', 2.7, 11.48, (select id from public.clients where phone = '8801-0007'), true, current_date - 1, true, current_date),
  ('TBA9RUTA003', 6.0, 25.50, (select id from public.clients where phone = '8801-0008'), true, current_date - 1, true, current_date);

-- Entregado — Debe: el mensajero ya lo entregó pero el cliente todavía no
-- paga. Se queda visible en Lista del día, marcado en amarillo.
insert into public.packages (tracking, weight, cost, client_id, arrived, assigned_date, routed, routed_date, delivered, delivered_date) values
  ('TBA9DEBE001', 3.0, 12.75, (select id from public.clients where phone = '8801-0009'), true, current_date - 2, true, current_date - 1, true, current_date);

-- Historial — ya entregados y pagados, fechas repartidas en las últimas
-- semanas para poder probar los filtros y el "Total entregado este mes".
insert into public.packages (tracking, weight, cost, client_id, arrived, assigned_date, routed, routed_date, delivered, delivered_date, sent, sent_date) values
  ('TBA9HIST001', 3.5, 14.88, (select id from public.clients where phone = '8801-0001'), true, current_date - 4, true, current_date - 4, true, current_date - 3, true, current_date - 3),
  ('TBA9HIST002', 1.9, 8.08,  (select id from public.clients where phone = '8801-0002'), true, current_date - 11, true, current_date - 11, true, current_date - 10, true, current_date - 10),
  ('TBA9HIST003', 4.4, 18.70, (select id from public.clients where phone = '8801-0004'), true, current_date - 21, true, current_date - 21, true, current_date - 20, true, current_date - 20),
  ('TBA9HIST004', 2.2, 9.35,  (select id from public.clients where phone = '8801-0005'), true, current_date - 36, true, current_date - 36, true, current_date - 35, true, current_date - 35);
