import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function GeneralBelgrano() {
  return (
    <section id="general-belgrano" className="section destination-section">
      <div className="container">
        <div className="destination-header">
          <div className="section-heading reveal">
            <p className="eyebrow">El destino</p>
            <h2>También venís a descubrir General Belgrano</h2>
          </div>
          <div className="destination-copy reveal">
            <p>
              El Vagón puede ser el punto de partida para caminar el pueblo, acercarse al
              Río Salado y recorrer su paseo costanero. Un cambio de aire cerca, con
              naturaleza y tiempo para mirar alrededor.
            </p>
            <a
              className="text-link"
              href="https://generalbelgrano.tur.ar/que-visitar"
              target="_blank"
              rel="noreferrer"
            >
              Turismo en General Belgrano <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="destination-images">
          <figure className="image-frame destination-main reveal">
            <Image
              src="/images/general-belgrano/rio-salado.webp"
              alt="Río Salado a su paso por General Belgrano"
              fill
              sizes="(max-width: 768px) 100vw, 68vw"
            />
            <figcaption>Río Salado</figcaption>
          </figure>
          <div className="destination-secondary">
            <figure className="image-frame reveal">
              <Image
                src="/images/general-belgrano/costanera-manana.webp"
                alt="Paseo costanero de General Belgrano junto al río"
                fill
                sizes="(max-width: 768px) 48vw, 22vw"
              />
            </figure>
            <figure className="image-frame reveal">
              <Image
                src="/images/general-belgrano/costanera-atardecer.webp"
                alt="Árboles y sendero de la costanera al atardecer"
                fill
                sizes="(max-width: 768px) 48vw, 22vw"
              />
            </figure>
            <p>Paseo costanero · General Belgrano</p>
          </div>
        </div>
      </div>
    </section>
  );
}

