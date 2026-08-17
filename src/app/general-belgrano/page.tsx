import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE_URL } from "@/lib/site-url";

const title = "Qué hacer en General Belgrano | El Vagón";
const description =
  "Ideas para una escapada a General Belgrano: Río Salado, paseo costanero, Termas del Salado, Bosque Encantado y agenda cultural, con El Vagón como punto de partida.";
const pageUrl = `${SITE_URL}/general-belgrano`;
const socialImage = `${SITE_URL}/images/general-belgrano/costanera-atardecer.webp`;
const tourismUrl = "https://generalbelgrano.tur.ar/que-visitar";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "El Vagón",
    url: pageUrl,
    title,
    description,
    images: [{ url: socialImage, alt: "Costanera de General Belgrano al atardecer" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
};

export default function GeneralBelgranoPage() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <section className="agenda-hero detail-hero" aria-labelledby="destination-title">
          <Image
            className="agenda-hero-image"
            src="/images/general-belgrano/costanera-atardecer.webp"
            alt="Paseo costanero de General Belgrano al atardecer"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
          />
          <div className="agenda-hero-shade" />
          <div className="container agenda-hero-content">
            <p className="eyebrow eyebrow-light">El destino</p>
            <h1 id="destination-title">Qué hacer en General Belgrano</h1>
            <p>
              Naturaleza, aguas termales, paseos junto al río y encuentros culturales
              para armar una escapada con tiempo propio.
            </p>
            <div className="agenda-hero-actions">
              <Link className="button button-light" href="/alojamiento">
                Conocer El Vagón <ArrowUpRight aria-hidden="true" />
              </Link>
              <a
                className="button button-outline-light"
                href={tourismUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Turismo oficial <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="section detail-intro" aria-labelledby="getaway-title">
          <div className="container detail-intro-grid">
            <div className="section-heading reveal">
              <p className="eyebrow">Una pausa cerca</p>
              <h2 id="getaway-title">Una escapada a General Belgrano</h2>
            </div>
            <div className="detail-prose reveal">
              <p>
                General Belgrano invita a caminar sin apuro, acercarse al Río Salado y
                alternar los paseos con momentos de descanso. La costanera, las termas y
                los espacios verdes permiten organizar una visita tranquila, tanto para
                un fin de semana como para quedarse algunos días.
              </p>
              <p>
                Desde El Vagón, en Dorrego 747, podés usar la ciudad como punto de partida
                y volver a un alojamiento rodeado de jardín. La disponibilidad se consulta
                directamente y la estadía es para hasta dos huéspedes.
              </p>
            </div>
          </div>
        </section>

        <section className="section destination-guide" aria-labelledby="river-title">
          <div className="container destination-guide-grid">
            <figure className="image-frame destination-guide-image reveal">
              <Image
                src="/images/general-belgrano/rio-salado.webp"
                alt="Río Salado en General Belgrano"
                fill
                sizes="(max-width: 900px) 100vw, 57vw"
              />
            </figure>
            <div className="destination-guide-copy reveal">
              <p className="eyebrow">Al aire libre</p>
              <h2 id="river-title">Río Salado y paseo costanero</h2>
              <p>
                El río y su costanera son una buena forma de empezar a conocer General
                Belgrano. El recorrido propone caminar, hacer una pausa bajo los árboles
                y ver cómo cambia el paisaje a lo largo del día.
              </p>
            </div>
          </div>
        </section>

        <section className="section destination-guide is-warm" aria-labelledby="attractions-title">
          <div className="container">
            <div className="section-heading reveal">
              <p className="eyebrow">Dos clásicos</p>
              <h2 id="attractions-title">Termas y naturaleza</h2>
              <p className="section-description">
                Dos propuestas conocidas del destino que suman planes diferentes a la
                visita. Antes de ir, conviene confirmar días, horarios y condiciones en
                los canales oficiales.
              </p>
            </div>
            <div className="destination-cards">
              <article className="destination-card reveal">
                <figure className="image-frame">
                  <Image
                    src="/images/general-belgrano/termas-del-salado.webp"
                    alt="Termas del Salado en General Belgrano"
                    fill
                    sizes="(max-width: 700px) 100vw, 48vw"
                  />
                </figure>
                <div>
                  <h3>Termas del Salado</h3>
                  <p>
                    Una alternativa para sumar descanso y una experiencia termal a la
                    escapada, especialmente cuando el plan pide ir más despacio.
                  </p>
                </div>
              </article>
              <article className="destination-card reveal">
                <figure className="image-frame">
                  <Image
                    src="/images/general-belgrano/bosque-encantado.webp"
                    alt="Bosque Encantado de General Belgrano"
                    fill
                    sizes="(max-width: 700px) 100vw, 48vw"
                  />
                </figure>
                <div>
                  <h3>Bosque Encantado</h3>
                  <p>
                    Un paseo entre vegetación y senderos para completar el viaje con más
                    aire libre y otro paisaje de General Belgrano.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="destination-cta" aria-labelledby="culture-title">
          <div className="container destination-cta-grid">
            <div>
              <p className="eyebrow eyebrow-light">Durante el año</p>
              <h2 id="culture-title">Agenda cultural de General Belgrano</h2>
            </div>
            <div>
              <p>
                Fiestas, festivales y encuentros tradicionales le dan un ritmo distinto
                a cada mes. Revisá la agenda antes de organizar tu visita.
              </p>
              <div className="destination-cta-actions">
                <Link className="button button-light" href="/agenda">
                  Ver agenda cultural <ArrowUpRight aria-hidden="true" />
                </Link>
                <Link className="button button-outline-light" href="/#reservas">
                  Consultar disponibilidad <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
