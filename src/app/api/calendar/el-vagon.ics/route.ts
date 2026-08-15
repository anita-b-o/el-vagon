import { timingSafeEqual } from "node:crypto";
import { and, eq, isNull, or } from "drizzle-orm";
import { getDb } from "@/db";
import { availabilityBlocks, reservationRequests } from "@/db/schema";
import { parseLocalDate } from "@/lib/domain/dates";
import { buildPrivateCalendar } from "@/lib/domain/ics";

export const runtime = "nodejs";

function tokenMatches(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function GET(request: Request) {
  const expected = process.env.ICAL_EXPORT_TOKEN?.trim();
  const received = new URL(request.url).searchParams.get("token") ?? "";
  if (!expected || expected.length < 32 || !tokenMatches(received, expected)) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const rows = await getDb()
    .select({
      id: availabilityBlocks.id,
      startDate: availabilityBlocks.startDate,
      endDate: availabilityBlocks.endDate,
      updatedAt: availabilityBlocks.updatedAt,
    })
    .from(availabilityBlocks)
    .leftJoin(
      reservationRequests,
      eq(availabilityBlocks.reservationRequestId, reservationRequests.id),
    )
    .where(
      and(
        isNull(availabilityBlocks.releasedAt),
        or(
          eq(availabilityBlocks.source, "MANUAL"),
          and(
            eq(availabilityBlocks.source, "DIRECT"),
            eq(reservationRequests.status, "CONFIRMED"),
          ),
        ),
      ),
    );

  const calendar = buildPrivateCalendar(
    rows.map((row) => ({
      id: row.id,
      startDate: parseLocalDate(row.startDate),
      endDate: parseLocalDate(row.endDate),
      updatedAt: row.updatedAt,
    })),
  );

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="el-vagon.ics"',
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

