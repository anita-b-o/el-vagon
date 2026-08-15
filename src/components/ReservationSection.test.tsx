// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReservationSection } from "./ReservationSection";

describe("ReservationSection", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ unavailable: [{ startDate: "2026-09-20", endDate: "2026-09-23" }] }),
    }));
  });

  it("loads public availability and keeps the consultation disabled until dates are selected", async () => {
    render(<ReservationSection />);
    expect(screen.getByRole("heading", { name: "Elegí tus fechas" })).toBeInTheDocument();
    const submit = screen.getByRole("button", { name: /Consultar disponibilidad por WhatsApp/i });
    expect(submit).toBeDisabled();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/availability"), { cache: "no-store" }));
    expect(screen.getByText(/Esta consulta no constituye una reserva/)).toBeInTheDocument();
  });
});
