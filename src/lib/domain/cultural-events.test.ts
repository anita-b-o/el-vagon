import { describe, expect, it } from "vitest";
import { culturalEventImageAlt, culturalEventSchema, monthOrderFor, slugifyCulturalEventName } from "./cultural-events";

const validEvent = {
  slug: "fiesta-ejemplo",
  name: "Fiesta de ejemplo",
  category: "Cultura",
  description: "Una descripción editorial válida.",
  fact: null,
  month: "Febrero",
  monthOrder: 2,
  timing: "Febrero · fechas variables",
  startDate: null,
  endDate: null,
  dateConfirmed: false,
  imagePath: null,
  imageAlt: null,
  externalUrl: "",
  sourceUrl: "https://example.com/fuente",
  isActive: true,
  sortOrder: 3,
};

describe("cultural event domain", () => {
  it("generates a URL-safe slug and descriptive image alt", () => {
    expect(slugifyCulturalEventName("Fiesta de la Bondiola y la Tradición")).toBe("fiesta-de-la-bondiola-y-la-tradicion");
    expect(culturalEventImageAlt("Festival Morfi")).toBe("Festival Morfi en General Belgrano");
  });

  it("derives the month order from the selected month", () => {
    expect(monthOrderFor("Agosto")).toBe(8);
  });

  it("creates a valid recurring event without inventing dates", () => {
    expect(culturalEventSchema.parse(validEvent).dateConfirmed).toBe(false);
  });

  it("accepts existing local paths and Vercel Blob image URLs", () => {
    expect(culturalEventSchema.parse({ ...validEvent, imagePath: "/images/events/existente.webp" }).imagePath).toContain("/images/");
    expect(culturalEventSchema.parse({ ...validEvent, imagePath: "https://store.public.blob.vercel-storage.com/event-images/event.jpg" }).imagePath).toContain("blob.vercel-storage.com");
  });

  it("requires a name", () => {
    expect(() => culturalEventSchema.parse({ ...validEvent, name: "" })).toThrow();
  });

  it("requires both valid dates when the date is confirmed", () => {
    expect(() => culturalEventSchema.parse({ ...validEvent, dateConfirmed: true })).toThrow(
      "Una fecha confirmada requiere un rango válido",
    );
    expect(() => culturalEventSchema.parse({
      ...validEvent,
      dateConfirmed: true,
      startDate: "2027-02-10",
      endDate: "2027-02-12",
    })).not.toThrow();
  });

  it("rejects dates marked as unconfirmed and invalid month order", () => {
    expect(() => culturalEventSchema.parse({ ...validEvent, startDate: "2027-02-10" })).toThrow();
    expect(() => culturalEventSchema.parse({ ...validEvent, monthOrder: 13 })).toThrow();
  });

  it("keeps the configured sort order", () => {
    const events = [
      culturalEventSchema.parse({ ...validEvent, slug: "b", sortOrder: 2 }),
      culturalEventSchema.parse({ ...validEvent, slug: "a", sortOrder: 1 }),
    ];
    expect(events.toSorted((a, b) => a.sortOrder - b.sortOrder).map((event) => event.slug)).toEqual(["a", "b"]);
  });

  it("supports inactive events for soft delete", () => {
    expect(culturalEventSchema.parse({ ...validEvent, isActive: false }).isActive).toBe(false);
  });
});
