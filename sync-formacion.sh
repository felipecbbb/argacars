#!/bin/bash
# Regenera la carpeta FORMACION a partir de los PDF de presentaciones/pdf
cd "$(dirname "$0")" || exit 1
python3 - << 'PY'
import os, shutil
BASE=os.getcwd(); SRC=os.path.join(BASE,'presentaciones','pdf'); DST=os.path.join(BASE,'FORMACION')
if os.path.isdir(DST): shutil.rmtree(DST)
MAPA={
 '01 · Introducción y contexto':[('mapa-1-1-estructura-formacion','1.1 · Estructura de la formación'),('mapa-1-2-contexto-mercado','1.2 · Contexto del mercado alemán')],
 '02 · Búsqueda y selección':[('mapa-2-1-1-buscadores-alemania','2.1.1 · Buscadores en Alemania'),('mapa-2-1-2-buscadores-espana','2.1.2 · Buscadores en España'),('mapa-2-2-1-criterios-de-seleccion','2.2.1 · Criterios de selección'),('mapa-2-2-2-gastos-y-rentabilidad','2.2.2 · Cálculo de gastos y rentabilidad')],
 '03 · Comunicación y comprobaciones':[('mapa-tipos-de-vendedor','3.1.1 · Análisis de vendedores'),('mapa-evaluar-vendedor','3.1.2 · Cómo evaluar al vendedor'),('mapa-contacto-vendedor','3.1.3 · Contacto con el vendedor'),('mapa-preguntas-preliminares','3.1.4 · Preguntas preliminares'),('mapa-3-2-1-documentos-e-interpretacion','3.2.1 · Documentos y cómo interpretarlos'),('mapa-3-2-2-revision-del-vehiculo','3.2.2 · Revisión del vehículo')],
 '04 · Negociación y compra':[('mapa-4-1-1-negociacion','4.1.1 · Negociación'),('mapa-4-1-2-tipos-de-operaciones','4.1.2 · Tipos de operaciones de compra'),('mapa-4-2-1-documentos-de-compra','4.2.1 · Documentos de compra'),('mapa-4-2-2-gestion-de-pagos','4.2.2 · Gestión de pagos')],
 '05 · Logística y transporte':[('mapa-5-1-1-preparativos-y-recogida','5.1.1 · Preparativos y recogida'),('mapa-5-1-2-matriculas-provisionales','5.1.2 · Matrículas provisionales y de exportación'),('mapa-5-2-1-opciones-de-transporte','5.2.1 · Opciones de transporte'),('mapa-5-2-2-rutas-y-viaje','5.2.2 · Preparación de rutas y viaje'),('mapa-5-2-3-gastos-de-importacion','5.2.3 · Gastos de importación')],
 '06 · Matriculación en España':[('mapa-6-1-documentos-matriculacion','6.1 · Documentos para la matriculación'),('mapa-6-2-tramites-en-espana','6.2 · Trámites a realizar en España'),('mapa-6-3-anticipacion-y-organizacion','6.3 · Anticipación y organización')],
 '07 · Legal, fiscalidad y estafas':[('mapa-7-1-garantias','7.1 · Garantías en España y Alemania'),('mapa-7-2-seguros','7.2 · Seguros'),('mapa-7-3-fiscalidad','7.3 · Fiscalidad'),('mapa-7-4-estafas-comunes','7.4 · Estafas comunes y cómo evitarlas')],
 '08 · Monetización y ventas':[('mapa-8-1-opciones-de-monetizacion','8.1 · Opciones de monetización'),('mapa-8-2-venta-y-marketing','8.2 · Venta y marketing'),('mapa-8-3-relaciones-clave','8.3 · Relaciones clave del proceso')],
}
GUIAS=[('3-1-preguntas-pre-compra','Guía 1 · Listado de preguntas pre-compra'),('3-2-documentacion-alemana','Guía 2 · Documentación alemana y comprobaciones'),('3-3-guia-revision-vehiculo','Guía 3 · Revisión de un vehículo'),('4-1-guia-negociacion','Guía 4 · Negociación y paso a paso en la compra'),('4-1-operaciones-regimenes-compra','Guía 5 · Operaciones y regímenes de compra'),('6-impuesto-matriculacion','Guía 6 · Cálculo del impuesto de matriculación'),('6-documentos-necesarios','Guía 7 · Documentos necesarios en el proceso'),('9-15-consejos-clave','Guía 8 · 15 consejos clave para la importación'),('guia-5-1-particular-usado','Guía 5.1 · Compra como particular de un vehículo usado'),('guia-5-2-particular-nuevo','Guía 5.2 · Compra como particular de un vehículo nuevo'),('guia-5-3-profesional-usado','Guía 5.3 · Compra como profesional de un vehículo usado'),('guia-5-4-profesional-nuevo','Guía 5.4 · Compra como profesional de un vehículo nuevo'),('guia-8-1-antes-de-comprar','Guía 8.1 · 5 consejos · Antes de comprar'),('guia-8-2-revisar-y-cerrar','Guía 8.2 · 5 consejos · Verificar y cerrar la compra'),('guia-8-3-traer-y-legalizar','Guía 8.3 · 5 consejos · Traer el coche y legalizarlo'),('guia-2-documentacion-alemana','Guía 2b · Documentación alemana (documentos para importar)'),('guia-7-documentos-necesarios','Guía 7b · Documentos necesarios en el proceso')]
n=0
for carpeta,items in MAPA.items():
    d=os.path.join(DST,'Mapas mentales',carpeta); os.makedirs(d,exist_ok=True)
    for src,name in items:
        s=os.path.join(SRC,src+'.pdf')
        if os.path.exists(s): shutil.copy2(s,os.path.join(d,name+'.pdf')); n+=1
d=os.path.join(DST,'Guías descargables'); os.makedirs(d,exist_ok=True)
for src,name in GUIAS:
    s=os.path.join(SRC,src+'.pdf')
    if os.path.exists(s): shutil.copy2(s,os.path.join(d,name+'.pdf')); n+=1
print('FORMACION actualizada:',n,'PDF')
PY
