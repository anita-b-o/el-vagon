import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function AgendaPreview() {
  return (
    <section id="eventos" className="agenda-preview" aria-labelledby="agenda-preview-title">
      <div className="container agenda-preview-grid">
        <figure className="agenda-preview-image image-frame reveal">
          <Image
            src="/images/events/festival-morfi.webp"
            alt="Celebración cultural al aire libre en General Belgrano"
            fill
            sizes="(max-width: 900px) 100vw, 48vw"
          />
          <figcaption>Fiestas y encuentros · General Belgrano</figcaption>
        </figure>

        <div className="agenda-preview-copy reveal">
          <p className="eyebrow eyebrow-light">Agenda cultural</p>
          <h2 id="agenda-preview-title">General Belgrano, todo el año</h2>
          <p>
            Fiestas, festivales y encuentros que forman parte de la identidad de la
            ciudad y le dan otro ritmo a cada escapada.
          </p>
          <Link className="button button-light" href="/agenda">
            Ver agenda cultural <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
