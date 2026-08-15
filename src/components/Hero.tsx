import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site";

export function Hero() {
  return (
    <section id="el-vagon" className="hero" aria-labelledby="hero-title">
      <Image
        className="hero-image"
        src="/images/el-vagon/hero-jardin.webp"
        alt="El Vagón entre árboles y vegetación"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
      />
      <div className="hero-shade" />
      <div className="hero-content container">
        <p className="hero-kicker">EL VAGÓN</p>
        <h1 id="hero-title">Un refugio entre naturaleza y tranquilidad</h1>
        <p className="hero-location">
          {siteConfig.city} <span aria-hidden="true">·</span> {siteConfig.province}
        </p>
        <p className="hero-intro">
          Un lugar para bajar el ritmo, disfrutar el verde y descubrir General Belgrano
          de otra manera.
        </p>
        <div className="hero-actions">
          <a
            className="button button-light"
            href="#reservas"
          >
            Consultar fechas <ArrowUpRight aria-hidden="true" />
          </a>
          <a className="text-link text-link-light" href="#bienvenidos">
            Descubrir El Vagón
          </a>
        </div>
      </div>
      <a className="scroll-cue" href="#bienvenidos" aria-label="Ir a la bienvenida">
        <span>Seguir</span>
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  );
}
