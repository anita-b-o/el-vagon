import { Accommodation } from "@/components/Accommodation";
import { Amenities } from "@/components/Amenities";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { FrequentlyAskedQuestions } from "@/components/FrequentlyAskedQuestions";
import { GallerySection } from "@/components/GallerySection";
import { GeneralBelgrano } from "@/components/GeneralBelgrano";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { Location } from "@/components/Location";
import { ReservationSection } from "@/components/ReservationSection";
import { amenities, siteConfig } from "@/data/site";
import { SITE_URL } from "@/lib/site-url";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${SITE_URL}/#lodging`,
    name: siteConfig.name,
    description: siteConfig.shortDescription,
    url: SITE_URL,
    image: [
      `${SITE_URL}/images/el-vagon/hero-jardin.webp`,
      `${SITE_URL}/images/el-vagon/fachada-galeria.webp`,
    ],
    telephone: siteConfig.contact.telephone,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.province,
      addressCountry: "AR",
    },
    sameAs: [
      siteConfig.contact.instagram,
      siteConfig.externalProfiles.booking,
      siteConfig.externalProfiles.airbnb,
    ],
    checkinTime: "15:00",
    checkoutTime: "11:00",
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
        <FrequentlyAskedQuestions />
        <Experience />
        <GallerySection />
        <GeneralBelgrano />
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
