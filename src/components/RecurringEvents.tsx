import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { recurringEvents, recurringMonths } from "@/data/recurring-events";

const officialAgendaUrl = "https://generalbelgrano.tur.ar/novedades";

type RecurringEventsProps = {
  showIntro?: boolean;
};

export function RecurringEvents({ showIntro = true }: RecurringEventsProps) {
  return (
    <section
      id="eventos"
      className={`section events-section${showIntro ? "" : " agenda-events-section"}`}
      {...(showIntro
        ? { "aria-labelledby": "events-title" }
        : { "aria-label": "Eventos recurrentes de General Belgrano" })}
    >
      <div className="container">
        {showIntro ? (
          <header className="events-intro">
            <div className="section-heading reveal">
              <p className="eyebrow">Agenda cultural</p>
              <h2 id="events-title">General Belgrano, todo el año</h2>
            </div>
            <p className="events-intro-copy reveal">
              Sabores, música y tradiciones marcan distintos momentos del año. Una guía
              para imaginar la próxima escapada y descubrir cómo se vive cada encuentro.
            </p>
          </header>
        ) : null}

        <nav className="events-month-nav reveal" aria-label="Recorrer eventos por mes">
          <div className="events-month-nav-track">
            {recurringMonths.map((month) => (
              <a href={`#eventos-${month.id}`} key={month.id}>
                {month.shortLabel}
              </a>
            ))}
          </div>
        </nav>

        <div className="events-timeline">
          {recurringMonths.map((month) => {
            const monthEvents = recurringEvents.filter((event) => event.month === month.name);

            return (
              <section
                className="events-month"
                id={`eventos-${month.id}`}
                aria-labelledby={`eventos-${month.id}-title`}
                key={month.id}
              >
                <div className="events-month-heading reveal">
                  <p aria-hidden="true">{month.shortLabel}</p>
                  <h3 id={`eventos-${month.id}-title`}>{month.name}</h3>
                  <span>
                    {monthEvents.length} {monthEvents.length === 1 ? "encuentro" : "encuentros"}
                  </span>
                </div>

                <div className="events-month-list">
                  {monthEvents.map((event) => {
                    const eventIndex = recurringEvents.findIndex(
                      (candidate) => candidate.slug === event.slug,
                    );
                    const number = String(eventIndex + 1).padStart(2, "0");

                    return (
                      <article
                        className={`event-story${eventIndex % 2 ? " is-reversed" : ""}${
                          event.image ? " has-image" : " is-typographic"
                        }`}
                        data-event-slug={event.slug}
                        key={event.slug}
                      >
                        {event.image ? (
                          <figure className="event-story-visual event-story-image image-frame reveal">
                            <Image
                              src={event.image.src}
                              alt={event.image.alt}
                              fill
                              sizes="(max-width: 900px) 100vw, 54vw"
                              loading="lazy"
                              style={{ objectPosition: event.image.objectPosition }}
                            />
                            <figcaption>{event.image.sourceLabel}</figcaption>
                          </figure>
                        ) : (
                          <div
                            className="event-story-visual event-story-type reveal"
                            aria-hidden="true"
                          >
                            <span className="event-story-number">{number}</span>
                            <span className="event-story-month">{month.shortLabel}</span>
                          </div>
                        )}

                        <div className="event-story-copy reveal">
                          <p className="event-story-timing">{event.timing}</p>
                          <h4>{event.name}</h4>
                          <p className="event-story-category">{event.category}</p>
                          <p className="event-story-description">{event.description}</p>
                          {event.fact ? <p className="event-story-fact">{event.fact}</p> : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="events-note reveal">
          <p>
            Las fechas pueden variar de una edición a otra. Consultá la agenda oficial de
            General Belgrano antes de organizar tu visita.
          </p>
          <a
            className="text-link"
            href={officialAgendaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver agenda oficial <ArrowUpRight aria-hidden="true" />
          </a>
        </footer>
      </div>
    </section>
  );
}
