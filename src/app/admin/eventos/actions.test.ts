import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getCulturalEvent: vi.fn(),
  createCulturalEvent: vi.fn(),
  updateCulturalEvent: vi.fn(),
  setCulturalEventActive: vi.fn(),
  deleteCulturalEvent: vi.fn(),
  saveCulturalEventOrder: vi.fn(),
  uploadEventImage: vi.fn(),
  deleteManagedEventImage: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/server/admin-auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/server/cultural-events", () => ({
  getCulturalEvent: mocks.getCulturalEvent,
  createCulturalEvent: mocks.createCulturalEvent,
  updateCulturalEvent: mocks.updateCulturalEvent,
  setCulturalEventActive: mocks.setCulturalEventActive,
  deleteCulturalEvent: mocks.deleteCulturalEvent,
  saveCulturalEventOrder: mocks.saveCulturalEventOrder,
}));
vi.mock("@/lib/server/event-images", () => ({
  uploadEventImage: mocks.uploadEventImage,
  deleteManagedEventImage: mocks.deleteManagedEventImage,
}));

import { saveCulturalEventOrderAction, saveCulturalEventAction, setCulturalEventActiveAction } from "./actions";

const eventId = "d8b807a2-871c-4cc8-b452-6c9254f17716";
const oldImage = "https://store.public.blob.vercel-storage.com/event-images/old.jpg";
const existing = {
  id: eventId, slug: "fiesta-prueba", name: "Fiesta prueba", category: "Cultura",
  description: "Descripción de prueba", fact: null, month: "Enero", monthOrder: 1,
  timing: "Enero", startDate: null, endDate: null, dateConfirmed: false,
  imagePath: oldImage, imageAlt: "Fiesta prueba en General Belgrano", externalUrl: null,
  sourceUrl: null, isActive: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(),
};
const input = { name: existing.name, category: existing.category, description: existing.description, month: "Enero", monthOrder: 1, sortOrder: 0, dateConfirmed: false, isActive: true, externalUrl: "" };

describe("event admin actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({});
    mocks.getCulturalEvent.mockResolvedValue(existing);
    mocks.updateCulturalEvent.mockResolvedValue(undefined);
    mocks.setCulturalEventActive.mockResolvedValue(undefined);
    mocks.saveCulturalEventOrder.mockResolvedValue(undefined);
    mocks.deleteManagedEventImage.mockResolvedValue(undefined);
  });

  it("keeps an existing image when editing without a new file", async () => {
    // Some FormData implementations assign a synthetic filename to this
    // otherwise untouched, empty file input.
    const result = await saveCulturalEventAction({ ...input, eventImage: new File([], "undefined"), removeImage: "false" }, eventId);

    expect(result).toMatchObject({ ok: true });
    expect(mocks.uploadEventImage).not.toHaveBeenCalled();
    expect(mocks.updateCulturalEvent).toHaveBeenCalledWith(eventId, expect.objectContaining({ imagePath: oldImage }));
    expect(mocks.deleteManagedEventImage).not.toHaveBeenCalled();
  });

  it("uploads a replacement before deleting the previous image", async () => {
    const calls: string[] = [];
    mocks.uploadEventImage.mockImplementation(async () => { calls.push("upload"); return "https://store.public.blob.vercel-storage.com/event-images/new.jpg"; });
    mocks.updateCulturalEvent.mockImplementation(async () => { calls.push("database"); });
    mocks.deleteManagedEventImage.mockImplementation(async () => { calls.push("delete-old"); });

    await saveCulturalEventAction({ ...input, eventImage: new File([new Uint8Array([1])], "new.jpg", { type: "image/jpeg" }), removeImage: "false" }, eventId);

    expect(mocks.updateCulturalEvent).toHaveBeenCalledWith(eventId, expect.objectContaining({ imagePath: expect.stringContaining("new.jpg") }));
    expect(mocks.deleteManagedEventImage).toHaveBeenCalledWith(oldImage);
    expect(calls).toEqual(["upload", "database", "delete-old"]);
  });

  it("removes an existing image only when explicitly requested", async () => {
    await saveCulturalEventAction({ ...input, eventImage: new File([], ""), removeImage: "true" }, eventId);

    expect(mocks.updateCulturalEvent).toHaveBeenCalledWith(eventId, expect.objectContaining({ imagePath: null }));
    expect(mocks.deleteManagedEventImage).toHaveBeenCalledWith(oldImage);
  });

  it("preserves the prior image when a replacement upload fails", async () => {
    mocks.uploadEventImage.mockRejectedValue(new Error("blob unavailable"));
    const result = await saveCulturalEventAction({ ...input, eventImage: new File([new Uint8Array([1])], "new.jpg", { type: "image/jpeg" }), removeImage: "false" }, eventId);

    expect(result).toEqual({ ok: false, message: "blob unavailable" });
    expect(mocks.updateCulturalEvent).not.toHaveBeenCalled();
    expect(mocks.deleteManagedEventImage).not.toHaveBeenCalled();
  });

  it("cleans up only the new blob if the database update fails", async () => {
    const newImage = "https://store.public.blob.vercel-storage.com/event-images/new.jpg";
    mocks.uploadEventImage.mockResolvedValue(newImage);
    mocks.updateCulturalEvent.mockRejectedValue(new Error("database unavailable"));

    const result = await saveCulturalEventAction({ ...input, eventImage: new File([new Uint8Array([1])], "new.jpg", { type: "image/jpeg" }), removeImage: "false" }, eventId);

    expect(result).toEqual({ ok: false, message: "database unavailable" });
    expect(mocks.deleteManagedEventImage).toHaveBeenCalledWith(newImage);
    expect(mocks.deleteManagedEventImage).not.toHaveBeenCalledWith(oldImage);
  });

  it("persists both activation states without changing the image", async () => {
    await expect(setCulturalEventActiveAction(eventId, false)).resolves.toMatchObject({ ok: true, message: "Evento desactivado." });
    await expect(setCulturalEventActiveAction(eventId, true)).resolves.toMatchObject({ ok: true, message: "Evento activado." });

    expect(mocks.setCulturalEventActive).toHaveBeenNthCalledWith(1, eventId, false);
    expect(mocks.setCulturalEventActive).toHaveBeenNthCalledWith(2, eventId, true);
    expect(mocks.updateCulturalEvent).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/agenda");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/eventos");
  });

  it("persists final complete month groups and refreshes both the admin and public agenda", async () => {
    await expect(saveCulturalEventOrderAction([{ month: 1, ids: [eventId] }])).resolves.toEqual({ ok: true, message: "Orden guardado" });
    expect(mocks.saveCulturalEventOrder).toHaveBeenCalledWith([{ month: 1, ids: [eventId] }]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/agenda");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/eventos");
  });

  it("rejects duplicate IDs before writing an order", async () => {
    const result = await saveCulturalEventOrderAction([{ month: 1, ids: [eventId, eventId] }]);
    expect(result.ok).toBe(false);
    expect(mocks.saveCulturalEventOrder).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated users before writing an order", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("unauthorized"));
    await expect(saveCulturalEventOrderAction([{ month: 1, ids: [eventId] }])).rejects.toThrow("unauthorized");
    expect(mocks.saveCulturalEventOrder).not.toHaveBeenCalled();
  });
});
