"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/admin-auth";
import { createCulturalEvent, deleteCulturalEvent, getCulturalEvent, setCulturalEventActive, updateCulturalEvent } from "@/lib/server/cultural-events";
import { culturalEventImageAlt, culturalEventSchema, monthOrderFor, slugifyCulturalEventName } from "@/lib/domain/cultural-events";
import { deleteManagedEventImage, uploadEventImage } from "@/lib/server/event-images";

export type EventActionResult = { ok: true; message: string } | { ok: false; message: string };

function errorMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "Datos inválidos.";
  if (error instanceof Error && error.message.includes("duplicate")) return "Ese slug ya está en uso.";
  return error instanceof Error && error.message ? error.message : "No pudimos guardar el evento.";
}

function parseInput(raw: unknown, existing?: Awaited<ReturnType<typeof getCulturalEvent>>, imagePath?: string | null) {
  const value = raw as Record<string, unknown>;
  return culturalEventSchema.parse({
    ...value,
    slug: existing?.slug ?? slugifyCulturalEventName(String(value.name ?? "")),
    fact: existing?.fact ?? null,
    monthOrder: value.monthOrder || monthOrderFor(String(value.month ?? "")),
    timing: existing?.timing ?? String(value.month ?? ""),
    startDate: value.dateConfirmed ? value.startDate || null : null,
    endDate: value.dateConfirmed ? value.endDate || null : null,
    // `null` is meaningful here: it represents the explicit “Quitar imagen”
    // choice. Only an omitted imagePath should fall back to the stored value.
    imagePath: imagePath !== undefined ? imagePath : existing?.imagePath ?? null,
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
    const value = raw as Record<string, unknown>;
    const file = value.eventImage;
    const removeImage = value.removeImage === "true";
    let uploadedImage: string | null = null;
    let imagePath = existing?.imagePath ?? null;
    // FormData implementations may serialize an untouched file control as an
    // empty File with a synthetic name. Only bytes mean the user supplied a
    // replacement; otherwise an edit must retain its stored image.
    const hasNewImage = file instanceof File && file.size > 0;
    if (hasNewImage) {
      uploadedImage = await uploadEventImage(file);
      imagePath = uploadedImage;
    } else if (removeImage) {
      imagePath = null;
    }
    const input = parseInput(raw, existing, imagePath);
    try {
      if (parsedId) await updateCulturalEvent(parsedId, input);
      else await createCulturalEvent(input);
    } catch (error) {
      await deleteManagedEventImage(uploadedImage);
      throw error;
    }
    if (existing?.imagePath && existing.imagePath !== imagePath) await deleteManagedEventImage(existing.imagePath);
    revalidatePath("/agenda");
    revalidatePath("/admin/eventos");
    return { ok: true, message: id ? "Evento actualizado." : "Evento creado." };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}

export async function setCulturalEventActiveAction(id: string, isActive: boolean): Promise<EventActionResult> {
  await requireAdmin();
  try {
    await setCulturalEventActive(z.uuid().parse(id), z.boolean().parse(isActive));
    revalidatePath("/agenda");
    revalidatePath("/admin/eventos");
    return { ok: true, message: isActive ? "Evento activado." : "Evento desactivado." };
  } catch (error) { return { ok: false, message: errorMessage(error) }; }
}

export async function deleteCulturalEventAction(id: string): Promise<EventActionResult> {
  await requireAdmin();
  try {
    const parsedId = z.uuid().parse(id);
    const existing = await getCulturalEvent(parsedId);
    if (!existing) return { ok: false, message: "No encontramos ese evento." };
    if (existing.isActive) return { ok: false, message: "Primero desactivá el evento antes de eliminarlo." };
    await deleteCulturalEvent(parsedId);
    await deleteManagedEventImage(existing.imagePath);
    revalidatePath("/agenda");
    revalidatePath("/admin/eventos");
    return { ok: true, message: "Evento eliminado." };
  } catch (error) { return { ok: false, message: errorMessage(error) }; }
}
