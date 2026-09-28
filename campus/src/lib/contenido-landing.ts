/** Contenido de la página de venta. Aquí se edita el copy sin tocar el diseño. */

export const CHECKS = [
  'Acceso inmediato',
  'Formación paso a paso · teoría + práctica',
  'Plantillas y recursos clave',
  'Acceso a nuestros contactos',
  'Acceso a comunidad de profesionales',
  'Acceso a encargos reales',
]

export const PREGUNTAS = [
  '¿El vendedor es fiable?',
  '¿El coche tiene algún problema oculto?',
  '¿Cuánto voy a pagar realmente entre gastos e impuestos?',
  '¿Qué documentación necesito?',
  '¿Y si me equivoco en una operación de miles de euros?',
  '¿Cómo debo realizar la operación en términos fiscales?',
]

type Modulo = {
  code: string
  title: string
  /** La misma frase que ve el alumno dentro del campus (tabla modules.description). */
  description: string
  lessons: [string, string][]
}

export const MODULOS: Modulo[] = [
  { code: '1', title: 'Introducción y contexto', description: 'Por dónde empieza todo y por qué el mercado alemán.', lessons: [
    ['1.1', 'Introducción'],
    ['1.2', 'Contexto del mercado de coches en Alemania y ventajas de la importación'],
  ]},
  { code: '2', title: 'Búsqueda y selección', description: 'Dónde buscar y cómo elegir el coche correcto.', lessons: [
    ['2.1', 'Plataformas y buscadores de vehículos'],
    ['2.2', 'Selección y rentabilidad'],
  ]},
  { code: '3', title: 'Comunicación con el vendedor y comprobaciones', description: 'Hablar con el vendedor y verificar antes de pagar.', lessons: [
    ['3.1', 'Contacto con vendedores y preguntas preliminares'],
    ['3.2', 'Comprobaciones y revisión'],
  ]},
  { code: '4', title: 'Negociación y compra', description: 'Cerrar la operación y elegir bien el régimen fiscal.', lessons: [
    ['4.1', 'Negociación y tipos de operaciones de compra'],
    ['4.2', 'Documentación de compra y pagos'],
  ]},
  { code: '5', title: 'Logística y transporte', description: 'Traer el coche a España sin sustos.', lessons: [
    ['5.1', 'Logística de compra y matrículas'],
    ['5.2', 'Transporte y gastos de importación'],
  ]},
  { code: '6', title: 'Trámites de matriculación y registro en España', description: 'Del papeleo a la matrícula definitiva.', lessons: [
    ['6.1', 'Documentos de matriculación, trámites en España, organización y anticipación'],
  ]},
  { code: '7', title: 'Responsabilidad legal, fiscalidad y estafas', description: 'Lo que te protege y lo que te puede costar caro.', lessons: [
    ['7.1', 'Garantías, seguros, fiscalidad y estafas comunes'],
  ]},
  { code: '8', title: 'Monetización y ventas', description: 'Convertir el método en una actividad rentable.', lessons: [
    ['8.1', 'Opciones de monetización, venta y marketing, y relaciones clave del proceso'],
  ]},
  { code: '9', title: 'Caso práctico · Búsqueda, comprobaciones, negociación, compra y logística', description: 'Lo que hacemos nosotros desde la búsqueda hasta el transporte a España.', lessons: [
    ['9.1', 'Proceso de compra completo paso a paso'],
  ]},
]

type Bonus = { title: string; items: string[]; pronto?: boolean }

export const BONUS: Bonus[] = [
  { title: '3 mentorías 1 a 1', items: [
    '30 minutos de llamada privada con nosotros.',
    'Llámanos en cualquier momento que lo necesites.',
    'Sin plazo de caducidad.',
  ]},
  { title: 'Guías y recursos para cada paso del proceso', items: [
    'Listado de preguntas pre-compra y comprobaciones iniciales.',
    'Documentación alemana y comprobaciones necesarias.',
    'Revisión de un vehículo.',
    'Negociación y paso a paso en la compra.',
    'Operaciones y regímenes de compra de vehículos.',
    'Cálculo del impuesto de matriculación.',
    'Documentos necesarios en el proceso.',
    '15 consejos clave para la importación.',
  ]},
  { title: 'Plantillas necesarias', items: [
    'Contrato de importación / prestación de servicios.',
    'Contrato de compraventa.',
    'Autorización de transporte.',
    'Autorización para realizar la importación y trámites.',
  ]},
  { title: 'Acceso de por vida a la comunidad de profesionales y alumnos', items: [
    'Accede al grupo de alumnos y profesionales formados por ARGA Premium Cars.',
    'Comparte dudas y logros con nosotros y con tus compañeros de la formación.',
    'Recibe y envía ofertas exclusivas de vehículos o servicios.',
    'Participa en eventos de la comunidad.',
    'Sorteos y premios exclusivos.',
  ]},
  { title: 'Recibe encargos reales de importación y matriculación en nuestra plataforma Car Revol', items: [
    '6 meses de acceso gratuito sin cuota mensual a Car Revol.',
    'Plataforma creada por nosotros para que nuestros alumnos puedan recibir encargos reales de clientes listos para importar un coche.',
    'Formarse con nosotros es la única vía de acceso a ofrecer tus servicios como importador/matriculador en Car Revol.',
  ]},
  { title: 'Acceso a nuestro listado de contactos y mejores profesionales para cada parte del proceso', items: [
    'Los mejores profesionales de cada servicio accesorio necesario en el proceso de importación y matriculación de un vehículo: revisores, transportistas, gestorías, homologadores, talleres…',
    'Quienes trabajan con nosotros, al alcance de tu mano.',
  ]},
  { title: '6 meses de acceso gratuito a la comunidad VIP del motor', pronto: true, items: [
    'Comunidad de pago privada de profesionales del sector: importadores, compraventas, talleres mecánicos, talleres de detailing y PPF, gestorías, revisores…',
    'Ofertas de vehículos y servicios.',
    'Eventos y rutas.',
    'Networking.',
    'Noticias.',
  ]},
]

/**
 * Reseñas reales de Google (las mismas que publica argapremiumcars.es).
 * Se enseñan como texto mientras no lleguen las fotos de entregas.
 */
export type Resena = { autor: string; cuando: string; texto: string }

export const RESENAS: Resena[] = [
  { autor: 'Sergio Sánchez Marcos', cuando: 'hace 3 meses',
    texto: 'Importé un M2 CS con ellos: el trato, servicio, gestión y rapidez de 10. Totalmente recomendable y de confianza, ¡para repetir con el próximo! Tienen contactos para el transporte y para conseguir coches que no salen en internet.' },
  { autor: 'A. V.', cuando: 'hace 4 meses',
    texto: 'Verdaderos profesionales. Me trajeron un Ferrari F430 Spider. Atentos y muy resolutivos. He traído muchos coches de Alemania por mi cuenta y por fin me atreví a delegarlo: un acierto total.' },
  { autor: 'GADE', cuando: 'hace un año',
    texto: 'Experiencia de 10. Les encargué mi BMW M340i, que tengo actualmente. Me asesoraron, informaron durante todo el proceso y negociaron más de 1500€ el precio de compra con el concesionario. Sin duda repetiré. 100% recomendable.' },
  { autor: 'Alexander Zehnder', cuando: 'hace 4 meses',
    texto: 'Excelente experiencia. Me ayudaron a importar mi Porsche desde Alemania a España de forma totalmente profesional, fiable y transparente, ocupándose de todo el proceso de principio a fin.' },
  { autor: 'Nerea Costa García', cuando: 'hace 5 meses',
    texto: 'Acabamos de recoger nuestro BMW Serie 4. ¡Muchas gracias por todo, Rodrigo! Estamos encantados de haber confiado en vosotros. De primeras nos echaba para atrás no conoceros en persona, pero al hablar se disiparon las dudas.' },
  { autor: 'Enrique Gracia Hernández', cuando: 'hace 7 meses',
    texto: 'Recientemente he importado un BMW M2 F87 de 2018 y no puedo estar más satisfecho. El coche llegó en excelentes condiciones, tal como se prometió, y se nota que cuidan cada detalle del proceso.' },
]

/**
 * Fotos verticales de entregas (con la reseña o el «entregado» encima) que pasa ARGA.
 * Van en public/entregas/. En cuanto haya alguna, sustituyen a las reseñas de texto.
 */
export const ENTREGAS: { src: string; alt: string }[] = []

/** Precio de la formación: 2.400 € + IVA (confirmado por ARGA el 28 sep 2026). */
export const PRECIO_BASE_EUR = 2400
export const IVA = 0.21
/** Lo que se cobra en Stripe, IVA incluido: 2.904 €. */
export const PRECIO_EUR: number | null = Math.round(PRECIO_BASE_EUR * (1 + IVA) * 100) / 100

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' })
/** «2.400 €» y «2.904 €», ya formateados. */
export const PRECIO_TEXTO = { base: eur.format(PRECIO_BASE_EUR), total: eur.format(PRECIO_EUR ?? 0) }
