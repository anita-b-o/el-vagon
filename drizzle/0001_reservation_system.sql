CREATE TYPE reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED');
CREATE TYPE reservation_source AS ENUM ('DIRECT');
CREATE TYPE block_source AS ENUM ('DIRECT', 'MANUAL');
CREATE TYPE external_calendar_source AS ENUM ('AIRBNB', 'BOOKING');

CREATE TABLE reservation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_request_id uuid NOT NULL,
  full_name text,
  guest_count smallint NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  question text,
  status reservation_status NOT NULL DEFAULT 'PENDING',
  source reservation_source NOT NULL DEFAULT 'DIRECT',
  anonymized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reservation_requests_guest_count_check CHECK (guest_count BETWEEN 1 AND 2),
  CONSTRAINT reservation_requests_date_range_check CHECK (check_out > check_in),
  CONSTRAINT reservation_requests_personal_data_check CHECK (anonymized_at IS NOT NULL OR full_name IS NOT NULL)
);

CREATE UNIQUE INDEX reservation_requests_client_request_id_idx
  ON reservation_requests (client_request_id);

CREATE TABLE availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  source block_source NOT NULL,
  reservation_request_id uuid REFERENCES reservation_requests(id) ON DELETE RESTRICT,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_blocks_date_range_check CHECK (end_date > start_date),
  CONSTRAINT availability_blocks_source_reference_check CHECK (
    (source = 'DIRECT' AND reservation_request_id IS NOT NULL)
    OR (source = 'MANUAL' AND reservation_request_id IS NULL)
  )
);

CREATE UNIQUE INDEX availability_blocks_reservation_request_id_idx
  ON availability_blocks (reservation_request_id)
  WHERE reservation_request_id IS NOT NULL;

ALTER TABLE availability_blocks
  ADD CONSTRAINT availability_blocks_no_overlap
  EXCLUDE USING gist (daterange(start_date, end_date, '[)') WITH &&)
  WHERE (released_at IS NULL);

CREATE INDEX availability_blocks_active_dates_idx
  ON availability_blocks (start_date, end_date)
  WHERE released_at IS NULL;

CREATE TABLE external_calendar_snapshots (
  source external_calendar_source PRIMARY KEY,
  intervals jsonb NOT NULL DEFAULT '[]'::jsonb,
  etag text,
  last_modified text,
  fetched_at timestamptz NOT NULL,
  failed_at timestamptz,
  consecutive_failures integer NOT NULL DEFAULT 0,
  CONSTRAINT external_calendar_snapshots_failures_check CHECK (consecutive_failures >= 0)
);

CREATE INDEX reservation_requests_status_created_at_idx
  ON reservation_requests (status, created_at DESC);

