import { z } from "zod";
import {
  addMonths,
  compareLocalDates,
  nightsBetween,
  parseLocalDate,
  todayInArgentina,
  type DateRange,
} from "./dates";

const localDateSchema = z.string().refine((value) => {
  try {
    parseLocalDate(value);
    return true;
  } catch {
    return false;
  }
}, "Fecha inválida.");

function normalizeSingleLine(value: string) {
  return value.normalize("NFC").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeMultiline(value: string) {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim();
}

export const reservationRequestSchema = z.object({
  clientRequestId: z.uuid("Identificador de solicitud inválido."),
  fullName: z
    .string()
    .transform(normalizeSingleLine)
    .pipe(z.string()
    .min(2, "Ingresá tu nombre y apellido.")
    .max(100, "El nombre es demasiado largo.")),
  guestCount: z.coerce
    .number()
    .int()
    .min(1, "Elegí la cantidad de personas.")
    .max(2, "El Vagón admite hasta 2 personas."),
  checkIn: localDateSchema,
  checkOut: localDateSchema,
  question: z
    .string()
    .transform(normalizeMultiline)
    .pipe(z.string()
    .max(1000, "La consulta es demasiado larga.")
    )
    .optional()
    .transform((value) => value || undefined),
  website: z.string().max(0).optional(),
});

export const availabilityQuerySchema = z.object({
  start: localDateSchema,
  end: localDateSchema,
});

export const manualBlockSchema = z.object({
  startDate: localDateSchema,
  endDate: localDateSchema,
  reason: z
    .string()
    .transform(normalizeSingleLine)
    .pipe(z.string()
    .max(300, "El motivo es demasiado largo.")
    )
    .optional()
    .transform((value) => value || undefined),
});

export type ReservationRequestInput = z.infer<typeof reservationRequestSchema>;

export class ReservationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationValidationError";
  }
}

export function validateStayRange(
  checkInValue: string,
  checkOutValue: string,
  now = new Date(),
): DateRange {
  const checkIn = parseLocalDate(checkInValue);
  const checkOut = parseLocalDate(checkOutValue);
  const today = todayInArgentina(now);
  const maxDate = addMonths(today, 12);

  if (compareLocalDates(checkIn, today) < 0) {
    throw new ReservationValidationError("La fecha de ingreso ya pasó.");
  }
  if (compareLocalDates(checkOut, maxDate) > 0) {
    throw new ReservationValidationError(
      "Las consultas pueden realizarse hasta 12 meses hacia adelante.",
    );
  }
  if (nightsBetween(checkIn, checkOut) < 2) {
    throw new ReservationValidationError("La estadía mínima es de 2 noches.");
  }

  return { startDate: checkIn, endDate: checkOut };
}

export function validateManualRange(startValue: string, endValue: string): DateRange {
  const startDate = parseLocalDate(startValue);
  const endDate = parseLocalDate(endValue);
  if (nightsBetween(startDate, endDate) < 1) {
    throw new ReservationValidationError("El bloqueo debe incluir al menos una noche.");
  }
  return { startDate, endDate };
}
