export type LocalDate = string & { readonly __localDate: unique symbol };

export type DateRange = {
  startDate: LocalDate;
  endDate: LocalDate;
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

export function parseLocalDate(value: string): LocalDate {
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new Error("Fecha inválida.");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Fecha inválida.");
  }

  return value as LocalDate;
}

export function fromDateParts(year: number, month: number, day: number): LocalDate {
  return parseLocalDate(
    `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  );
}

function epochDay(value: LocalDate): number {
  const [year, month, day] = value.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

export function compareLocalDates(a: LocalDate, b: LocalDate): number {
  return a.localeCompare(b);
}

export function addDays(value: LocalDate, days: number): LocalDate {
  const date = new Date((epochDay(value) + days) * DAY_MS);
  return fromDateParts(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

export function addMonths(value: LocalDate, months: number): LocalDate {
  const [year, month, day] = value.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const maxDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return fromDateParts(
    target.getUTCFullYear(),
    target.getUTCMonth() + 1,
    Math.min(day, maxDay),
  );
}

export function nightsBetween(checkIn: LocalDate, checkOut: LocalDate): number {
  return epochDay(checkOut) - epochDay(checkIn);
}

export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.startDate < b.endDate && b.startDate < a.endDate;
}

export function mergeDateRanges(ranges: DateRange[]): DateRange[] {
  const sorted = ranges
    .filter((range) => range.startDate < range.endDate)
    .toSorted((a, b) => a.startDate.localeCompare(b.startDate));

  const merged: DateRange[] = [];
  for (const range of sorted) {
    const previous = merged.at(-1);
    if (!previous || previous.endDate < range.startDate) {
      merged.push({ ...range });
      continue;
    }
    if (range.endDate > previous.endDate) previous.endDate = range.endDate;
  }
  return merged;
}

export function clipDateRange(range: DateRange, window: DateRange): DateRange | null {
  const startDate = (range.startDate < window.startDate
    ? window.startDate
    : range.startDate) as LocalDate;
  const endDate = (range.endDate > window.endDate
    ? window.endDate
    : range.endDate) as LocalDate;
  return startDate < endDate ? { startDate, endDate } : null;
}

export function isRangeAvailable(range: DateRange, occupied: DateRange[]): boolean {
  return !occupied.some((blocked) => rangesOverlap(range, blocked));
}

export function todayInArgentina(now = new Date()): LocalDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return fromDateParts(Number(values.year), Number(values.month), Number(values.day));
}

export function localDateFromInstantInArgentina(value: Date): LocalDate {
  return todayInArgentina(value);
}

export function localDateToUtcDate(value: LocalDate): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function localDateFromCalendarDate(value: Date): LocalDate {
  return fromDateParts(value.getFullYear(), value.getMonth() + 1, value.getDate());
}

export function calendarDateFromLocalDate(value: LocalDate): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function formatLocalDate(value: LocalDate, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(localDateToUtcDate(value));
}

export function formatTimestampInArgentina(value: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

