import { describe, expect, it } from "vitest";
import { recurringEvents, recurringMonths } from "./recurring-events";

const excludedEvents = [
  "Festín",
  "Kilómetro del Alfajor",
  "Exposición de la Producción Total",
  "Semana Joven",
  "Paseo Navideño",
];

describe("recurring events editorial data", () => {
  it("contains exactly the eight confirmed recurring events with unique slugs", () => {
    expect(recurringEvents).toHaveLength(8);
    expect(new Set(recurringEvents.map((event) => event.slug)).size).toBe(8);
  });

  it("keeps events in the configured chronological month order", () => {
    const monthOrder = recurringMonths.map((month) => month.name);
    const positions = recurringEvents.map((event) => monthOrder.indexOf(event.month));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("keeps an HTTPS editorial source for every event", () => {
    for (const event of recurringEvents) {
      expect(event.sources.length, event.name).toBeGreaterThan(0);
      expect(event.sources.every((source) => source.url.startsWith("https://"))).toBe(true);
    }
  });

  it("uses only the two approved local official photographs", () => {
    const images = recurringEvents.flatMap((event) => (event.image ? [event.image] : []));

    expect(images.map((image) => image.src)).toEqual([
      "/images/events/aniversario-general-belgrano.webp",
      "/images/events/fiesta-bondiola-tradicion.webp",
    ]);
    expect(images.every((image) => image.sourceLabel === "Archivo oficial municipal")).toBe(
      true,
    );
    expect(images.every((image) => image.sourceUrl.startsWith("https://assets.zyrosite.com/"))).toBe(
      true,
    );
  });

  it("does not include excluded events or unconfirmed next editions", () => {
    const names = recurringEvents.map((event) => event.name);

    for (const excludedEvent of excludedEvents) {
      expect(names.some((name) => name.includes(excludedEvent))).toBe(false);
    }
    expect(recurringEvents.every((event) => event.nextEdition === undefined)).toBe(true);
  });

  it("uses stable seasonal timing instead of edition-specific dates", () => {
    expect(recurringEvents.map((event) => event.timing)).toEqual([
      "Enero · fechas variables",
      "Febrero",
      "Febrero · según calendario de Carnaval",
      "Febrero",
      "Alrededor del 1 de agosto",
      "Noviembre",
      "Diciembre",
      "8 de diciembre",
    ]);
  });
});
