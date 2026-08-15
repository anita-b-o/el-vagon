import { sql } from "drizzle-orm";
import {
  check,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const reservationStatus = pgEnum("reservation_status", [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
]);

export const reservationSource = pgEnum("reservation_source", ["DIRECT"]);
export const blockSource = pgEnum("block_source", ["DIRECT", "MANUAL"]);
export const externalCalendarSource = pgEnum("external_calendar_source", [
  "AIRBNB",
  "BOOKING",
]);

export type StoredDateRange = {
  startDate: string;
  endDate: string;
};

export const reservationRequests = pgTable(
  "reservation_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientRequestId: uuid("client_request_id").notNull(),
    fullName: text("full_name"),
    guestCount: smallint("guest_count").notNull(),
    checkIn: date("check_in", { mode: "string" }).notNull(),
    checkOut: date("check_out", { mode: "string" }).notNull(),
    question: text("question"),
    status: reservationStatus("status").default("PENDING").notNull(),
    source: reservationSource("source").default("DIRECT").notNull(),
    anonymizedAt: timestamp("anonymized_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("reservation_requests_client_request_id_idx").on(
      table.clientRequestId,
    ),
    check(
      "reservation_requests_guest_count_check",
      sql`${table.guestCount} between 1 and 2`,
    ),
    check(
      "reservation_requests_date_range_check",
      sql`${table.checkOut} > ${table.checkIn}`,
    ),
    check(
      "reservation_requests_personal_data_check",
      sql`${table.anonymizedAt} is not null or ${table.fullName} is not null`,
    ),
  ],
);

export const availabilityBlocks = pgTable(
  "availability_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    reason: text("reason"),
    source: blockSource("source").notNull(),
    reservationRequestId: uuid("reservation_request_id").references(
      () => reservationRequests.id,
      { onDelete: "restrict" },
    ),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("availability_blocks_reservation_request_id_idx")
      .on(table.reservationRequestId)
      .where(sql`${table.reservationRequestId} is not null`),
    check(
      "availability_blocks_date_range_check",
      sql`${table.endDate} > ${table.startDate}`,
    ),
    check(
      "availability_blocks_source_reference_check",
      sql`(${table.source} = 'DIRECT' and ${table.reservationRequestId} is not null)
        or (${table.source} = 'MANUAL' and ${table.reservationRequestId} is null)`,
    ),
  ],
);

export const externalCalendarSnapshots = pgTable(
  "external_calendar_snapshots",
  {
    source: externalCalendarSource("source").primaryKey(),
    intervals: jsonb("intervals").$type<StoredDateRange[]>().default([]).notNull(),
    etag: text("etag"),
    lastModified: text("last_modified"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    consecutiveFailures: integer("consecutive_failures").default(0).notNull(),
  },
  (table) => [
    check(
      "external_calendar_snapshots_failures_check",
      sql`${table.consecutiveFailures} >= 0`,
    ),
  ],
);

export type ReservationRequestRow = typeof reservationRequests.$inferSelect;
export type AvailabilityBlockRow = typeof availabilityBlocks.$inferSelect;

