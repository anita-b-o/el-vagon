import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Amenities } from "@/components/Amenities";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { Header } from "@/components/Header";
import { ReservationSection } from "@/components/ReservationSection";
import { galleryImages, siteConfig } from "@/data/site";
import { SITE_URL } from "@/lib/site-url";

const title = "Alojamiento para dos en General Belgrano | El Vagón";
const description =
  "Conocé El Vagón: alojamiento para dos en General Belgrano con dormitorio, cocina, baño privado, jardín, pileta de temporada, Wi-Fi y estacionamiento.";
const pageUrl = `${SITE_URL}/alojamiento`;
const socialImage = `${SITE_URL}/images/el-vagon/dormitorio.webp`;

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
    images: [{ url: socialImage, alt: "Dormitorio de El Vagón en General Belgrano" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
};

const accommodationGallery = galleryImages.filter((image) =>
  image.src.startsWith("/images/el-vagon/"),
);

export default function AccommodationPage() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <section className="agenda-hero detail-hero" aria-labelledby="accommodation-title">
          <Image
            className="agenda-hero-image"
            src="/images/el-vagon/fachada-galeria.webp"
            alt="Galería y jardín del alojamiento El Vagón"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
          />
          <div className="agenda-hero-shade" />
          <div className="container agenda-hero-content">
            <p className="eyebrow eyebrow-light">El Vagón</p>
            <h1 id="accommodation-title">Alojamiento para dos en General Belgrano</h1>
            <p>
              Un espacio cálido y completo, rodeado de jardín, para descansar de a dos
              en {siteConfig.city}, Buenos Aires.
            </p>
            <div className="agenda-hero-actions">
              <Link className="button button-light" href="#reservas">
                Consultar disponibilidad <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link className="button button-outline-light" href="/general-belgrano">
                Conocer el destino <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="section detail-intro" aria-labelledby="stay-overview-title">
          <div className="container detail-intro-grid">
            <div className="section-heading reveal">
              <p className="eyebrow">La estadía</p>
              <h2 id="stay-overview-title">Un lugar propio para bajar el ritmo</h2>
            </div>
            <div className="detail-prose reveal">
              <p>
                El Vagón recibe hasta dos huéspedes en Dorrego 747, General Belgrano.
                Tiene un dormitorio con cama doble, estar comedor, cocina y baño privado:
                lo necesario para instalarse con comodidad y organizar cada día sin apuro.
              </p>
              <p>
                Afuera, el jardín suma espacios para descansar y una pileta de temporada.
                También hay estacionamiento, Wi-Fi y bicicletas disponibles durante la
                estadía.
              </p>
              <p>
                El check-in es desde las 15:00 y el check-out hasta las 11:00. Podés ver
                las fechas disponibles y enviar una consulta directa desde esta página.
              </p>
            </div>
          </div>
        </section>

        <section className="section stay-spaces" aria-labelledby="spaces-title">
          <div className="container">
            <div className="section-heading reveal">
              <p className="eyebrow">Puertas adentro</p>
              <h2 id="spaces-title">Los ambientes de El Vagón</h2>
              <p className="section-description">
                Dormitorio, cocina y baño privado se integran con un estar pensado para
                compartir desayunos, lecturas y descansos después de recorrer la ciudad.
              </p>
            </div>
            <div className="stay-spaces-grid">
              <figure className="image-frame stay-space-main reveal">
                <Image
                  src="/images/el-vagon/dormitorio.webp"
                  alt="Dormitorio con cama doble de El Vagón"
                  fill
                  sizes="(max-width: 900px) 100vw, 55vw"
                />
                <figcaption>Dormitorio con cama doble</figcaption>
              </figure>
              <div className="stay-spaces-pair">
                <figure className="image-frame reveal">
                  <Image
                    src="/images/el-vagon/cocina.webp"
                    alt="Cocina de El Vagón"
                    fill
                    sizes="(max-width: 900px) 50vw, 22vw"
                  />
                  <figcaption>Cocina</figcaption>
                </figure>
                <figure className="image-frame reveal">
                  <Image
                    src="/images/el-vagon/bano.webp"
                    alt="Baño privado de El Vagón"
                    fill
                    sizes="(max-width: 900px) 50vw, 22vw"
                  />
                  <figcaption>Baño privado</figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        <Amenities />

        <section className="section detail-gallery" aria-labelledby="stay-gallery-title">
          <div className="container">
            <div className="gallery-heading">
              <div className="section-heading reveal">
                <p className="eyebrow">Galería</p>
                <h2 id="stay-gallery-title">El alojamiento y su jardín</h2>
                <p className="section-description">
                  Una recorrida visual por los interiores, la galería, el deck y la pileta.
                </p>
              </div>
              <p className="gallery-instruction">Tocá una imagen para verla completa.</p>
            </div>
            <Gallery images={accommodationGallery} />
          </div>
        </section>

        <ReservationSection />
      </main>
      <Footer />
    </>
  );
}
