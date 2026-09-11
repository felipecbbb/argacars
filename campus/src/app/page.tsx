import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { MODULOS, BONUS, PREGUNTAS, CHECKS } from '@/lib/contenido-landing'

export const metadata = {
  title: 'Formación de importación de vehículos · ARGA Premium Cars',
  description:
    'Aprende a importar coches del mercado europeo con un proceso claro, números reales y sin improvisar. El método de ARGA Premium Cars.',
}

export default function Inicio() {
  return (
    <>
      <Header />

      {/* ══════════ HERO ══════════ */}
      <header className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image src="/marca/lineup.jpg" alt="" fill priority
                 className="object-cover object-[center_42%] opacity-[.26] grayscale-[.2]" />
          <div className="absolute inset-0 bg-[radial-gradient(100%_70%_at_50%_30%,rgba(10,10,10,.35)_0%,rgba(10,10,10,.86)_62%,rgba(10,10,10,.99)_100%)]" />
          <div className="absolute -top-40 -right-24 h-[600px] w-[600px] rounded-full bg-gold/14 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5">
          <h1 className="max-w-[16ch] text-[clamp(31px,6.4vw,60px)] font-black leading-[1] tracking-[-.045em]">
            Aprende a importar coches del mercado europeo con un{' '}
            <span className="text-gold">proceso claro</span>, números reales y sin improvisar
          </h1>

          <div className="mt-7 max-w-[64ch] space-y-4 text-[clamp(15.5px,2.1vw,18.5px)] leading-relaxed text-white/70">
            <p>
              La única formación que necesitarás para aprender a buscar, analizar, comprar e importar
              vehículos paso a paso, entendiendo los costes, trámites y riesgos antes de poner tu
              dinero en una operación.
            </p>
            <p>
              Tanto si quieres importar un coche para ti como si quieres aprender el proceso para
              desarrollar una actividad profesional.
            </p>
            <p>
              Nuestro método perfeccionado tras más de <strong className="text-white">5 años de experiencia</strong>,
              cientos de operaciones y <strong className="text-white">+12 millones de euros</strong> en vehículos gestionados.
            </p>
          </div>

          <a href="#acceso" className="mt-9 inline-flex rounded-full bg-gradient-to-b from-gold-soft to-gold px-8 py-4.5 text-[15px] font-extrabold uppercase tracking-wide text-ink shadow-[0_20px_46px_-16px_rgba(197,165,114,.75)] transition hover:-translate-y-0.5">
            Quiero aprender el método
          </a>

          <ul className="mt-11 grid gap-x-7 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-start gap-3 text-[14.5px] text-white/70">
                <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 h-4.5 w-4.5 flex-none fill-gold">
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ══════════ EL PROBLEMA ══════════ */}
      <section className="border-y border-white/6 bg-ink-2 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">El punto de partida</p>
          <h2 className="mt-4 max-w-[20ch] text-[clamp(25px,4.6vw,42px)] font-black leading-[1.05] tracking-[-.035em]">
            Importar un coche no consiste en encontrar un coche <span className="text-gold">barato</span> en Alemania
          </h2>
          <div className="mt-6 max-w-[68ch] space-y-4 text-[16px] leading-relaxed text-white/65">
            <p>Sobre el papel, muchas operaciones parecen rentables. Encuentras un coche a buen precio, comparas cuánto cuesta en España y las cuentas parecen salir.</p>
            <p>Hasta que aparecen las preguntas importantes:</p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PREGUNTAS.map((q) => (
              <li key={q} className="flex items-start gap-3 rounded-2xl border border-white/12 bg-ink-3 px-5 py-4 text-[15px] font-semibold leading-snug">
                <span aria-hidden className="flex-none font-black text-gold">?</span>{q}
              </li>
            ))}
          </ul>

          <p className="mt-11 max-w-[46ch] border-l-[3px] border-gold py-1.5 pl-6 text-[clamp(18px,2.9vw,26px)] font-extrabold leading-[1.3] tracking-[-.028em]">
            El problema no suele ser encontrar coches. El problema es saber distinguir una operación
            realmente buena de una que <span className="text-gold">solo lo parece</span>.
          </p>
        </div>
      </section>

      {/* ══════════ LA SOLUCIÓN ══════════ */}
      <section id="formacion" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">La formación</p>
          <h2 className="mt-4 max-w-[20ch] text-[clamp(25px,4.6vw,42px)] font-black leading-[1.05] tracking-[-.035em]">
            Aprende el proceso completo antes de <span className="text-gold">arriesgar tu dinero</span>
          </h2>
          <div className="mt-6 max-w-[68ch] space-y-4 text-[16px] leading-relaxed text-white/65">
            <p>Hemos recopilado nuestros conocimientos y el proceso que utilizamos para analizar e importar vehículos para nosotros y nuestros clientes en una formación teórica y práctica que puedes seguir desde cero.</p>
            <p>No vas a encontrar una fórmula mágica ni una promesa de hacerte rico importando coches. <strong className="text-white">Vas a aprender un método.</strong></p>
            <p>Un proceso que te permita saber qué comprobar, qué calcular y qué pasos seguir desde que encuentras un vehículo hasta que llega a España. Y sobre todo, qué operaciones seleccionar y cuáles evitar.</p>
          </div>
          <a href="#acceso" className="mt-8 inline-flex rounded-full bg-gradient-to-b from-gold-soft to-gold px-8 py-4 text-[14.5px] font-extrabold uppercase tracking-wide text-ink transition hover:-translate-y-0.5">
            Quiero ver la formación
          </a>
        </div>
      </section>

      {/* ══════════ QUIÉNES SOMOS ══════════ */}
      <section id="nosotros" className="scroll-mt-20 border-y border-white/6 bg-ink-2 py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Quiénes somos</p>
            <h2 className="mt-4 text-[clamp(25px,4.6vw,40px)] font-black leading-[1.05] tracking-[-.035em]">
              ¡Vale! Pero te estarás preguntando: <span className="text-gold">¿estos de ARGA quiénes son?</span>
            </h2>
            <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-white/65">
              <p className="font-bold text-white">¡Y con razón!</p>
              <p>Somos Alejandro y Rodrigo, dos hermanos de Asturias con una pasión clara desde pequeños: los coches. Tras años de experiencia y cientos de importaciones, creamos el servicio que a nosotros mismos nos gustaría usar.</p>
              <p>Nuestra historia en el sector comienza en 2021, cuando decidimos «invertir» todos nuestros ahorros en importar nuestro primer coche desde Alemania: un Golf 7 GTI Performance.</p>
              <p>La experiencia con la empresa que nos ayudó dejó bastante que desear, pero despertó nuestra curiosidad por aprender y hacerlo mejor. Tras vender aquel GTI con una rentabilidad decente, comenzamos a importar coches por nuestra cuenta, adquiriendo experiencia con cada operación.</p>
              <p>Tiempo después empezamos a compartir nuestro trabajo en Instagram. Tardamos cuatro meses en conseguir nuestro primer cliente, pero desde entonces el crecimiento fue imparable, llegando a importar más de 40 coches en los siguientes 12 meses.</p>
              <p>Hoy, después de años de experiencia, cientos de coches importados y más de 12 millones de euros en vehículos gestionados, hemos perfeccionado nuestro servicio con un objetivo claro: hacer que importar un coche de Alemania sea una experiencia sencilla, segura y confiable, gracias a un método calculado y optimizado que anula por completo la suerte y la incertidumbre.</p>
            </div>

            <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-6">
              {[['+5 años', 'en el sector'], ['Cientos', 'de coches importados'], ['+12 M€', 'en vehículos gestionados']].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-[clamp(26px,4vw,36px)] font-black leading-none tracking-[-.04em] text-gold">{v}</dt>
                  <dd className="mt-2 text-[13px] text-white/45">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/12 lg:sticky lg:top-24">
            <Image src="/marca/hermanos.jpg" alt="Alejandro y Rodrigo, de ARGA Premium Cars" fill
                   className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
          </figure>
        </div>
      </section>

      {/* ══════════ TEMARIO ══════════ */}
      <section id="temario" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Qué aprenderás</p>
          <h2 className="mt-4 max-w-[20ch] text-[clamp(25px,4.6vw,42px)] font-black leading-[1.05] tracking-[-.035em]">
            De buscar el coche a tenerlo <span className="text-gold">matriculado en España</span>
          </h2>

          <div className="mt-9 space-y-3">
            {MODULOS.map((m) => (
              <article key={m.code} className={`overflow-hidden rounded-2xl border bg-ink-3 ${m.ahora ? 'border-gold/45 bg-gold/[.07]' : 'border-white/12'}`}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-5 sm:px-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-[.14em] text-gold">Módulo {m.code}</span>
                  <h3 className="text-[16px] font-extrabold tracking-[-.02em] sm:text-[18px]">{m.title}</h3>
                </div>
                {m.lessons.length > 0 && (
                  <ul className="space-y-2.5 border-t border-white/6 px-5 py-4 sm:px-6">
                    {m.lessons.map(([code, title, ahora]) => (
                      <li key={code} className="flex gap-3 text-[14.5px] leading-snug text-white/65">
                        <b className="flex-none font-bold text-white tabular-nums">{code}</b>
                        <span>
                          {title}
                          {ahora && (
                            <span className="ml-2 rounded-full bg-gold px-2 py-0.5 align-middle text-[10px] font-extrabold uppercase tracking-wider text-ink">
                              Clase de ahora
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BONUS ══════════ */}
      <section id="bonus" className="scroll-mt-20 border-y border-white/6 bg-ink-2 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Incluido sin coste</p>
          <h2 className="mt-4 max-w-[20ch] text-[clamp(25px,4.6vw,42px)] font-black leading-[1.05] tracking-[-.035em]">
            Además te llevas estos <span className="text-gold">5 bonus gratuitos</span>
          </h2>

          <div className="mt-9 space-y-3.5">
            {BONUS.map((b) => (
              <article key={b.title} className="rounded-3xl border border-white/12 bg-ink-3 p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-3.5">
                  <span className={`flex-none rounded-full px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[.14em] ${
                    b.pronto ? 'border border-gold/50 text-gold' : 'bg-gold text-ink'
                  }`}>
                    {b.pronto ? 'Bonus gratuito · Próximamente' : 'Bonus gratuito'}
                  </span>
                  <h3 className="text-[clamp(16.5px,2.4vw,20px)] font-extrabold tracking-[-.022em]">{b.title}</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {b.items.map((i) => (
                    <li key={i} className="relative pl-[18px] text-[14.5px] leading-relaxed text-white/65 before:absolute before:left-0 before:top-[9px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-gold">
                      {i}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CIERRE ══════════ */}
      <section id="acceso" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="rounded-[28px] border border-gold/35 bg-[linear-gradient(160deg,rgba(197,165,114,.14)_0%,rgba(197,165,114,.03)_60%,transparent_100%)] p-8 text-center sm:p-14">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-gold">Para terminar</p>
            <h2 className="mx-auto mt-5 max-w-[20ch] text-[clamp(25px,4.6vw,42px)] font-black leading-[1.05] tracking-[-.035em]">
              No vas a encontrar una fórmula mágica. Vas a aprender <span className="text-gold">un método.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[60ch] text-[16px] leading-relaxed text-white/65">
              No hay ninguna promesa de hacerte rico importando coches. Hay un proceso que te permite
              saber qué comprobar, qué calcular y qué pasos seguir desde que encuentras un vehículo
              hasta que llega a España. Y sobre todo, qué operaciones seleccionar y cuáles evitar.
            </p>

            {/* PENDIENTE · aquí irá el pago con Stripe */}
            <a href="https://comunidad.argapremiumcars.es"
               className="mt-9 inline-flex rounded-full bg-gradient-to-b from-gold-soft to-gold px-9 py-4.5 text-[15px] font-extrabold uppercase tracking-wide text-ink shadow-[0_20px_46px_-16px_rgba(197,165,114,.75)] transition hover:-translate-y-0.5">
              Quiero la formación
            </a>
            <p className="mt-5 text-[13px] text-white/45">Acceso inmediato · Sin promesas de dinero fácil</p>
            <p className="mt-7 text-[13.5px] text-white/50">
              ¿Ya la has comprado?{' '}
              <Link href="/entrar" className="font-semibold text-gold underline underline-offset-4">
                Entra a tu campus
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
