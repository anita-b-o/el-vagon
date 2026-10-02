"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/admin-auth";
import {
  cancelConfirmedReservation,
  confirmReservationRequest,
  createManualAvailabilityBlock,
  rejectReservationRequest,
  releaseManualAvailabilityBlock,
} from "@/lib/server/admin-reservations";
import { forceRefreshExternalCalendars } from "@/lib/server/availability";
import { manualBlockSchema, validateManualRange } from "@/lib/domain/reservation";

export type AdminActionResult = { ok: true; message: string } | { ok: false; message: string };

function messageForError(error: unknown) {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "Datos inválidos.";
  if (typeof error === "object" && error && "code" in error && error.code === "23P01") {
    return "Estas fechas acaban de dejar de estar disponibles. Elegí otro rango para continuar.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "No pudimos completar la acción.";
}

async function runAdminAction(work: () => Promise<unknown>, success: string): Promise<AdminActionResult> {
  await requireAdmin();
  try {
    await work();
    revalidatePath("/admin/reservas");
    return { ok: true, message: success };
  } catch (error) {
    return { ok: false, message: messageForError(error) };
  }
}

export async function confirmRequestAction(requestId: string) {
  return runAdminAction(() => confirmReservationRequest(z.uuid().parse(requestId)), "Ocupación confirmada.");
}

export async function rejectRequestAction(requestId: string) {
  return runAdminAction(() => rejectReservationRequest(z.uuid().parse(requestId)), "Solicitud descartada.");
}

export async function cancelRequestAction(requestId: string) {
  return runAdminAction(() => cancelConfirmedReservation(z.uuid().parse(requestId)), "Reserva cancelada y fechas liberadas.");
}

export async function createManualBlockAction(raw: unknown) {
  return runAdminAction(async () => {
    const input = manualBlockSchema.parse(raw);
    const range = validateManualRange(input.startDate, input.endDate);
    await createManualAvailabilityBlock(range, input.reason);
  }, "Fechas bloqueadas.");
}

export async function releaseManualBlockAction(blockId: string) {
  return runAdminAction(() => releaseManualAvailabilityBlock(z.uuid().parse(blockId)), "Bloqueo liberado.");
}

export async function refreshCalendarsAction() {
  return runAdminAction(forceRefreshExternalCalendars, "Calendarios actualizados.");
}
