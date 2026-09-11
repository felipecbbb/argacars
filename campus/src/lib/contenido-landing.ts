/** Contenido de la página de venta. Aquí se edita el copy sin tocar el diseño. */

export const CHECKS = [
  'Acceso inmediato',
  'Formación paso a paso · teoría + práctica',
  'Plantillas y recursos clave',
  'Sin promesas de dinero fácil',
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
  ahora?: boolean
  lessons: [string, string, boolean?][]
}

export const MODULOS: Modulo[] = [
  { code: '1', title: 'Introducción y contexto', ahora: true, lessons: [
    ['1.1', 'Introducción', true],
    ['1.2', 'Contexto del mercado de coches en Alemania y ventajas de la importación'],
  ]},
  { code: '2', title: 'Búsqueda y selección', lessons: [
    ['2.1', 'Plataformas y buscadores de vehículos'],
    ['2.2', 'Selección y rentabilidad'],
  ]},
  { code: '3', title: 'Comunicación con el vendedor y comprobaciones', lessons: [
    ['3.1', 'Contacto con vendedores y preguntas preliminares'],
    ['3.2', 'Comprobaciones y revisión'],
  ]},
  { code: '4', title: 'Negociación y compra', lessons: [
    ['4.1', 'Negociación y tipos de operaciones de compra'],
    ['4.2', 'Documentación de compra y pagos'],
  ]},
  { code: '5', title: 'Logística y transporte', lessons: [
    ['5.1', 'Logística de compra y matrículas'],
    ['5.2', 'Transporte y gastos de importación'],
  ]},
  { code: '6', title: 'Trámites de matriculación y registro en España', lessons: [] },
  { code: '7', title: 'Responsabilidad legal, fiscalidad y estafas', lessons: [] },
  { code: '8', title: 'Monetización, ventas y práctica', lessons: [] },
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
  { title: 'Acceso de por vida a la comunidad de profesionales y alumnos', items: [
    'Accede al grupo de alumnos y profesionales formados por ARGA Premium Cars.',
    'Comparte dudas y logros con nosotros y con tus compañeros de la formación.',
    'Recibe y envía ofertas exclusivas de vehículos o servicios.',
    'Participa en eventos de la comunidad.',
    'Sorteos y premios exclusivos.',
  ]},
  { title: 'Acceso a encargos de importación reales en Car Revol', pronto: true, items: [
    'Única vía de acceso a clientes reales a través de la plataforma Car Revol: si no te formas con nosotros, jamás podrás recibir encargos en la plataforma.',
    'Selección de los mejores importadores para ofrecer sus servicios en Car Revol.',
  ]},
  { title: '6 meses de acceso gratuito a encargos reales', pronto: true, items: [
    'Si eres seleccionado por Car Revol, podrás acceder a la plataforma durante 6 meses sin cuota mensual y ofrecer tus servicios como importador verificado.',
    'Gana encargos reales sin esfuerzo.',
  ]},
]
