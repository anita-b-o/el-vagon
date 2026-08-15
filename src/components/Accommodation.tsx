import Image from "next/image";
import { SectionHeading } from "./SectionHeading";

export function Accommodation() {
  return (
    <section id="alojamiento" className="section accommodation-section">
      <div className="container">
        <div className="accommodation-heading">
          <SectionHeading
            eyebrow="Tu espacio"
            title="Todo lo necesario para quedarse un poco más"
            description="Un alojamiento completo para dos, con ambientes simples, cálidos y conectados con el jardín."
          />
          <p className="section-index" aria-hidden="true">
            01
          </p>
        </div>

        <div className="accommodation-story">
          <figure className="image-frame accommodation-main reveal">
            <Image
              src="/images/el-vagon/estar-comedor.webp"
              alt="Estar comedor de El Vagón con muebles de madera"
              fill
              sizes="(max-width: 768px) 100vw, 59vw"
            />
          </figure>
          <div className="accommodation-copy reveal">
            <p className="eyebrow">Adentro</p>
            <h3>Un espacio para sentirse en casa</h3>
            <p>
              El estar, la cocina y el dormitorio acompañan una estadía sin apuro. Hay
              lugar para cocinar algo rico, leer, conversar y descansar después de
              recorrer el pueblo.
            </p>
          </div>
        </div>

        <div className="room-composition">
          <figure className="image-frame room-bedroom reveal">
            <Image
              src="/images/el-vagon/dormitorio.webp"
              alt="Dormitorio de El Vagón con cama doble"
              fill
              sizes="(max-width: 768px) 100vw, 38vw"
            />
            <figcaption>Dormitorio con cama doble</figcaption>
          </figure>
          <div className="room-pair reveal">
            <figure className="image-frame room-small">
              <Image
                src="/images/el-vagon/cocina.webp"
                alt="Cocina del alojamiento"
                fill
                sizes="(max-width: 768px) 48vw, 22vw"
              />
              <figcaption>Cocina</figcaption>
            </figure>
            <figure className="image-frame room-small">
              <Image
                src="/images/el-vagon/bano.webp"
                alt="Baño privado de El Vagón"
                fill
                sizes="(max-width: 768px) 48vw, 22vw"
              />
              <figcaption>Baño privado</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

