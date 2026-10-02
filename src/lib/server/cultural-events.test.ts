import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn(), update: vi.fn() }));

vi.mock("@/db", () => ({ getDb: mocks.getDb }));
vi.mock("server-only", () => ({}));

import { saveCulturalEventOrder } from "./cultural-events";

function event(id: string, monthOrder: number, sortOrder: number) {
  return { id, monthOrder, sortOrder, createdAt: new Date(), updatedAt: new Date() };
}

describe("saveCulturalEventOrder", () => {
  it("normalizes the submitted final order in one transaction", async () => {
    const monthEvents = [event("festival", 2, 4), event("carnaval", 2, 8), event("mega", 2, 12)];
    const updateCalls: Array<{ id: string; sortOrder: number }> = [];
    const tx = {
      select: vi.fn(() => ({ from: () => ({ where: () => ({ orderBy: async () => monthEvents }) }) })),
      update: vi.fn(() => ({ set: (value: { sortOrder: number }) => ({ where: async (condition: unknown) => {
        updateCalls.push({ id: String(condition), sortOrder: value.sortOrder });
      } }) })),
    };
    const transaction = vi.fn(async (callback: (database: typeof tx) => Promise<void>) => callback(tx));
    mocks.getDb.mockReturnValue({ transaction });

    await saveCulturalEventOrder([{ month: 2, ids: ["carnaval", "mega", "festival"] }]);

    expect(transaction).toHaveBeenCalledOnce();
    expect(updateCalls.map((call) => call.sortOrder)).toEqual([0, 1, 2]);
  });

  it("rejects an order that contains an event from another month without updating", async () => {
    const monthEvents = [event("festival", 2, 0), event("carnaval", 2, 1)];
    const update = vi.fn();
    const tx = {
      select: vi.fn(() => ({ from: () => ({ where: () => ({ orderBy: async () => monthEvents }) }) })),
      update,
    };
    mocks.getDb.mockReturnValue({ transaction: async (callback: (database: typeof tx) => Promise<void>) => callback(tx) });

    await expect(saveCulturalEventOrder([{ month: 2, ids: ["festival", "agosto"] }]))
      .rejects.toThrow("no coinciden con el mes actual");
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects duplicate IDs before it can write", async () => {
    const tx = { select: vi.fn(), update: vi.fn() };
    mocks.getDb.mockReturnValue({ transaction: async (callback: (database: typeof tx) => Promise<void>) => callback(tx) });

    await expect(saveCulturalEventOrder([
      { month: 1, ids: ["festival"] },
      { month: 2, ids: ["festival"] },
    ])).rejects.toThrow("enviado más de una vez");
    expect(tx.select).not.toHaveBeenCalled();
  });
});
