"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/admin-auth";
import { createCulturalEvent, deactivateCulturalEvent, deleteCulturalEvent, getCulturalEvent, updateCulturalEvent } from "@/lib/server/cultural-events";
import { culturalEventImageAlt, culturalEventSchema, monthOrderFor, slugifyCulturalEventName } from "@/lib/domain/cultural-events";

export type EventActionResult = { ok: true; message: string } | { ok: false; message: string };

function errorMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "Datos inválidos.";
  if (error instanceof Error && error.message.includes("duplicate")) return "Ese slug ya está en uso.";
  return error instanceof Error && error.message ? error.message : "No pudimos guardar el evento.";
}

function parseInput(raw: unknown, existing?: Awaited<ReturnType<typeof getCulturalEvent>>) {
  const value = raw as Record<string, unknown>;
  return culturalEventSchema.parse({
    ...value,
    slug: existing?.slug ?? slugifyCulturalEventName(String(value.name ?? "")),
    fact: existing?.fact ?? null,
    monthOrder: value.monthOrder || monthOrderFor(String(value.month ?? "")),
    timing: existing?.timing ?? String(value.month ?? ""),
    startDate: value.dateConfirmed ? value.startDate || null : null,
    endDate: value.dateConfirmed ? value.endDate || null : null,
    imagePath: value.imagePath || null,
    imageAlt: existing?.imageAlt ?? culturalEventImageAlt(String(value.name ?? "")),
    externalUrl: value.externalUrl || "",
    sourceUrl: existing?.sourceUrl || "",
  });
}

export async function saveCulturalEventAction(raw: unknown, id?: string): Promise<EventActionResult> {
  await requireAdmin();
  try {
    const parsedId = id ? z.uuid().parse(id) : undefined;
    const existing = parsedId ? await getCulturalEvent(parsedId) : undefined;
    if (parsedId && !existing) return { ok: false, message: "No encontramos ese evento." };
    const input = parseInput(raw, existing);
    if (parsedId) await updateCulturalEvent(parsedId, input);
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
