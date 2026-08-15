import "server-only";

import { and, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { availabilityBlocks, reservationRequests } from "@/db/schema";
import { getDb } from "@/db";
import { isRangeAvailable, parseLocalDate, type DateRange } from "@/lib/domain/dates";
import {
  reservationRequestSchema,
  validateStayRange,
  type ReservationRequestInput,
} from "@/lib/domain/reservation";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/domain/whatsapp";
import { getExternalIntervals } from "./availability";

export class DatesUnavailableError extends Error {
  constructor() {
    super("Estas fechas acaban de dejar de estar disponibles. Elegí otro rango para continuar.");
    this.name = "DatesUnavailableError";
  }
}

async function getTransactionDatabaseIntervals(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  range: DateRange,
) {
  const rows = await tx
    .select({
      startDate: availabilityBlocks.startDate,
      endDate: availabilityBlocks.endDate,
    })
    .from(availabilityBlocks)
    .where(
      and(
        isNull(availabilityBlocks.releasedAt),
        lt(availabilityBlocks.startDate, range.endDate),
        gt(availabilityBlocks.endDate, range.startDate),
      ),
    );
  return rows.map((row) => ({
    startDate: parseLocalDate(row.startDate),
    endDate: parseLocalDate(row.endDate),
  }));
}

function responseForRequest(
  row: typeof reservationRequests.$inferSelect,
  fallback: ReservationRequestInput,
) {
  const startDate = parseLocalDate(row.checkIn);
  const endDate = parseLocalDate(row.checkOut);
  const message = buildWhatsAppMessage({
    startDate,
    endDate,
    fullName: row.fullName ?? fallback.fullName,
    guestCount: row.guestCount,
    question: row.question,
  });
  return {
    requestId: row.id,
    status: row.status,
    whatsappUrl: buildWhatsAppUrl(message),
  } as const;
}

export async function createReservationRequest(raw: unknown) {
  const input = reservationRequestSchema.parse(raw);
  const range = validateStayRange(input.checkIn, input.checkOut);

  const [idempotentRequest] = await getDb()
    .select()
    .from(reservationRequests)
    .where(eq(reservationRequests.clientRequestId, input.clientRequestId))
    .limit(1);
  if (idempotentRequest) return responseForRequest(idempotentRequest, input);

  const external = await getExternalIntervals("strict");
  if (!isRangeAvailable(range, external)) throw new DatesUnavailableError();

  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(1446327911)`);

    const [existing] = await tx
      .select()
      .from(reservationRequests)
      .where(eq(reservationRequests.clientRequestId, input.clientRequestId))
      .limit(1);
    if (existing) return responseForRequest(existing, input);

    const databaseIntervals = await getTransactionDatabaseIntervals(tx, range);
    if (!isRangeAvailable(range, databaseIntervals)) throw new DatesUnavailableError();

    const [created] = await tx
      .insert(reservationRequests)
      .values({
        clientRequestId: input.clientRequestId,
        fullName: input.fullName,
        guestCount: input.guestCount,
        checkIn: range.startDate,
        checkOut: range.endDate,
        question: input.question ?? null,
        status: "PENDING",
        source: "DIRECT",
      })
      .returning();
    return responseForRequest(created, input);
  });
}
