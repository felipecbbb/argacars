# Presentaciones — Formación de importación · ARGA Premium Cars

Ocho presentaciones **16:9 (1280×720)** generadas a partir de los PDF de contenido, con el
sistema de diseño de argapremiumcars.es (Inter, negro `#0a0a0a`, dorado `#c5a572`, tarjetas y
píldoras del sitio).

## Contenido

| Archivo | Módulo | Slides |
|---|---|---|
| `3-1-preguntas-pre-compra.html` | 3.1 · Listado de preguntas pre-compra | 8 |
| `3-2-documentacion-alemana.html` | 3.2 · Documentación alemana + comprobaciones | 9 |
| `3-3-guia-revision-vehiculo.html` | 3.3 · Guía de revisión de un vehículo | 9 |
| `4-1-guia-negociacion.html` | 4.1 · Guía de negociación y paso a paso | 6 |
| `4-1-operaciones-regimenes-compra.html` | 4.1 · Operaciones y regímenes de compra | 8 |
| `6-impuesto-matriculacion.html` | 6 · Cálculo del impuesto de matriculación | 11 |
| `6-documentos-necesarios.html` | 6 · Documentos necesarios en el proceso | 7 |
| `9-15-consejos-clave.html` | 9 · 15 consejos clave para la importación | 6 |

### Guía 5, desglosada en cuatro guías gratuitas

La guía 5 (`4-1-operaciones-regimenes-compra`) cubre las cuatro casuísticas en un solo deck.
Estas cuatro la parten en una guía por casuística, pensadas para repartir sueltas como lead
magnet. Todas comparten **la misma página 1** (los dos supuestos: nuevo vs. usado y tipo de
vendedor/régimen) y **la misma página 6** (las cuatro casuísticas + próximas guías); cambian
la tabla y los tres ejemplos con números.

| Archivo | Casuística | Páginas |
|---|---|---|
| `guia-5-1-particular-usado.html` | Comprador particular · vehículo usado | 6 |
| `guia-5-2-particular-nuevo.html` | Comprador particular · vehículo nuevo | 6 |
| `guia-5-3-profesional-usado.html` | Comprador profesional · vehículo usado | 6 |
| `guia-5-4-profesional-nuevo.html` | Comprador profesional · vehículo nuevo | 6 |

Estructura fija de cada una: **1)** los dos supuestos · **2)** la tabla de la casuística ·
**3)** ejemplo con números — vendedor particular · **4)** ejemplo con números — REBU ·
**5)** ejemplo con números — régimen general · **6)** cierre.

Los ejemplos usan siempre el mismo coche dentro de cada categoría (BMW 320d Touring de 25.000 €
para usado, Audi A4 km 0 de 40.000 € para nuevo), así los tres regímenes se comparan cifra a
cifra. Los estilos propios de estas guías (`.calc`, `.total`, `.ad`) van en un `<style>` dentro
de cada archivo; el resto es `assets/deck.css`.

`index.html` es el índice con acceso a todas. En `pdf/` está cada presentación ya exportada.

## Uso

- **Avanzar:** `→`, `espacio` o clic en la parte derecha del slide
- **Retroceder:** `←` o clic en el margen izquierdo
- **Pantalla completa:** `F`
- **Exportar a PDF:** `P` → «Guardar como PDF», horizontal, con «Gráficos de fondo» activado
- **Móvil:** deslizar a izquierda/derecha

Los PDF de `pdf/` se regeneran con Chrome headless (requiere un servidor local, p. ej.
`python3 -m http.server 8899` desde la raíz del proyecto):

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for f in presentaciones/*.html; do
  b=$(basename "$f" .html); [ "$b" = index ] && continue
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --virtual-time-budget=10000 \
    --print-to-pdf="presentaciones/pdf/$b.pdf" \
    "http://localhost:8899/presentaciones/$b.html"
done
```

## Estructura

- `assets/deck.css` — sistema de diseño compartido (un solo archivo para las 8)
- `assets/deck.js` — navegación, escalado 16:9 y footer automático (`data-deck` da el rótulo)
- `assets/logo.png` — logo ARGA (blanco; se invierte por CSS sobre fondo claro)
- `assets/img/` — documentos extraídos del PDF original: `teil1.jpg`, `pegatina.jpg`,
  `teil2.jpg`, `coc.jpg`

Para añadir un slide basta con copiar un `<section class="slide">` existente: la numeración del
pie y el total se calculan solos.

## Nota de contenido

Los PDF originales cerraban cada módulo con un bloque promocional para redes («estate atento
al grupo», «clase gratuita el día X de septiembre») y con frases del tipo «esto es solo una
parte de lo que debes conocer». **Nada de eso está en las presentaciones**: el último slide de
cada deck es una recapitulación de las tres ideas clave del módulo, sin llamadas a la acción ni
referencias externas.

### Guía 8, desglosada en tres guías gratuitas

Los 15 consejos repartidos en tres bloques temáticos de cinco, **una página por consejo**,
para poder repartirlos sueltos por el grupo. Todas comparten la página 1 (introducción y
contexto, con el índice de sus cinco consejos) y la página 7 (cierre + aviso de que llegarán
más consejos por el grupo).

| Archivo | Bloque | Consejos del original | Páginas |
|---|---|---|---|
| `guia-8-1-antes-de-comprar.html` | Búsqueda, análisis y criterio | 1, 2, 3, 8, 7 | 7 |
| `guia-8-2-revisar-y-cerrar.html` | Revisión, comunicaciones y pago | 5, 6, 4, 13, 11 | 7 |
| `guia-8-3-traer-y-legalizar.html` | Transporte, trámites y fiscalidad | 12, 10, 9, 15, 14 | 7 |

Cada página de consejo tiene el mismo esqueleto: número grande, texto del consejo original
desarrollado, una frase-resumen destacada, un bloque «Cómo se aplica» con tres puntos
accionables y una tarjeta de aviso (dorada si es una ventaja, roja si es un error caro).
Estilos propios (`.bignum`, `.tip-body`, `.quote`, `.idx`) en el `<style>` de cada archivo.

---

# Mapas mentales

29 mapas mentales en horizontal (1600×900), **fondo blanco, sin logo ni pie**, un archivo por punto
del temario. HTML editable en la raíz, PDF en `pdf/`.

| Mapa | Origen |
|---|---|
| `mapa-1-1-estructura-formacion` | 1.1 · Estructura de la formación |
| `mapa-1-2-contexto-mercado` | 1.2 · Contexto del mercado alemán |
| `mapa-buscadores-alemania` | 2.1 · Buscadores en Alemania |
| `mapa-buscadores-espana` | 2.2 · Buscadores en España |
| `mapa-tipos-de-vendedor` | 3.1 · Análisis de vendedores |
| `mapa-evaluar-vendedor` | 3.1 · Cómo evaluar al vendedor |
| `mapa-contacto-vendedor` | 3.1 · Contacto con el vendedor |
| `mapa-preguntas-preliminares` | 3.1 · Preguntas preliminares |
| `mapa-3-2-1-documentos-e-interpretacion` | 3.2 · Punto 1 · Documentos y cómo interpretarlos |
| `mapa-3-2-2-revision-del-vehiculo` | 3.2 · Punto 2 · Revisión del vehículo |
| `mapa-4-1-1-negociacion` | 4.1 · Punto 1 · Negociación |
| `mapa-4-1-2-tipos-de-operaciones` | 4.1 · Punto 2 · Tipos de operaciones |
| `mapa-4-2-1-documentos-de-compra` | 4.2 · Punto 1 · Documentos de compra |
| `mapa-4-2-2-gestion-de-pagos` | 4.2 · Punto 2 · Gestión de pagos |
| `mapa-5-1-1-preparativos-y-recogida` | 5.1 · Punto 1 · Preparativos y recogida |
| `mapa-5-1-2-matriculas-provisionales` | 5.1 · Punto 2 · Matrículas provisionales y de exportación |
| `mapa-5-2-1-opciones-de-transporte` | 5.2 · Punto 1 · Opciones de transporte |
| `mapa-5-2-2-rutas-y-viaje` | 5.2 · Punto 2 · Preparación de rutas y viaje |
| `mapa-5-2-3-gastos-de-importacion` | 5.2 · Punto 3 · Gastos asociados |
| `mapa-6-1-documentos-matriculacion` | 6 · Punto 1 · Documentos para la matriculación |
| `mapa-6-2-tramites-en-espana` | 6 · Punto 2 · Trámites a realizar en España |
| `mapa-6-3-anticipacion-y-organizacion` | 6 · Punto 3 · Anticipación y organización |
| `mapa-7-1-garantias` | 7 · Punto 1 · Garantías en España y Alemania |
| `mapa-7-2-seguros` | 7 · Punto 2 · Seguros |
| `mapa-7-3-fiscalidad` | 7 · Punto 3 · Fiscalidad |
| `mapa-7-4-estafas-comunes` | 7 · Punto 4 · Estafas comunes y cómo evitarlas |
| `mapa-8-1-opciones-de-monetizacion` | 8 · Punto 1 · Opciones de monetización |
| `mapa-8-2-venta-y-marketing` | 8 · Punto 2 · Venta y marketing |
| `mapa-8-3-relaciones-clave` | 8 · Punto 3 · Relaciones clave del proceso |

## Cómo funcionan

`assets/mapa.css` + `assets/mapa.js` son el motor común. Los mapas nuevos usan el layout
automático: un contenedor `.auto` con tres columnas (`.col.left`, `.col.mid` con el `.core`,
`.col.right`) y, opcionalmente, una `.flow` inferior. **El JS calcula las curvas de conexión
midiendo la posición real de cada nodo**, así que añadir, quitar o alargar un nodo no obliga a
recolocar nada.

El JS también detecta desbordes: si algún nodo se sale del área útil, añade `[OVERFLOW]` al
`<title>`, lo que permite comprobarlos todos de una pasada:

```bash
for f in presentaciones/mapa-*.html; do
  "$CHROME" --headless=new --virtual-time-budget=6000 --dump-dom \
    "http://localhost:8899/presentaciones/$(basename $f)" | grep -o 'OVERFLOW [^]]*'
done
```

Qué se ha dejado fuera de todos los mapas: el bloque de cierre para redes («si tienes alguna
duda, envíanos un WhatsApp», grupo de la comunidad), las anotaciones de guion del propio
documento (`*meter mismo video en selfie*`, `*enseñar tabla*`, `*mostrar listado*`), las
referencias a material adjunto a cada clase y los bonus comerciales.
