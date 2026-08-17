import ICAL from "ical.js";
import {
  addDays,
  compareLocalDates,
  localDateFromInstantInArgentina,
  mergeDateRanges,
  parseLocalDate,
  type DateRange,
  type LocalDate,
} from "./dates";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function icalTimeToLocalDate(time: ICAL.Time): LocalDate {
  if (time.isDate) {
    return parseLocalDate(`${time.year}-${pad(time.month)}-${pad(time.day)}`);
  }
  return localDateFromInstantInArgentina(time.toJSDate());
}

function occurrenceRange(start: ICAL.Time, end: ICAL.Time): DateRange | null {
  const startDate = icalTimeToLocalDate(start);
  let endDate = icalTimeToLocalDate(end);

  if (!start.isDate && startDate === endDate) endDate = addDays(startDate, 1);
  return startDate < endDate ? { startDate, endDate } : null;
}

export function parseIcsIntervals(
  raw: string,
  windowStart: LocalDate,
  windowEnd: LocalDate,
): DateRange[] {
  const root = new ICAL.Component(ICAL.parse(raw));
  const events = root.getAllSubcomponents("vevent");
  const intervals: DateRange[] = [];

  for (const component of events) {
    const status = String(component.getFirstPropertyValue("status") || "").toUpperCase();
    const transparency = String(
      component.getFirstPropertyValue("transp") || "",
    ).toUpperCase();
    if (status === "CANCELLED" || transparency === "TRANSPARENT") continue;

    const event = new ICAL.Event(component);
    if (!event.isRecurring()) {
      const range = occurrenceRange(event.startDate, event.endDate);
      if (
        range &&
        compareLocalDates(range.startDate, windowEnd) < 0 &&
        compareLocalDates(range.endDate, windowStart) > 0
      ) {
        intervals.push(range);
      }
      continue;
    }

    const iterator = event.iterator(ICAL.Time.fromDateString(windowStart));
    for (let count = 0; count < 1000; count += 1) {
      const next = iterator.next();
      if (!next) break;
      const details = event.getOccurrenceDetails(next);
      const range = occurrenceRange(details.startDate, details.endDate);
      if (!range) continue;
      if (compareLocalDates(range.startDate, windowEnd) >= 0) break;
      if (compareLocalDates(range.endDate, windowStart) > 0) intervals.push(range);
    }
  }

  return mergeDateRanges(intervals);
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function toIcsDate(value: LocalDate) {
  return value.replaceAll("-", "");
}

function foldIcsLine(line: string) {
  if (line.length <= 73) return line;
  const chunks: string[] = [];
  let remaining = line;
  while (remaining.length > 73) {
    chunks.push(remaining.slice(0, 73));
    remaining = remaining.slice(73);
  }
  chunks.push(remaining);
  return chunks.join("\r\n ");
}

export function buildPrivateCalendar(
  blocks: Array<DateRange & { id: string; updatedAt: Date }>,
  now = new Date(),
) {
  const dtstamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//El Vagon//Disponibilidad//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:El Vagón - Disponibilidad",
  ];

  for (const block of blocks) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:block-${block.id}@elvagon.com.ar`,
      `DTSTAMP:${dtstamp}`,
      `LAST-MODIFIED:${block.updatedAt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
      `DTSTART;VALUE=DATE:${toIcsDate(block.startDate)}`,
      `DTEND;VALUE=DATE:${toIcsDate(block.endDate)}`,
      `SUMMARY:${escapeIcsText("El Vagón - No disponible")}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}
