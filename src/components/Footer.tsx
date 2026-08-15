import Image from "next/image";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { mapsSearchUrl } from "@/lib/booking";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Image
            src={siteConfig.logos.light}
            alt="El Vagón"
            width={513}
            height={528}
            sizes="180px"
          />
          <p>General Belgrano · Buenos Aires</p>
        </div>
        <div className="footer-links">
          <p className="eyebrow eyebrow-light">Encontranos</p>
          <a href={siteConfig.contact.instagram} target="_blank" rel="noreferrer">
            Instagram <ArrowUpRight aria-hidden="true" />
          </a>
          <a href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email} <ArrowUpRight aria-hidden="true" />
          </a>
          <a href={`https://wa.me/${siteConfig.contact.whatsapp.number}`}>
            {siteConfig.contact.whatsapp.display} <ArrowUpRight aria-hidden="true" />
          </a>
          <a href={mapsSearchUrl} target="_blank" rel="noreferrer">
            Ubicación <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <a className="back-to-top" href="#el-vagon" aria-label="Volver arriba">
          <ArrowUp aria-hidden="true" />
          <span>Volver arriba</span>
        </a>
      </div>
      <div className="container footer-bottom">
        <p>© {year} El Vagón</p>
        <p>{siteConfig.address}</p>
      </div>
    </footer>
  );
}
