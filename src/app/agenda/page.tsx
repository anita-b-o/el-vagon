import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RecurringEvents } from "@/components/RecurringEvents";
import { getSiteUrl } from "@/lib/site-url";

const title = "Agenda cultural de General Belgrano | El Vagón";
const description =
  "Descubrí las fiestas, festivales y eventos recurrentes de General Belgrano y planificá tu próxima escapada a El Vagón.";
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title,
  description,
  ...(siteUrl ? { alternates: { canonical: `${siteUrl}/agenda` } } : {}),
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "El Vagón",
    title,
    description,
    ...(siteUrl ? { url: `${siteUrl}/agenda` } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function AgendaPage() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <section className="agenda-hero" aria-labelledby="agenda-title">
          <Image
            className="agenda-hero-image"
            src="/images/events/festival-mayor-tango-folklore.webp"
            alt="Festival cultural en General Belgrano"
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
          />
          <div className="agenda-hero-shade" />
          <div className="container agenda-hero-content">
            <p className="eyebrow eyebrow-light">General Belgrano</p>
            <h1 id="agenda-title">Agenda cultural</h1>
            <p>
              Fiestas, festivales y encuentros que acompañan el calendario de General
              Belgrano durante todo el año.
            </p>
            <div className="agenda-hero-actions">
              <Link className="button button-outline-light" href="/">
                <ArrowLeft aria-hidden="true" /> Volver a El Vagón
              </Link>
              <Link className="button button-light" href="/#reservas">
                Consultar disponibilidad <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
        <RecurringEvents showIntro={false} />
      </main>
      <Footer />
    </>
  );
}
