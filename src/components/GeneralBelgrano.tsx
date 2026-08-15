import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

type Attraction = {
  name: string;
  description: string;
  href: string;
  image?: {
    src: string;
    alt: string;
  };
};

const attractions: Attraction[] = [
  {
    name: "Termas del Salado",
    description:
      "Un espacio termal para relajarse y sumar una experiencia distinta durante la visita a General Belgrano.",
    href: "https://share.google/TbrwB7rDFMfTW1iP4",
  },
  {
    name: "Bosque Encantado",
    description:
      "Un paseo entre naturaleza y senderos, ideal para disfrutar General Belgrano con más calma.",
    href: "https://share.google/KdC14zxLpOg0G6goV",
  },
];

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

        <div className="destination-attractions" aria-labelledby="attractions-title">
          <div className="destination-attractions-heading reveal">
            <p className="eyebrow">Para conocer</p>
            <h3 id="attractions-title">Dos propuestas para sumar al viaje</h3>
          </div>

          {attractions.map((attraction, index) => {
            const number = String(index + 1).padStart(2, "0");

            return (
              <article
                className={`destination-attraction${index % 2 ? " is-reversed" : ""}`}
                key={attraction.name}
              >
                {attraction.image ? (
                  <figure className="image-frame destination-attraction-visual reveal">
                    <Image
                      src={attraction.image.src}
                      alt={attraction.image.alt}
                      fill
                      sizes="(max-width: 900px) 100vw, 58vw"
                    />
                  </figure>
                ) : (
                  <div
                    className="destination-attraction-visual destination-attraction-number reveal"
                    aria-hidden="true"
                  >
                    <span>{number}</span>
                  </div>
                )}

                <div className="destination-attraction-copy reveal">
                  <p className="eyebrow">Escapada {number}</p>
                  <h4>{attraction.name}</h4>
                  <p>{attraction.description}</p>
                  <a
                    className="text-link"
                    href={attraction.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver ubicación <ArrowUpRight aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
