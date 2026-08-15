import { and, eq, isNotNull, isNull, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { availabilityBlocks, reservationRequests } from "@/db/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = sql`now() - interval '12 months'`;
  const result = await getDb().transaction(async (tx) => {
    const anonymized = await tx
      .update(reservationRequests)
      .set({
        fullName: null,
        question: null,
        anonymizedAt: new Date(),
        updatedAt: new Date(),
        status: sql`case when ${reservationRequests.status} = 'PENDING' then 'REJECTED'::reservation_status else ${reservationRequests.status} end`,
      })
      .where(
        and(
          lt(reservationRequests.createdAt, cutoff),
          isNull(reservationRequests.anonymizedAt),
        ),
      )
      .returning({ id: reservationRequests.id });

    const cleanedBlocks = await tx
      .update(availabilityBlocks)
      .set({ reason: null, updatedAt: new Date() })
      .where(
        and(
          isNotNull(availabilityBlocks.reason),
          eq(availabilityBlocks.source, "MANUAL"),
          isNotNull(availabilityBlocks.releasedAt),
          lt(availabilityBlocks.releasedAt, cutoff),
        ),
      )
      .returning({ id: availabilityBlocks.id });

    return { anonymized: anonymized.length, cleanedBlocks: cleanedBlocks.length };
  });

  return Response.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
}
