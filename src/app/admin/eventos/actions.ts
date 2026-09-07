"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/admin-auth";
import { createCulturalEvent, deactivateCulturalEvent, deleteCulturalEvent, updateCulturalEvent } from "@/lib/server/cultural-events";
import { culturalEventSchema } from "@/lib/domain/cultural-events";

export type EventActionResult = { ok: true; message: string } | { ok: false; message: string };

function errorMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "Datos inválidos.";
  if (error instanceof Error && error.message.includes("duplicate")) return "Ese slug ya está en uso.";
  return error instanceof Error && error.message ? error.message : "No pudimos guardar el evento.";
}

function parseInput(raw: unknown) {
  const value = raw as Record<string, unknown>;
  return culturalEventSchema.parse({
    ...value,
    fact: value.fact || null,
    startDate: value.startDate || null,
    endDate: value.endDate || null,
    imagePath: value.imagePath || null,
    imageAlt: value.imageAlt || null,
    externalUrl: value.externalUrl || "",
    sourceUrl: value.sourceUrl || "",
  });
}

export async function saveCulturalEventAction(raw: unknown, id?: string): Promise<EventActionResult> {
  await requireAdmin();
  try {
    const input = parseInput(raw);
    if (id) await updateCulturalEvent(z.uuid().parse(id), input);
    else await createCulturalEvent(input);
    revalidatePath("/agenda");
    revalidatePath("/admin/eventos");
    return { ok: true, message: id ? "Evento actualizado." : "Evento creado." };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}

export async function deactivateCulturalEventAction(id: string): Promise<EventActionResult> {
  await requireAdmin();
  try {
    await deactivateCulturalEvent(z.uuid().parse(id));
    revalidatePath("/agenda");
    revalidatePath("/admin/eventos");
    return { ok: true, message: "Evento desactivado." };
  } catch (error) { return { ok: false, message: errorMessage(error) }; }
}

export async function deleteCulturalEventAction(id: string): Promise<EventActionResult> {
  await requireAdmin();
  try {
    await deleteCulturalEvent(z.uuid().parse(id));
    revalidatePath("/agenda");
    revalidatePath("/admin/eventos");
    return { ok: true, message: "Evento eliminado." };
  } catch (error) { return { ok: false, message: errorMessage(error) }; }
}
