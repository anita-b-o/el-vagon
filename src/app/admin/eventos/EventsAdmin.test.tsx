// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const actionMocks = vi.hoisted(() => ({ save: vi.fn(), saveOrder: vi.fn(), setActive: vi.fn(), remove: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/admin/actions", () => ({ signOutAction: vi.fn() }));
vi.mock("./actions", () => ({
  saveCulturalEventAction: actionMocks.save,
  saveCulturalEventOrderAction: actionMocks.saveOrder,
  setCulturalEventActiveAction: actionMocks.setActive,
  deleteCulturalEventAction: actionMocks.remove,
}));
import { EventsAdmin } from "./EventsAdmin";

const event = {
  id: "d8b807a2-871c-4cc8-b452-6c9254f17716", slug: "fiesta-prueba", name: "Fiesta prueba", category: "Cultura", description: "Descripción", fact: null, month: "Enero", monthOrder: 1, timing: "Enero", startDate: null, endDate: null, dateConfirmed: false, imagePath: "https://store.public.blob.vercel-storage.com/event-images/old.jpg", imageAlt: "Fiesta", externalUrl: null, sourceUrl: null, isActive: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date(),
};

describe("EventsAdmin", () => {
  beforeEach(() => { vi.resetAllMocks(); window.confirm = vi.fn(() => true); window.sessionStorage.clear(); });
  afterEach(() => vi.useRealTimers());

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

  it("loads editing data, scrolls to the form, focuses Nombre, and cancels", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
    render(<EventsAdmin events={[event]} adminEmail="admin@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    await act(async () => { await new Promise((resolve) => requestAnimationFrame(resolve)); });
    expect(screen.getByText("Editando evento")).toBeVisible();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue(event.name);
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("heading", { name: "Nuevo evento" })).toBeVisible();
    expect(screen.queryByText("Editando evento")).not.toBeInTheDocument();
  });

  it("reorders locally, marks the order as dirty, and does not write immediately", () => {
    const second = { ...event, id: "86f6d8e4-156d-4639-b2d6-3b786bfcb2d1", name: "Otro evento", sortOrder: 1 };
    render(<EventsAdmin events={[event, second]} adminEmail="admin@example.com" />);
    expect(screen.getByRole("button", { name: `Subir ${event.name}` })).toBeDisabled();
    expect(screen.getByRole("button", { name: `Bajar ${second.name}` })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: `Bajar ${event.name}` }));
    expect(screen.getByRole("button", { name: "Guardar orden" })).toBeVisible();
    expect(actionMocks.saveOrder).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: `Subir ${event.name}` })).not.toBeDisabled();
  });

  it("sends only changed months and clears the dirty controls after saving", async () => {
    const second = { ...event, id: "86f6d8e4-156d-4639-b2d6-3b786bfcb2d1", name: "Otro evento", sortOrder: 1 };
    actionMocks.saveOrder.mockResolvedValue({ ok: true, message: "Orden guardado" });
    render(<EventsAdmin events={[event, second]} adminEmail="admin@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: `Bajar ${event.name}` }));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Guardar orden" })); });
    expect(actionMocks.saveOrder).toHaveBeenCalledWith([{ month: 1, ids: [second.id, event.id] }]);
    expect(screen.queryByRole("button", { name: "Guardar orden" })).not.toBeInTheDocument();
    expect(screen.getByText("Orden guardado")).toBeVisible();
  });

  it("keeps successful order feedback visible through refresh and clears it after a short delay", async () => {
    vi.useFakeTimers();
    const second = { ...event, id: "86f6d8e4-156d-4639-b2d6-3b786bfcb2d1", name: "Otro evento", sortOrder: 1 };
    actionMocks.saveOrder.mockResolvedValue({ ok: true, message: "Orden guardado" });
    const { unmount } = render(<EventsAdmin events={[event, second]} adminEmail="admin@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: `Bajar ${event.name}` }));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Guardar orden" })); });
    expect(screen.getByText("Orden guardado")).toBeVisible();

    unmount();
    render(<EventsAdmin events={[event, second]} adminEmail="admin@example.com" />);
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(screen.getByText("Orden guardado")).toBeVisible();
    await act(async () => { await vi.advanceTimersByTimeAsync(2_500); });
    expect(screen.queryByText("Orden guardado")).not.toBeInTheDocument();
  });

  it("restores the received order when discarding changes", () => {
    const second = { ...event, id: "86f6d8e4-156d-4639-b2d6-3b786bfcb2d1", name: "Otro evento", sortOrder: 1 };
    render(<EventsAdmin events={[event, second]} adminEmail="admin@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: `Bajar ${event.name}` }));
    fireEvent.click(screen.getByRole("button", { name: "Descartar cambios" }));
    expect(screen.queryByRole("button", { name: "Guardar orden" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Subir ${event.name}` })).toBeDisabled();
  });

  it("keeps local order and dirty controls when saving fails", async () => {
    const second = { ...event, id: "86f6d8e4-156d-4639-b2d6-3b786bfcb2d1", name: "Otro evento", sortOrder: 1 };
    actionMocks.saveOrder.mockResolvedValue({ ok: false, message: "No se pudo guardar el orden." });
    render(<EventsAdmin events={[event, second]} adminEmail="admin@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: `Bajar ${event.name}` }));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Guardar orden" })); });
    expect(screen.getByRole("button", { name: "Guardar orden" })).toBeVisible();
    expect(screen.getByText("No se pudo guardar el orden.")).toBeVisible();
    expect(screen.getByRole("button", { name: `Subir ${event.name}` })).not.toBeDisabled();
  });

  it("renders the shared navigation with its expected destinations", () => {
    render(<EventsAdmin events={[event]} adminEmail="admin@example.com" />);
    expect(screen.getByRole("link", { name: "Reservas" })).toHaveAttribute("href", "/admin/reservas");
    expect(screen.getByRole("link", { name: "Eventos" })).toHaveAttribute("href", "/admin/eventos");
    expect(screen.getByRole("link", { name: "El Vagón" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: /Salir/i })).toBeVisible();
  });
});
