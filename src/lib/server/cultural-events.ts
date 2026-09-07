import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { culturalEvents, type CulturalEventRow } from "@/db/schema";

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

export async function createCulturalEvent(input: Omit<CulturalEventRow, "id" | "createdAt" | "updatedAt">) {
  await getDb().insert(culturalEvents).values(input);
}

export async function updateCulturalEvent(id: string, input: Partial<Omit<CulturalEventRow, "id" | "createdAt" | "updatedAt">>) {
  await getDb().update(culturalEvents).set({ ...input, updatedAt: new Date() }).where(eq(culturalEvents.id, id));
}

export async function deactivateCulturalEvent(id: string) {
  await updateCulturalEvent(id, { isActive: false });
}

export async function deleteCulturalEvent(id: string) {
  await getDb().delete(culturalEvents).where(and(eq(culturalEvents.id, id), eq(culturalEvents.isActive, false)));
}
