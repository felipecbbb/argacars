-- ============================================================
-- Temario (26 sep 2026): los módulos 6, 7 y 8 pasan a UNA sola clase
-- y se añade el módulo 9 · Caso práctico.
-- OJO: cambia el contenido que ve el alumno. Se aplica al publicar.
-- ============================================================
begin;

-- Los descargables de las clases que desaparecen pasan a la primera del módulo
update public.lesson_files f
set lesson_id = primera.id
from public.lessons l
join public.modules m on m.id = l.module_id
join public.lessons primera on primera.module_id = m.id and primera.position = 1
where f.lesson_id = l.id and m.code in ('6','7','8') and l.position > 1;

delete from public.lessons l
using public.modules m
where m.id = l.module_id and m.code in ('6','7','8') and l.position > 1;

update public.lessons l set title = v.title
from public.modules m, (values
  ('6','Documentos, trámites y organización de la matriculación'),
  ('7','Garantías, seguros, fiscalidad y estafas comunes'),
  ('8','Monetización, venta y relaciones clave del proceso')
) as v(mcode, title)
where m.id = l.module_id and m.code = v.mcode and l.position = 1;

update public.modules set title = 'Monetización y ventas' where code = '8';

insert into public.modules (position, code, title, description, published)
values (9, '9', 'Caso práctico · Búsqueda, comprobaciones, negociación, compra y logística',
        'Lo que hacemos nosotros desde la búsqueda hasta el transporte a España.', true)
on conflict (position) do nothing;

insert into public.lessons (module_id, position, code, title, published)
select m.id, 1, '9.1', 'Proceso de compra completo paso a paso', true
from public.modules m
where m.code = '9' and not exists (select 1 from public.lessons where code = '9.1');

commit;
