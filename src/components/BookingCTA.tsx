import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getBookingContact } from "@/lib/booking";

export function BookingCTA() {
  const booking = getBookingContact();

  return (
    <section id="contacto" className="booking-section" aria-labelledby="booking-title">
      <Image
        src="/images/el-vagon/detalle-exterior.webp"
        alt="Detalle exterior de El Vagón entre plantas"
        fill
        sizes="100vw"
      />
      <div className="booking-overlay" />
      <div className="container booking-content reveal">
        <p className="eyebrow eyebrow-light">Tu escapada</p>
        <h2 id="booking-title">Tu próxima pausa puede empezar acá</h2>
        <p>
          Consultanos disponibilidad y empezá a preparar tu escapada a General Belgrano.
        </p>
        <a
          className="button button-light button-large"
          href={booking.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Consultar disponibilidad por ${booking.channel}`}
        >
          Consultar disponibilidad <ArrowUpRight aria-hidden="true" />
        </a>
        {booking.channel === "Instagram" ? (
          <small>Mientras definimos el WhatsApp, te respondemos por Instagram.</small>
        ) : null}
      </div>
    </section>
  );
}

