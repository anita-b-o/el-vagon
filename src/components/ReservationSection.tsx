"use client";

import { ArrowRight, CalendarDays, Check, LoaderCircle, Moon, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DayPicker, type Modifiers } from "react-day-picker";
import { es } from "react-day-picker/locale";
import {
  addDays,
  addMonths,
  calendarDateFromLocalDate,
  formatLocalDate,
  isRangeAvailable,
  localDateFromCalendarDate,
  nightsBetween,
  parseLocalDate,
  todayInArgentina,
  type DateRange,
  type LocalDate,
} from "@/lib/domain/dates";

type AvailabilityResponse = {
  unavailable: Array<{ startDate: string; endDate: string }>;
};

type ApiError = { message?: string };

function useResponsiveMonths() {
  const [months, setMonths] = useState(2);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => setMonths(query.matches ? 1 : 2);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return months;
}

export function ReservationSection() {
  const today = useMemo(() => todayInArgentina(), []);
  const maxDate = useMemo(() => addMonths(today, 12), [today]);
  const latestCheckIn = useMemo(() => addDays(maxDate, -2), [maxDate]);
  const numberOfMonths = useResponsiveMonths();
  const [unavailable, setUnavailable] = useState<DateRange[]>([]);
  const [checkIn, setCheckIn] = useState<LocalDate | null>(null);
  const [checkOut, setCheckOut] = useState<LocalDate | null>(null);
  const [calendarStatus, setCalendarStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [calendarMessage, setCalendarMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clientRequestId, setClientRequestId] = useState("");

  const refreshAvailability = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/availability?start=${today}&end=${maxDate}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as AvailabilityResponse & ApiError;
      if (!response.ok) throw new Error(payload.message || "No pudimos consultar las fechas.");
      setUnavailable(
        payload.unavailable.map((range) => ({
          startDate: parseLocalDate(range.startDate),
          endDate: parseLocalDate(range.endDate),
        })),
      );
      setCalendarStatus("ready");
      setCalendarMessage("");
    } catch (error) {
      setCalendarStatus("error");
      setCalendarMessage(
        error instanceof Error
          ? error.message
          : "No pudimos actualizar la disponibilidad.",
      );
    }
  }, [maxDate, today]);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refreshAvailability(), 0);
    const interval = window.setInterval(() => void refreshAvailability(), 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshAvailability();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshAvailability]);

  const isOccupiedNight = useCallback(
    (date: LocalDate) =>
      unavailable.some((range) => date >= range.startDate && date < range.endDate),
    [unavailable],
  );

  const candidateIsValid = useCallback(
    (candidate: LocalDate) => {
      if (!checkIn || candidate <= checkIn) return false;
      return (
        nightsBetween(checkIn, candidate) >= 2 &&
        isRangeAvailable({ startDate: checkIn, endDate: candidate }, unavailable)
      );
    },
    [checkIn, unavailable],
  );

  const disabledDay = useCallback(
    (date: Date) => {
      const value = localDateFromCalendarDate(date);
      if (value < today || value > maxDate) return true;
      if (!checkIn || checkOut) return value > latestCheckIn || isOccupiedNight(value);
      if (value <= checkIn) return isOccupiedNight(value);
      return !candidateIsValid(value);
    },
    [candidateIsValid, checkIn, checkOut, isOccupiedNight, latestCheckIn, maxDate, today],
  );

  const modifiers = useMemo(
    () => ({
      past: (date: Date) => localDateFromCalendarDate(date) < today,
      occupied: (date: Date) => isOccupiedNight(localDateFromCalendarDate(date)),
      checkIn: (date: Date) => localDateFromCalendarDate(date) === checkIn,
      checkOut: (date: Date) => localDateFromCalendarDate(date) === checkOut,
      inRange: (date: Date) => {
        const value = localDateFromCalendarDate(date);
        return Boolean(checkIn && checkOut && value > checkIn && value < checkOut);
      },
      checkoutOnly: (date: Date) => {
        const value = localDateFromCalendarDate(date);
        return Boolean(checkIn && !checkOut && isOccupiedNight(value) && candidateIsValid(value));
      },
    }),
    [candidateIsValid, checkIn, checkOut, isOccupiedNight, today],
  );

  function handleDayClick(date: Date, dayModifiers: Modifiers) {
    if (dayModifiers.disabled || calendarStatus !== "ready") return;
    const value = localDateFromCalendarDate(date);
    setSubmitMessage("");

    if (!checkIn || checkOut || value <= checkIn) {
      if (isOccupiedNight(value)) return;
      setCheckIn(value);
      setCheckOut(null);
      setCalendarMessage("Ahora elegí la fecha de salida (mínimo 2 noches).");
      setClientRequestId(crypto.randomUUID());
      return;
    }

    if (!candidateIsValid(value)) {
      setCalendarMessage("Ese rango atraviesa una noche no disponible.");
      return;
    }
    setCheckOut(value);
    setCalendarMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checkIn || !checkOut) {
      setSubmitMessage("Elegí primero las fechas de ingreso y salida.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const requestId = clientRequestId || crypto.randomUUID();
    if (!clientRequestId) setClientRequestId(requestId);
    setSubmitting(true);
    setSubmitMessage("");
    try {
      const response = await fetch("/api/reservation-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientRequestId: requestId,
          checkIn,
          checkOut,
          fullName: form.get("fullName"),
          guestCount: form.get("guestCount"),
          question: form.get("question"),
          website: form.get("website"),
        }),
      });
      const payload = (await response.json()) as ApiError & { whatsappUrl?: string };
      if (!response.ok || !payload.whatsappUrl) {
        if (response.status === 409) {
          setCheckIn(null);
          setCheckOut(null);
          setClientRequestId(crypto.randomUUID());
          await refreshAvailability();
        }
        throw new Error(payload.message || "No pudimos registrar la solicitud.");
      }
      window.location.assign(payload.whatsappUrl);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "No pudimos registrar la solicitud.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  return (
    <section id="reservas" className="reservation-section section" aria-labelledby="reservation-title">
      <div className="container">
        <div className="reservation-heading reveal">
          <div>
            <p className="eyebrow">Tu escapada</p>
            <h2 id="reservation-title">Elegí tus fechas</h2>
          </div>
          <p>
            Consultá las noches disponibles y después conversamos por WhatsApp para
            confirmar todos los detalles.
          </p>
        </div>

        <div className="reservation-layout">
          <div className="calendar-panel reveal">
            <div className="calendar-intro">
              <span><CalendarDays aria-hidden="true" /> Disponibilidad</span>
              <small>Estadía mínima: 2 noches</small>
            </div>
            <DayPicker
              locale={es}
              numberOfMonths={numberOfMonths}
              startMonth={calendarDateFromLocalDate(today)}
              endMonth={calendarDateFromLocalDate(maxDate)}
              defaultMonth={calendarDateFromLocalDate(today)}
              disabled={disabledDay}
              modifiers={modifiers}
              modifiersClassNames={{
                past: "calendar-past",
                occupied: "calendar-occupied",
                checkIn: "calendar-check-in",
                checkOut: "calendar-check-out",
                inRange: "calendar-in-range",
                checkoutOnly: "calendar-checkout-only",
              }}
              onDayClick={handleDayClick}
              showOutsideDays={false}
              animate
            />
            <div className="calendar-legend" aria-label="Referencias del calendario">
              <span><i className="legend-available" /> Disponible</span>
              <span><i className="legend-unavailable" /> No disponible</span>
              <span><i className="legend-selected" /> Tu selección</span>
            </div>
            <p className={`calendar-feedback ${calendarStatus === "error" ? "is-error" : ""}`} aria-live="polite">
              {calendarStatus === "loading" ? "Actualizando disponibilidad…" : calendarMessage}
            </p>
            {calendarStatus === "error" ? (
              <button className="text-link calendar-retry" type="button" onClick={() => void refreshAvailability()}>
                Reintentar
              </button>
            ) : null}
          </div>

          <form className="reservation-form reveal" onSubmit={handleSubmit}>
            <div className="stay-summary">
              <div>
                <span>Ingreso</span>
                <strong>{checkIn ? formatLocalDate(checkIn) : "Elegí una fecha"}</strong>
              </div>
              <ArrowRight aria-hidden="true" />
              <div>
                <span>Salida</span>
                <strong>{checkOut ? formatLocalDate(checkOut) : "Elegí una fecha"}</strong>
              </div>
            </div>

            {nights ? (
              <p className="stay-nights"><Moon aria-hidden="true" /> {nights} noches</p>
            ) : null}

            <label className="form-field">
              <span>Nombre completo</span>
              <input name="fullName" type="text" minLength={2} maxLength={100} placeholder="Nombre y apellido" autoComplete="name" required />
            </label>

            <label className="form-field">
              <span>Cantidad de personas</span>
              <span className="select-wrap">
                <Users aria-hidden="true" />
                <select name="guestCount" defaultValue="" required>
                  <option value="" disabled>Elegí una opción</option>
                  <option value="1">1 persona</option>
                  <option value="2">2 personas</option>
                </select>
              </span>
            </label>

            <label className="form-field">
              <span>Consulta <small>Opcional</small></span>
              <textarea name="question" maxLength={1000} rows={4} placeholder="¿Querés consultarnos algo más?" />
            </label>

            <label className="form-honeypot" aria-hidden="true">
              Sitio web
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>

            <p className="schedule-note">
              <Check aria-hidden="true" /> Check-out hasta las 11:00 · Check-in desde las 15:00
            </p>
            <p className="reservation-disclaimer">
              Esta consulta no constituye una reserva. Las fechas se bloquean únicamente
              cuando la encargada confirma la ocupación.
            </p>

            <button className="button button-dark button-large reservation-submit" type="submit" disabled={!checkIn || !checkOut || submitting || calendarStatus !== "ready"}>
              {submitting ? <LoaderCircle className="spin" aria-hidden="true" /> : null}
              Consultar disponibilidad por WhatsApp
            </button>
            <p className="form-feedback" aria-live="polite">{submitMessage}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
