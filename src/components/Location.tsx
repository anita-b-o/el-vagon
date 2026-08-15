import { ArrowUpRight, MapPin } from "lucide-react";
import { siteConfig } from "@/data/site";
import { mapsEmbedUrl, mapsSearchUrl } from "@/lib/booking";

export function Location() {
  return (
    <section id="ubicacion" className="location-section" aria-labelledby="location-title">
      <div className="container location-grid">
        <div className="location-copy reveal">
          <p className="eyebrow eyebrow-light">Ubicación</p>
          <h2 id="location-title">Estamos en General Belgrano</h2>
          <address>
            <MapPin aria-hidden="true" />
            <span>
              {siteConfig.address}
              <br />
              {siteConfig.city}
              <br />
              {siteConfig.province}, {siteConfig.country}
            </span>
          </address>
          <a
            className="button button-outline-light"
            href={mapsSearchUrl}
            target="_blank"
            rel="noreferrer"
          >
            Cómo llegar <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <div className="map-wrap reveal">
          <iframe
            src={mapsEmbedUrl}
            title="Mapa de la ubicación de El Vagón"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

