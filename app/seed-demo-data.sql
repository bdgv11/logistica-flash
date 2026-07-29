-- Logística Flash — datos de prueba para una prueba con volumen real
-- Corre esto una sola vez en Supabase (Project > SQL Editor > New query).
-- Crea: 4 mensajeros (uno por zona), 20 clientes repartidos en esas 4
-- zonas, y ~26 paquetes ya identificados con esos clientes (algunos
-- marcados como "llegado hoy" -> aparecen en Lista del día; el resto queda
-- en "Identificados — en tránsito", esperando llegar).
--
-- No borra nada, solo agrega — corre sin problema aunque ya tengas
-- mensajeros o clientes reales cargados. Pero no lo corras dos veces
-- seguidas: no valida duplicados, así que la segunda corrida te deja
-- 8 mensajeros y 40 clientes repitiendo estos mismos nombres.
-- Si ya corriste reset-data.sql antes, esto te deja la app lista para
-- probar con una cantidad realista de clientes/paquetes en el momento.

-- ── Mensajeros ────────────────────────────────────────────────────────────
insert into public.messengers (name, phone, origin, zones) values
  ('Kevin Mora Salas',        '8811-2233', 'https://maps.google.com/?q=9.9281,-84.0907',  array['San José']),
  ('Diego Vindas Chinchilla', '8822-3344', 'https://maps.google.com/?q=10.0028,-84.1165', array['Heredia']),
  ('Andrés Solano Rojas',     '8833-4455', 'https://maps.google.com/?q=10.0163,-84.2115', array['Alajuela']),
  ('Fabián Jiménez Ureña',    '8844-5566', 'https://maps.google.com/?q=9.8644,-83.9194',  array['Cartago']);

-- ── Clientes + paquetes ───────────────────────────────────────────────────
with new_clients as (
  insert into public.clients (name, phone, address, province, canton) values
    ('María Fernández Jiménez',        '8801-0001', 'https://maps.google.com/?q=9.9281,-84.0907',  'San José', 'San José'),
    ('Carlos Rodríguez Vargas',        '8801-0002', 'https://maps.google.com/?q=9.9189,-84.1449',  'San José', 'Escazú'),
    ('Ana Lucía Chacón Solís',         '8801-0003', 'https://maps.google.com/?q=9.9167,-84.0333',  'San José', 'Curridabat'),
    ('Luis Diego Araya Mora',          '8801-0004', 'https://maps.google.com/?q=9.8975,-84.0669',  'San José', 'Desamparados'),
    ('Karla Vanessa Bolaños Núñez',    '8801-0005', 'https://maps.google.com/?q=9.9639,-84.0500',  'San José', 'Moravia'),
    ('Esteban Campos Rojas',           '8801-0006', 'https://maps.google.com/?q=10.0028,-84.1165', 'Heredia',  'Heredia'),
    ('Gabriela Sánchez Ortiz',         '8801-0007', 'https://maps.google.com/?q=10.0333,-84.1167', 'Heredia',  'Barva'),
    ('Rodrigo Alvarado Miranda',       '8801-0008', 'https://maps.google.com/?q=9.9833,-84.0917',  'Heredia',  'Santo Domingo'),
    ('Paola Guzmán Herrera',           '8801-0009', 'https://maps.google.com/?q=10.0333,-84.0833', 'Heredia',  'San Rafael'),
    ('Josué Ramírez Castro',           '8801-0010', 'https://maps.google.com/?q=9.9833,-84.1667',  'Heredia',  'Belén'),
    ('Melissa Vargas Cordero',         '8801-0011', 'https://maps.google.com/?q=10.0163,-84.2115', 'Alajuela', 'Alajuela'),
    ('Randall Quesada Brenes',         '8801-0012', 'https://maps.google.com/?q=10.0930,-84.4761', 'Alajuela', 'San Ramón'),
    ('Silvia Elena Mata Rojas',        '8801-0013', 'https://maps.google.com/?q=10.0725,-84.3128', 'Alajuela', 'Grecia'),
    ('Jonathan Pérez Salazar',         '8801-0014', 'https://maps.google.com/?q=9.9781,-84.3800',  'Alajuela', 'Atenas'),
    ('Natalia Cruz Barquero',          '8801-0015', 'https://maps.google.com/?q=10.0975,-84.3831', 'Alajuela', 'Naranjo'),
    ('Marco Vinicio Fallas Solano',    '8801-0016', 'https://maps.google.com/?q=9.8644,-83.9194',  'Cartago',  'Cartago'),
    ('Priscilla Monge Vega',           '8801-0017', 'https://maps.google.com/?q=9.8419,-83.8636',  'Cartago',  'Paraíso'),
    ('Daniel Esteban Villalobos Rojas','8801-0018', 'https://maps.google.com/?q=9.9167,-83.9833',  'Cartago',  'La Unión'),
    ('Yendry Chaves Alfaro',           '8801-0019', 'https://maps.google.com/?q=9.8833,-83.8667',  'Cartago',  'Oreamuno'),
    ('Óscar Andrey Zúñiga Porras',     '8801-0020', 'https://maps.google.com/?q=9.8167,-83.9333',  'Cartago',  'El Guarco')
  returning id
),
numbered as (
  select id, row_number() over () as rn from new_clients
),
rate as (
  select coalesce((select rate_per_lb from public.app_settings where id = 1), 4.25) as rate_per_lb
),
-- Cada cliente recibe 1 paquete; 1 de cada 3 recibe un segundo paquete
-- (para simular clientes con varios paquetes el mismo día). El primer
-- paquete de cada cliente queda marcado "llegado hoy" (sale en Lista del
-- día); el segundo, si existe, queda esperando llegada. MATERIALIZED
-- fuerza a que el peso aleatorio se calcule una sola vez por fila (si no,
-- Postgres puede evaluar random() una sola vez para toda la consulta).
expanded as materialized (
  select
    n.id as client_id,
    n.rn,
    g as pkg_num,
    round((1 + random() * 7)::numeric, 1) as weight
  from numbered n
  cross join lateral generate_series(1, case when n.rn % 3 = 0 then 2 else 1 end) as g
)
insert into public.packages (tracking, weight, cost, client_id, arrived, assigned_date)
select
  'TBA9' || lpad((e.rn * 10 + e.pkg_num)::text, 6, '0'),
  e.weight,
  round(e.weight * r.rate_per_lb, 2),
  e.client_id,
  (e.pkg_num = 1),
  case when e.pkg_num = 1 then current_date else null end
from expanded e
cross join rate r;
