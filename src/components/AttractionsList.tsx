import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { attractions } from "@/data/attractions";

export function AttractionsList() {
  return (
    <div className="destination-attractions attractions-list">
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
                  loading={index === 0 ? "eager" : "lazy"}
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
              <h2>{attraction.name}</h2>
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
  );
}
