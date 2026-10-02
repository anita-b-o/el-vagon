import { describe, expect, it } from "vitest";
import { normalizeMonthEvents, reorderMonthEvents } from "./event-order";

const events = [
  { id: "festival", monthOrder: 2, sortOrder: 0 },
  { id: "carnaval", monthOrder: 2, sortOrder: 3 },
  { id: "mega", monthOrder: 2, sortOrder: 5 },
  { id: "agosto", monthOrder: 8, sortOrder: 0 },
];

describe("event ordering", () => {
  it("moves an event up and compacts the month sequence", () => {
    expect(reorderMonthEvents(events, "carnaval", "up").filter((event) => event.monthOrder === 2))
      .toEqual([{ id: "festival", monthOrder: 2, sortOrder: 1 }, { id: "carnaval", monthOrder: 2, sortOrder: 0 }, { id: "mega", monthOrder: 2, sortOrder: 2 }]);
  });

  it("moves an event down within its month", () => {
    expect(reorderMonthEvents(events, "carnaval", "down").filter((event) => event.monthOrder === 2).map((event) => [event.id, event.sortOrder]))
      .toEqual([["festival", 0], ["carnaval", 2], ["mega", 1]]);
  });

  it("does not move the first or last event beyond a month boundary", () => {
    expect(reorderMonthEvents(events, "festival", "up")).toEqual(events);
    expect(reorderMonthEvents(events, "mega", "down")).toEqual(events);
  });

  it("never changes another month and normalizes sparse existing orders", () => {
    expect(reorderMonthEvents(events, "carnaval", "up").find((event) => event.id === "agosto"))
      .toEqual({ id: "agosto", monthOrder: 8, sortOrder: 0 });
    expect(normalizeMonthEvents(events, 2).filter((event) => event.monthOrder === 2).map((event) => event.sortOrder))
      .toEqual([0, 1, 2]);
  });
});
