import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import CarruselResenas, { GoogleG } from '@/components/carrusel-resenas'
import AgendaLlamada from '@/components/agenda-llamada'
import { cargarAgenda } from '@/lib/agenda'
import { MODULOS, BONUS, PREGUNTAS, CHECKS, RESENAS, ENTREGAS, PRECIO_EUR, PRECIO_TEXTO } from '@/lib/contenido-landing'

export const metadata = {
  title: 'Formación de importación de vehículos · ARGA Premium Cars',
  description:
    'Aprende a importar coches del mercado europeo de forma segura y rentable con un método profesional, sin improvisar. El método de ARGA Premium Cars.',
}

// Los huecos de llamada cambian: la portada se regenera como mucho cada minuto.
export const revalidate = 60

export default async function Inicio() {
  const { huecos, duracionMin, diasVista, zonaArga, activa } = await cargarAgenda('llamada')

  return (
    <>
      <Header />

      {/* ══════════ HERO ══════════ */}
      <header className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image src="/marca/lineup.jpg" alt="" fill priority
                 className="object-cover object-[center_42%] opacity-[.55]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.55)_0%,rgba(10,10,10,.35)_35%,rgba(10,10,10,.8)_75%,rgba(10,10,10,1)_100%)]" />
                  </div>

        <div className="relative mx-auto max-w-6xl px-5">
          <h1 className="max-w-[24ch] text-[clamp(31px,5.6vw,58px)] font-black leading-[1.08] tracking-[-.04em] [text-shadow:0_2px_24px_rgba(0,0,0,.45)]">
            Aprende a importar coches del mercado europeo de forma{' '}
            <span className="text-gold">segura y rentable</span> con un método profesional, sin improvisar
          </h1>

          <div className="mt-10 max-w-[70ch] space-y-4 text-[clamp(15.5px,2.1vw,18.5px)] leading-relaxed text-white/80 [text-shadow:0_1px_12px_rgba(0,0,0,.5)]">
            <p>
              La única formación que necesitarás para aprender a buscar, analizar, comprar e importar
              vehículos paso a paso, entendiendo los costes, trámites y riesgos como un profesional.
            </p>
            <p>
              Tanto si quieres importar un coche para ti como si quieres aprender el proceso para
              desarrollar una actividad profesional.
            </p>
            <p>
              Nuestro método perfeccionado tras más de <strong className="text-white">5 años de experiencia</strong>,
              cientos de operaciones y <strong className="text-white">+15 millones de euros</strong> en vehículos gestionados.
            </p>
          </div>

          <a href="#acceso" className="mt-9 inline-flex rounded-full bg-gradient-to-b from-gold-soft to-gold px-8 py-4.5 text-[15px] font-extrabold uppercase tracking-wide text-ink shadow-[0_20px_46px_-16px_rgba(197,165,114,.75)] transition hover:-translate-y-0.5">
            Quiero aprender el método
          </a>

          <ul className="mt-11 grid gap-x-7 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-start gap-3 text-[14.5px] text-white/80">
                <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 h-4.5 w-4.5 flex-none fill-gold">
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ══════════ EL PROBLEMA · negro ══════════ */}
      <section className="border-y border-white/6 bg-black py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">El punto de partida</p>
          <h2 className="mt-4 max-w-[22ch] text-[clamp(25px,4.6vw,42px)] font-black leading-[1.08] tracking-[-.035em]">
            Importar un coche no consiste en encontrar un coche <span className="text-gold">barato</span>
          </h2>
          <div className="mt-6 max-w-[68ch] space-y-4 text-[16px] leading-relaxed text-white/65">
            <p>Sobre el papel, muchas operaciones parecen rentables. Encuentras un coche a buen precio, comparas cuánto cuesta en España y las cuentas parecen salir.</p>
            <p>Hasta que aparecen las preguntas importantes:</p>
          </div>

          <ol className="mt-10 grid border-t border-white/10 sm:grid-cols-2 sm:gap-x-12">
            {PREGUNTAS.map((q, i) => (
              <li key={q} className="flex items-baseline gap-5 border-b border-white/10 py-6">
                <span aria-hidden className="w-8 flex-none text-[13px] font-extrabold tabular-nums text-gold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[clamp(17.5px,2.4vw,21px)] font-bold leading-snug tracking-[-.02em]">{q}</span>
              </li>
            ))}
          </ol>

          <p className="mt-14 max-w-[46ch] border-l-[3px] border-gold py-1.5 pl-6 text-[clamp(18px,2.9vw,26px)] font-extrabold leading-[1.3] tracking-[-.028em]">
            El problema no suele ser encontrar coches. El problema es saber distinguir una operación
            realmente buena de una que <span className="text-gold">solo lo parece</span>.
          </p>
        </div>
      </section>

      {/* ══════════ LA SOLUCIÓN · blanca, con reseñas ══════════ */}
      <section id="formacion" className="scroll-mt-20 bg-[#f6f4f0] py-16 text-ink sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#8a6d3b]">La formación</p>
            <h2 className="mt-4 max-w-[20ch] text-[clamp(25px,4.6vw,42px)] font-black leading-[1.08] tracking-[-.035em]">
              Aprende el proceso completo antes de <span className="text-[#a07f45]">arriesgar tu dinero</span>
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-ink/70">
              <p>Hemos recopilado nuestros conocimientos y el proceso que utilizamos para analizar e importar vehículos para nosotros y nuestros clientes en una formación teórica y práctica que puedes seguir desde cero.</p>
              <p>Un método que te permita saber qué comprobar, qué calcular y qué pasos seguir desde que encuentras un vehículo hasta que llega a España. Y sobre todo, qué operaciones seleccionar y cuáles evitar, haciendo de la importación un proceso seguro y rentable y no un juego de azar.</p>
              <p>No vas a encontrar una fórmula mágica ni una promesa de hacerte rico importando coches. <strong className="text-ink">Vas a aprender el método exacto que nosotros implementamos para conseguir resultados como estos:</strong></p>
            </div>

            {/* Tarjeta de Google */}
            <a href="https://www.google.com/search?q=arga+premium+cars" target="_blank" rel="noopener"
               className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-ink/10 bg-white px-5 py-4 shadow-[0_12px_30px_-20px_rgba(0,0,0,.4)] transition hover:border-ink/25">
              <GoogleG className="h-9 w-9 flex-none" />
              <span>
                <span className="block text-[15px] font-extrabold tracking-[-.01em]">Reseñas en Google</span>
                <span className="flex items-center gap-2 text-[13px] text-ink/55">
                  <span className="tracking-[.12em] text-[#f5b400]" aria-label="5 estrellas">★★★★★</span>
                  Ver todas ↗
                </span>
              </span>
            </a>

            <div>
              <a href="#acceso" className="mt-8 inline-flex rounded-full bg-ink px-8 py-4 text-[14.5px] font-extrabold uppercase tracking-wide text-white transition hover:-translate-y-0.5">
                Acceder a la formación
              </a>
            </div>
          </div>

          <CarruselResenas tarjetas={
            ENTREGAS.length > 0
              ? ENTREGAS.map((e) => ({ tipo: 'foto' as const, ...e }))
              : RESENAS.map((r) => ({ tipo: 'texto' as const, ...r }))
          } />
        </div>
      </section>

      {/* ══════════ QUIÉNES SOMOS · negro ══════════ */}
      <section id="nosotros" className="scroll-mt-20 bg-black py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Quiénes somos</p>
            <h2 className="mt-4 text-[clamp(25px,4.6vw,40px)] font-black leading-[1.08] tracking-[-.035em]">
              ¡Vale! Pero te estarás preguntando: <span className="text-gold">¿estos de ARGA quiénes son?</span>
            </h2>
            <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-white/65">
              <p className="font-bold text-white">¡Y con razón!</p>
              <p>Somos Alejandro y Rodrigo, dos hermanos de Asturias con una pasión clara desde pequeños: los coches. Tras años de experiencia y cientos de importaciones, creamos el servicio que a nosotros mismos nos gustaría usar.</p>
              <p>Nuestra historia en el sector comienza en 2021, cuando decidimos «invertir» todos nuestros ahorros en importar nuestro primer coche desde Alemania: un Golf 7 GTI Performance.</p>
              <p>La experiencia con la empresa que nos ayudó dejó bastante que desear, pero despertó nuestra curiosidad por aprender y hacerlo mejor. Tras vender aquel GTI con una rentabilidad decente, comenzamos a importar coches por nuestra cuenta, adquiriendo experiencia con cada operación.</p>
              <p>Tiempo después empezamos a compartir nuestro trabajo en Instagram. Tardamos cuatro meses en conseguir nuestro primer cliente, pero desde entonces el crecimiento fue imparable, llegando a importar más de 40 coches en los siguientes 12 meses.</p>
              <p>Hoy, después de años de experiencia, cientos de coches importados y más de 15 millones de euros en vehículos gestionados, hemos perfeccionado nuestro servicio con un objetivo claro: hacer que importar un coche de Alemania sea una experiencia sencilla, segura y confiable, gracias a un método calculado y optimizado que anula por completo la suerte y la incertidumbre.</p>
            </div>

            <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-6">
              {[['+5 años', 'en el sector'], ['Cientos', 'de coches importados'], ['+15 M€', 'en vehículos gestionados']].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-[clamp(26px,4vw,36px)] font-black leading-none tracking-[-.04em] text-gold">{v}</dt>
                  <dd className="mt-2 text-[13px] text-white/45">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/12 lg:aspect-auto lg:h-full lg:min-h-[640px]">
            <Image src="/marca/hermanos.jpg" alt="Alejandro y Rodrigo, de ARGA Premium Cars, con un Lamborghini Urus y un Mercedes G63" fill
                   className="object-cover object-[center_62%]" sizes="(max-width: 1024px) 100vw, 55vw" />
          </figure>
        </div>
      </section>

      {/* ══════════ TEMARIO + BONUS · un mismo fondo: la foto del prao, quieta ══════════ */}
      <div className="relative overflow-clip">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="sticky top-0 h-dvh overflow-hidden">
            <Image src="/marca/prao.jpg" alt="" fill sizes="100vw"
                   className="object-cover object-[center_70%] opacity-[.55] saturate-[1.25]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.55)_0%,rgba(10,10,10,.35)_35%,rgba(10,10,10,.6)_100%)]" />
          </div>
        </div>

        <section id="temario" className="relative scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Qué aprenderás</p>
            <h2 className="mt-4 max-w-[20ch] text-[clamp(25px,4.6vw,42px)] font-black leading-[1.08] tracking-[-.035em] [text-shadow:0_2px_20px_rgba(0,0,0,.5)]">
              De buscar el coche a tenerlo <span className="text-gold">matriculado en España</span>
            </h2>

            <div className="mt-9 space-y-3">
              {MODULOS.map((m) => (
                <article key={m.code} className="overflow-hidden rounded-2xl border border-white/14 bg-ink/70 backdrop-blur-sm">
                  <div className="px-5 py-5 sm:px-7">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-[.14em] text-gold">Módulo {m.code}</span>
                      <h3 className="text-[16px] font-extrabold tracking-[-.02em] sm:text-[18px]">{m.title}</h3>
                    </div>
                    <p className="mt-1.5 text-[14px] text-white/60">{m.description}</p>
                  </div>
                  <ul className="space-y-2.5 border-t border-white/8 px-5 py-4 sm:px-7">
                    {m.lessons.map(([code, title]) => (
                      <li key={code} className="flex gap-3 text-[14.5px] leading-snug text-white/75">
                        <b className="flex-none font-bold text-white tabular-nums">{code}</b>
                        <span>{title}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="bonus" className="relative scroll-mt-20 pb-16 sm:pb-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Incluido sin coste</p>
            <h2 className="mt-4 max-w-[20ch] text-[clamp(25px,4.6vw,42px)] font-black leading-[1.08] tracking-[-.035em] [text-shadow:0_2px_20px_rgba(0,0,0,.5)]">
              Además te llevas estos <span className="text-gold">{BONUS.length} bonus gratuitos</span>
            </h2>

            <div className="mt-9 space-y-3.5">
              {BONUS.map((b, i) => (
                <article key={b.title} className="rounded-3xl border border-white/14 bg-ink/70 p-6 backdrop-blur-sm sm:p-7">
                  <div className="flex flex-wrap items-center gap-3.5">
                    <span className={`flex-none rounded-full px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[.14em] ${
                      b.pronto ? 'border border-gold/50 text-gold' : 'bg-gold text-ink'
                    }`}>
                      {b.pronto ? `Bonus ${i + 1} · Próximamente` : `Bonus ${i + 1}`}
                    </span>
                    <h3 className="text-[clamp(16.5px,2.4vw,20px)] font-extrabold tracking-[-.022em]">{b.title}</h3>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {b.items.map((it) => (
                      <li key={it} className="relative pl-[18px] text-[14.5px] leading-relaxed text-white/70 before:absolute before:left-0 before:top-[9px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-gold">
                        {it}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══════════ CIERRE · llamada o pago ══════════ */}
      <section id="acceso" className="scroll-mt-20 bg-black py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Da el paso</p>
            <h2 className="mx-auto mt-5 max-w-[22ch] text-[clamp(25px,4.6vw,42px)] font-black leading-[1.08] tracking-[-.035em]">
              No vas a encontrar una fórmula mágica. Vas a aprender <span className="text-gold">un método.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[62ch] text-[16px] leading-relaxed text-white/65">
              Un proceso que te permite saber qué comprobar, qué calcular y qué pasos seguir desde que
              encuentras un vehículo hasta que llega a España. Y sobre todo, qué operaciones seleccionar y cuáles evitar.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
            {/* Opción 1 · llamada */}
            <div className="rounded-[28px] border border-white/12 bg-ink-3 p-6 sm:p-9">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Opción 1</p>
              <h3 className="mt-3 text-[clamp(21px,3vw,27px)] font-black tracking-[-.03em]">Agenda tu llamada</h3>
              <p className="mt-2.5 max-w-[52ch] text-[15px] leading-relaxed text-white/60">
                Habla con nosotros antes de hacer el pago para resolver tus dudas y que entendamos bien tu situación.
              </p>
              <div className="mt-7">
                <AgendaLlamada datos={{ huecos, duracionMin, diasVista, zonaArga, activa }} />
              </div>
            </div>

            {/* Opción 2 · pago */}
            <div className="flex flex-col rounded-[28px] border border-gold/40 bg-[linear-gradient(160deg,rgba(197,165,114,.16)_0%,rgba(197,165,114,.04)_60%,transparent_100%)] p-6 sm:p-9">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Opción 2</p>
              <h3 className="mt-3 text-[clamp(21px,3vw,27px)] font-black tracking-[-.03em]">¿Lo tienes claro?</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-white/60">Acceso inmediato al campus en cuanto se confirma el pago.</p>

              <p className="mt-7 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                {PRECIO_EUR ? (
                  <>
                    <span className="text-[clamp(38px,6vw,52px)] font-black leading-none tracking-[-.04em]">
                      {PRECIO_TEXTO.base}
                    </span>
                    <span className="text-[15px] font-bold text-white/70">+ IVA</span>
                    <span className="w-full text-sm text-white/45">{PRECIO_TEXTO.total} IVA incluido · pago único</span>
                  </>
                ) : (
                  <span className="rounded-lg border border-dashed border-gold/50 px-3 py-2 text-sm font-bold text-gold">Precio pendiente de confirmar</span>
                )}
              </p>

              <ul className="mt-7 space-y-2.5">
                {['9 módulos · 14 clases en vídeo', ...BONUS.filter((b) => !b.pronto).map((b) => b.title.split(' en nuestra')[0])].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14px] text-white/75">
                    <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 h-4.5 w-4.5 flex-none fill-gold">
                      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-9">
                <Link href="/pagar"
                      className="flex w-full justify-center rounded-full bg-gradient-to-b from-gold-soft to-gold px-8 py-4.5 text-[15px] font-extrabold uppercase tracking-wide text-ink shadow-[0_20px_46px_-16px_rgba(197,165,114,.75)] transition hover:-translate-y-0.5">
                  Acceder a la formación
                </Link>
                <p className="mt-5 text-center text-[13.5px] text-white/50">
                  ¿Ya la has comprado?{' '}
                  <Link href="/entrar" className="font-semibold text-gold underline underline-offset-4">Entra a tu campus</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
