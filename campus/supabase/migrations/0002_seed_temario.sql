-- ============================================================
-- Temario real del curso · estructura del boceto de la landing,
-- con los submódulos de 6, 7 y 8 tomados de los mapas mentales
-- ============================================================
insert into public.modules (position, code, title, description, published) values
 (1,'1','Introducción y contexto','Por dónde empieza todo y por qué el mercado alemán.',true),
 (2,'2','Búsqueda y selección','Dónde buscar y cómo elegir el coche correcto.',true),
 (3,'3','Comunicación con el vendedor y comprobaciones','Hablar con el vendedor y verificar antes de pagar.',true),
 (4,'4','Negociación y compra','Cerrar la operación y elegir bien el régimen fiscal.',true),
 (5,'5','Logística y transporte','Traer el coche a España sin sustos.',true),
 (6,'6','Trámites de matriculación y registro en España','Del papeleo a la matrícula definitiva.',true),
 (7,'7','Responsabilidad legal, fiscalidad y estafas','Lo que te protege y lo que te puede costar caro.',true),
 (8,'8','Monetización, ventas y práctica','Convertir el método en una actividad rentable.',true)
on conflict (position) do nothing;

insert into public.lessons (module_id, position, code, title, published)
select m.id, v.position, v.code, v.title, true
from (values
  ('1',1,'1.1','Introducción'),
  ('1',2,'1.2','Contexto del mercado de coches en Alemania y ventajas de la importación'),
  ('2',1,'2.1','Plataformas y buscadores de vehículos'),
  ('2',2,'2.2','Selección y rentabilidad'),
  ('3',1,'3.1','Contacto con vendedores y preguntas preliminares'),
  ('3',2,'3.2','Comprobaciones y revisión'),
  ('4',1,'4.1','Negociación y tipos de operaciones de compra'),
  ('4',2,'4.2','Documentación de compra y pagos'),
  ('5',1,'5.1','Logística de compra y matrículas'),
  ('5',2,'5.2','Transporte y gastos de importación'),
  ('6',1,'6.1','Documentos para la matriculación'),
  ('6',2,'6.2','Trámites a realizar en España'),
  ('6',3,'6.3','Anticipación y organización'),
  ('7',1,'7.1','Garantías en España y Alemania'),
  ('7',2,'7.2','Seguros'),
  ('7',3,'7.3','Fiscalidad'),
  ('7',4,'7.4','Estafas comunes y cómo evitarlas'),
  ('8',1,'8.1','Opciones de monetización'),
  ('8',2,'8.2','Venta y marketing'),
  ('8',3,'8.3','Relaciones clave del proceso')
) as v(mcode, position, code, title)
join public.modules m on m.code = v.mcode
where not exists (select 1 from public.lessons l where l.code = v.code);
