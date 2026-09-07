import Image from "next/image";
import { SectionHeading } from "./SectionHeading";

export function Intro() {
  return (
    <section id="bienvenidos" className="section intro-section">
      <div className="container intro-grid">
        <div className="intro-copy">
          <SectionHeading eyebrow="Bienvenidos" title="Una pausa en General Belgrano" />
          <div className="intro-body reveal">
            <p>
              El Vagón es un alojamiento en General Belgrano, Buenos Aires, donde el
              tiempo parece ir un poco más despacio. Está pensado para hasta dos
              huéspedes, con verde alrededor y rincones para compartir una escapada.
            </p>
            <p>
              Acá el plan puede ser tan simple como abrir una ventana, tomar algo afuera
              y dejar que el día encuentre su propio ritmo.
            </p>
          </div>
          <a className="text-link" href="#galeria">
            Conocé el espacio
          </a>
        </div>

        <div className="intro-images reveal">
          <figure className="image-frame intro-image-main">
            <Image
              src="/images/el-vagon/fachada-galeria.webp"
              alt="Galería exterior de madera rodeada de plantas"
              fill
              sizes="(max-width: 768px) 82vw, 38vw"
            />
          </figure>
          <figure className="image-frame intro-image-small">
            <Image
              src="/images/el-vagon/entrada-jardin.webp"
              alt="Sendero de entrada a El Vagón entre vegetación"
              fill
              sizes="(max-width: 768px) 48vw, 18vw"
            />
          </figure>
          <span className="image-note">Naturaleza, madera y tiempo para vos.</span>
        </div>
      </div>
    </section>
  );
}
