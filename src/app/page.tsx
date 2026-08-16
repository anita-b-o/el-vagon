import { Accommodation } from "@/components/Accommodation";
import { AgendaPreview } from "@/components/AgendaPreview";
import { Amenities } from "@/components/Amenities";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { GallerySection } from "@/components/GallerySection";
import { GeneralBelgrano } from "@/components/GeneralBelgrano";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { Location } from "@/components/Location";
import { ReservationSection } from "@/components/ReservationSection";
import { amenities, siteConfig } from "@/data/site";
import { getSiteUrl } from "@/lib/site-url";

export default function Home() {
  const siteUrl = getSiteUrl();
  const absoluteImages = siteUrl
    ? [
        `${siteUrl}/images/el-vagon/hero-jardin.webp`,
        `${siteUrl}/images/el-vagon/fachada-galeria.webp`,
      ]
    : undefined;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: siteConfig.name,
    description: siteConfig.shortDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.province,
      addressCountry: "AR",
    },
    sameAs: [siteConfig.contact.instagram],
    ...(siteUrl ? { url: siteUrl } : {}),
    ...(absoluteImages ? { image: absoluteImages } : {}),
    amenityFeature: amenities
      .filter((amenity) => amenity.icon !== "paw")
      .map((amenity) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity.label,
        value: true,
      })),
  };

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">
        <Hero />
        <Intro />
        <Accommodation />
        <Amenities />
        <Experience />
        <GallerySection />
        <GeneralBelgrano />
        <AgendaPreview />
        <Location />
        <ReservationSection />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
