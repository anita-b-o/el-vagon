// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actionMocks = vi.hoisted(() => ({ save: vi.fn(), setActive: vi.fn(), remove: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("./actions", () => ({
  saveCulturalEventAction: actionMocks.save,
  setCulturalEventActiveAction: actionMocks.setActive,
  deleteCulturalEventAction: actionMocks.remove,
}));
import { EventsAdmin } from "./EventsAdmin";

const event = {
  id: "d8b807a2-871c-4cc8-b452-6c9254f17716", slug: "fiesta-prueba", name: "Fiesta prueba", category: "Cultura", description: "Descripción", fact: null, month: "Enero", monthOrder: 1, timing: "Enero", startDate: null, endDate: null, dateConfirmed: false, imagePath: "https://store.public.blob.vercel-storage.com/event-images/old.jpg", imageAlt: "Fiesta", externalUrl: null, sourceUrl: null, isActive: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(),
};

describe("EventsAdmin", () => {
  beforeEach(() => { vi.resetAllMocks(); window.confirm = vi.fn(() => true); });

  it("shows the current image in edit mode and does not require choosing another", () => {
    render(<EventsAdmin events={[event]} adminEmail="admin@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByText("Imagen actual")).toBeVisible();
    expect(screen.getByText("Elegir nueva imagen")).toBeVisible();
    expect(screen.getByLabelText("Vista previa de la imagen del evento")).toBeVisible();
  });

  it("shows publication state and changes it with the explicit control", async () => {
    actionMocks.setActive.mockResolvedValue({ ok: true, message: "Evento desactivado." });
    render(<EventsAdmin events={[event]} adminEmail="admin@example.com" />);
    expect(screen.getByText("✓ Activo")).toBeVisible();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Desactivar" })); });
    expect(actionMocks.setActive).toHaveBeenCalledWith(event.id, false);
  });
});
