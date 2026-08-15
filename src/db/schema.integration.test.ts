import { neon } from "@neondatabase/serverless";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

const connectionString = process.env.TEST_DATABASE_URL;
const sql = connectionString ? neon(connectionString) : null;
const dbTest = connectionString ? it : it.skip;

async function cleanTestRows() {
  if (!sql) return;
  await sql.query(`
    DELETE FROM availability_blocks
    WHERE reason LIKE 'vitest:%'
       OR reservation_request_id IN (
         SELECT id FROM reservation_requests WHERE full_name LIKE 'Vitest %'
       )
  `);
  await sql.query("DELETE FROM reservation_requests WHERE full_name LIKE 'Vitest %'");
}

describe("reservation database invariants", () => {
  beforeEach(cleanTestRows);
  afterAll(cleanTestRows);

  dbTest("keeps pending and rejected requests from blocking dates", async () => {
    const inserted = await sql!.query(`
      INSERT INTO reservation_requests
        (client_request_id, full_name, guest_count, check_in, check_out, status)
      VALUES (gen_random_uuid(), 'Vitest Pending', 2, '2027-01-10', '2027-01-13', 'PENDING')
      RETURNING id
    `) as Array<{ id: string }>;
    expect(((await sql!.query(
      "SELECT count(*)::int AS count FROM availability_blocks WHERE reservation_request_id = $1",
      [inserted[0].id],
    )) as Array<{ count: number }>)[0].count).toBe(0);
    await sql!.query("UPDATE reservation_requests SET status = 'REJECTED' WHERE id = $1", [inserted[0].id]);
    expect(((await sql!.query(
      "SELECT count(*)::int AS count FROM availability_blocks WHERE reservation_request_id = $1",
      [inserted[0].id],
    )) as Array<{ count: number }>)[0].count).toBe(0);
  });

  dbTest("supports PENDING to CONFIRMED with a linked direct block", async () => {
    const inserted = await sql!.query(`
      INSERT INTO reservation_requests
        (client_request_id, full_name, guest_count, check_in, check_out, status)
      VALUES (gen_random_uuid(), 'Vitest Confirmed', 1, '2027-02-10', '2027-02-13', 'PENDING')
      RETURNING id
    `) as Array<{ id: string }>;
    await sql!.transaction((tx) => [
      tx.query(`INSERT INTO availability_blocks
        (start_date, end_date, source, reservation_request_id)
        VALUES ('2027-02-10', '2027-02-13', 'DIRECT', $1)`, [inserted[0].id]),
      tx.query("UPDATE reservation_requests SET status = 'CONFIRMED' WHERE id = $1", [inserted[0].id]),
    ]);
    expect(((await sql!.query(
      "SELECT status FROM reservation_requests WHERE id = $1", [inserted[0].id],
    )) as Array<{ status: string }>)[0].status).toBe("CONFIRMED");
  });

  dbTest("allows adjacent stays but rejects concurrent overlapping active blocks", async () => {
    await sql!.query(`INSERT INTO availability_blocks (start_date, end_date, source, reason)
      VALUES ('2027-03-10', '2027-03-13', 'MANUAL', 'vitest:first')`);
    await expect(sql!.query(`INSERT INTO availability_blocks (start_date, end_date, source, reason)
      VALUES ('2027-03-13', '2027-03-15', 'MANUAL', 'vitest:adjacent')`)).resolves.toBeTruthy();

    const results = await Promise.allSettled([
      sql!.query(`INSERT INTO availability_blocks (start_date, end_date, source, reason)
        VALUES ('2027-04-10', '2027-04-13', 'MANUAL', 'vitest:race-a')`),
      sql!.query(`INSERT INTO availability_blocks (start_date, end_date, source, reason)
        VALUES ('2027-04-11', '2027-04-14', 'MANUAL', 'vitest:race-b')`),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
  });

  dbTest("enforces guest capacity and valid date ranges in PostgreSQL", async () => {
    await expect(sql!.query(`INSERT INTO reservation_requests
      (client_request_id, full_name, guest_count, check_in, check_out)
      VALUES (gen_random_uuid(), 'Vitest Invalid', 3, '2027-05-10', '2027-05-10')`)).rejects.toBeTruthy();
  });
});
