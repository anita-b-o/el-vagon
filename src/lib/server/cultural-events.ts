import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { culturalEvents, type CulturalEventRow } from "@/db/schema";
import { normalizeMonthEvents } from "@/lib/domain/event-order";

export async function getPublicCulturalEvents() {
  try {
    return await getDb().select().from(culturalEvents).where(eq(culturalEvents.isActive, true))
      .orderBy(asc(culturalEvents.monthOrder), asc(culturalEvents.sortOrder), asc(culturalEvents.name));
  } catch (error) {
    console.error("No se pudo leer la agenda cultural", error instanceof Error ? error.message : "unknown error");
    return [];
  }
}

export function getAdminCulturalEvents() {
  return getDb().select().from(culturalEvents)
    .orderBy(asc(culturalEvents.monthOrder), asc(culturalEvents.sortOrder), asc(culturalEvents.name));
}

export async function getCulturalEvent(id: string) {
  const rows = await getDb().select().from(culturalEvents).where(eq(culturalEvents.id, id)).limit(1);
  return rows[0];
}

export async function createCulturalEvent(input: Omit<CulturalEventRow, "id" | "createdAt" | "updatedAt">) {
  await getDb().transaction(async (tx) => {
    const monthEvents = await tx.select().from(culturalEvents).where(eq(culturalEvents.monthOrder, input.monthOrder))
      .orderBy(asc(culturalEvents.sortOrder), asc(culturalEvents.createdAt));
    const normalized = normalizeMonthEvents(monthEvents, input.monthOrder);
    await persistSortOrders(tx, normalized);
    await tx.insert(culturalEvents).values({ ...input, sortOrder: normalized.length });
  });
}

export async function updateCulturalEvent(id: string, input: Partial<Omit<CulturalEventRow, "id" | "createdAt" | "updatedAt">>) {
  await getDb().transaction(async (tx) => {
    const existing = (await tx.select().from(culturalEvents).where(eq(culturalEvents.id, id)).limit(1))[0];
    if (!existing) return;
    const movingToAnotherMonth = input.monthOrder !== undefined && input.monthOrder !== existing.monthOrder;
    if (!movingToAnotherMonth) {
      await tx.update(culturalEvents).set({ ...input, updatedAt: new Date() }).where(eq(culturalEvents.id, id));
      return;
    }

    const destination = await tx.select().from(culturalEvents).where(eq(culturalEvents.monthOrder, input.monthOrder!))
      .orderBy(asc(culturalEvents.sortOrder), asc(culturalEvents.createdAt));
    const normalizedDestination = normalizeMonthEvents(destination, input.monthOrder!);
    await persistSortOrders(tx, normalizedDestination);
    await tx.update(culturalEvents).set({ ...input, sortOrder: normalizedDestination.length, updatedAt: new Date() }).where(eq(culturalEvents.id, id));

    const source = await tx.select().from(culturalEvents).where(eq(culturalEvents.monthOrder, existing.monthOrder))
      .orderBy(asc(culturalEvents.sortOrder), asc(culturalEvents.createdAt));
    await persistSortOrders(tx, normalizeMonthEvents(source, existing.monthOrder));
  });
}

export async function deactivateCulturalEvent(id: string) {
  await setCulturalEventActive(id, false);
}

/** Changes publication state only; event content and its image are deliberately untouched. */
export async function setCulturalEventActive(id: string, isActive: boolean) {
  await updateCulturalEvent(id, { isActive });
}

export async function deleteCulturalEvent(id: string) {
  await getDb().transaction(async (tx) => {
    const existing = (await tx.select().from(culturalEvents).where(eq(culturalEvents.id, id)).limit(1))[0];
    if (!existing || existing.isActive) return;
    await tx.delete(culturalEvents).where(and(eq(culturalEvents.id, id), eq(culturalEvents.isActive, false)));
    const remaining = await tx.select().from(culturalEvents).where(eq(culturalEvents.monthOrder, existing.monthOrder))
      .orderBy(asc(culturalEvents.sortOrder), asc(culturalEvents.createdAt));
    await persistSortOrders(tx, normalizeMonthEvents(remaining, existing.monthOrder));
  });
}

type SortOrderExecutor = Pick<ReturnType<typeof getDb>, "update">;

async function persistSortOrders(db: SortOrderExecutor, events: Pick<CulturalEventRow, "id" | "sortOrder">[]) {
  await Promise.all(events.map((event) => db.update(culturalEvents)
    .set({ sortOrder: event.sortOrder, updatedAt: new Date() })
    .where(eq(culturalEvents.id, event.id))));
}

export type CulturalEventOrderGroup = {
  month: number;
  ids: string[];
};

/**
 * Persists complete month groups only. The database is the source of truth
 * for membership, so a client cannot move an event into another month or
 * silently omit a sibling from the final order.
 */
export async function saveCulturalEventOrder(groups: CulturalEventOrderGroup[]) {
  return getDb().transaction(async (tx) => {
    const seenMonths = new Set<number>();
    const seenIds = new Set<string>();

    for (const group of groups) {
      if (seenMonths.has(group.month)) throw new Error("Un mes fue enviado más de una vez.");
      seenMonths.add(group.month);
      for (const id of group.ids) {
        if (seenIds.has(id)) throw new Error("Un evento fue enviado más de una vez.");
        seenIds.add(id);
      }
    }

    for (const group of groups) {
      const monthEvents = await tx.select().from(culturalEvents)
        .where(eq(culturalEvents.monthOrder, group.month))
        .orderBy(asc(culturalEvents.sortOrder), asc(culturalEvents.createdAt), asc(culturalEvents.id));
      const databaseIds = new Set(monthEvents.map((event) => event.id));

      if (
        group.ids.length !== monthEvents.length ||
        group.ids.some((id) => !databaseIds.has(id))
      ) {
        throw new Error("Los eventos enviados no coinciden con el mes actual.");
      }

      // The final position is derived exclusively from the submitted ID list.
      await persistSortOrders(tx, group.ids.map((id, sortOrder) => ({ id, sortOrder })));
    }
  });
}
