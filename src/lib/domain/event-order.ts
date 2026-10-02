export type OrderedEvent = { id: string; monthOrder: number; sortOrder: number };

/**
 * Produces a compact, stable sequence for one month and optionally swaps an
 * event with its adjacent neighbour.  It deliberately never considers an
 * event in a different month.
 */
export function reorderMonthEvents<T extends OrderedEvent>(events: T[], id: string, direction: "up" | "down") {
  const target = events.find((event) => event.id === id);
  if (!target) return events;

  const monthEvents = events
    .filter((event) => event.monthOrder === target.monthOrder)
    .toSorted((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const index = monthEvents.findIndex((event) => event.id === id);
  const neighbourIndex = direction === "up" ? index - 1 : index + 1;
  if (neighbourIndex < 0 || neighbourIndex >= monthEvents.length) return events;

  const reordered = [...monthEvents];
  [reordered[index], reordered[neighbourIndex]] = [reordered[neighbourIndex], reordered[index]];
  const orders = new Map(reordered.map((event, sortOrder) => [event.id, sortOrder]));
  return events.map((event) => orders.has(event.id) ? { ...event, sortOrder: orders.get(event.id)! } : event);
}

export function normalizeMonthEvents<T extends OrderedEvent>(events: T[], monthOrder: number) {
  const ordered = events
    .filter((event) => event.monthOrder === monthOrder)
    .toSorted((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const orders = new Map(ordered.map((event, sortOrder) => [event.id, sortOrder]));
  return events.map((event) => orders.has(event.id) ? { ...event, sortOrder: orders.get(event.id)! } : event);
}
