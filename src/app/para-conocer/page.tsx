import type { Metadata } from "next";
import { AttractionsList } from "@/components/AttractionsList";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE_URL } from "@/lib/site-url";

const title = "Qué conocer en General Belgrano | El Vagón";
const description =
  "Descubrí Termas del Salado, Bosque Encantado y otros lugares para conocer durante una escapada a General Belgrano.";
const pageUrl = `${SITE_URL}/para-conocer`;
const socialImage = `${SITE_URL}/images/general-belgrano/termas-del-salado.webp`;

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
    images: [{ url: socialImage, alt: "Termas del Salado en General Belgrano" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
};

export default function AttractionsPage() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <section className="attractions-hero" aria-labelledby="attractions-page-title">
          <div className="container attractions-hero-content">
            <p className="eyebrow eyebrow-light">General Belgrano</p>
            <h1 id="attractions-page-title">Lugares para sumar al viaje</h1>
            <p>Naturaleza, termas y rincones para descubrir durante tu estadía.</p>
          </div>
        </section>
        <section className="section attractions-page-list" aria-label="Lugares para conocer">
          <div className="container">
            <AttractionsList />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
