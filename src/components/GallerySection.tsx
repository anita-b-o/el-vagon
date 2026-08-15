import { galleryImages } from "@/data/site";
import { Gallery } from "./Gallery";
import { SectionHeading } from "./SectionHeading";

export function GallerySection() {
  return (
    <section id="galeria" className="section gallery-section">
      <div className="container">
        <div className="gallery-heading">
          <SectionHeading
            eyebrow="Galería"
            title="Un poco de lo que te espera"
            description="Recorré los espacios, el jardín y algunos paisajes de General Belgrano."
          />
          <p className="gallery-instruction">Tocá una imagen para verla completa.</p>
        </div>
        <Gallery images={galleryImages} />
      </div>
    </section>
  );
}
