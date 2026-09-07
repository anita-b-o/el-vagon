import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { attractions } from "@/data/attractions";

type HeadingLevel = "h2" | "h3" | "h4";

type AttractionsBlockProps = {
  headingLevel?: Extract<HeadingLevel, "h2" | "h3">;
  itemHeadingLevel?: Extract<HeadingLevel, "h3" | "h4">;
  standalone?: boolean;
};

export function AttractionsBlock({
  headingLevel = "h3",
  itemHeadingLevel = "h4",
  standalone = false,
}: AttractionsBlockProps) {
  const Heading = headingLevel;
  const ItemHeading = itemHeadingLevel;

  return (
    <div
      className={`destination-attractions${standalone ? " is-standalone" : ""}`}
      aria-labelledby="attractions-title"
    >
      <div className="destination-attractions-heading reveal">
        <p className="eyebrow">Para conocer</p>
        <Heading id="attractions-title">Dos propuestas para sumar al viaje</Heading>
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
                  style={{ objectPosition: attraction.image.objectPosition }}
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
              <ItemHeading>{attraction.name}</ItemHeading>
              <p>{attraction.description}</p>
              <a
                className="text-link"
                href={attraction.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver ubicación <ArrowUpRight aria-hidden="true" />
              </a>
              {attraction.secondaryHref && attraction.secondaryLabel ? (
                <a
                  className="text-link"
                  href={attraction.secondaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {attraction.secondaryLabel} <ArrowUpRight aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
