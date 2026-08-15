import { ZodError } from "zod";
import {
  addDays,
  addMonths,
  nightsBetween,
  parseLocalDate,
  todayInArgentina,
} from "@/lib/domain/dates";
import { availabilityQuerySchema } from "@/lib/domain/reservation";
import {
  ExternalCalendarsUnavailableError,
  getCombinedAvailability,
} from "@/lib/server/availability";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = availabilityQuerySchema.parse({
      start: url.searchParams.get("start"),
      end: url.searchParams.get("end"),
    });
    const startDate = parseLocalDate(query.start);
    const endDate = parseLocalDate(query.end);
    const today = todayInArgentina();
    const horizon = addMonths(today, 12);

    if (
      startDate < today ||
      startDate > horizon ||
      endDate <= startDate ||
      endDate > horizon ||
      nightsBetween(startDate, endDate) > 370
    ) {
      return Response.json(
        { code: "INVALID_RANGE", message: "El rango consultado no es válido." },
        { status: 422, headers: { "Cache-Control": "no-store" } },
      );
    }

    const unavailable = await getCombinedAvailability("public", {
      startDate,
      endDate: addDays(endDate, 1),
    });
    return Response.json(
      {
        unavailable: unavailable.map((range) => ({
          startDate: range.startDate,
          endDate: range.endDate,
        })),
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { code: "INVALID_RANGE", message: "El rango consultado no es válido." },
        { status: 422, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error instanceof ExternalCalendarsUnavailableError) {
      return Response.json(
        {
          code: "AVAILABILITY_UNVERIFIABLE",
          message: "No pudimos actualizar la disponibilidad. Intentá nuevamente en unos minutos.",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    return Response.json(
      {
        code: "AVAILABILITY_UNAVAILABLE",
        message: "La disponibilidad no está accesible en este momento.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
