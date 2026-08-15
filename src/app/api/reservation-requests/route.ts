import { ZodError } from "zod";
import { ReservationValidationError } from "@/lib/domain/reservation";
import { ExternalCalendarsUnavailableError } from "@/lib/server/availability";
import {
  createReservationRequest,
  DatesUnavailableError,
} from "@/lib/server/reservation-requests";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 12_000) {
      return Response.json(
        { code: "PAYLOAD_TOO_LARGE", message: "La consulta es demasiado larga." },
        { status: 413 },
      );
    }

    const payload = JSON.parse(raw) as unknown;
    const result = await createReservationRequest(payload);
    return Response.json(result, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof DatesUnavailableError) {
      return Response.json(
        { code: "DATES_UNAVAILABLE", message: error.message },
        { status: 409, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error instanceof ExternalCalendarsUnavailableError) {
      return Response.json(
        {
          code: "AVAILABILITY_UNVERIFIABLE",
          message: "No pudimos verificar los calendarios externos. Intentá nuevamente en unos minutos.",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error instanceof ZodError || error instanceof ReservationValidationError) {
      const message =
        error instanceof ZodError
          ? (error.issues[0]?.message ?? "Revisá los datos ingresados.")
          : error.message;
      return Response.json(
        { code: "VALIDATION_ERROR", message },
        { status: 422, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error instanceof SyntaxError) {
      return Response.json(
        { code: "INVALID_JSON", message: "La solicitud no es válida." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    return Response.json(
      { code: "REQUEST_FAILED", message: "No pudimos registrar la solicitud." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

