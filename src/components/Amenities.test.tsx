// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { amenities } from "@/data/site";
import { Amenities } from "./Amenities";

describe("Amenities", () => {
  it("keeps every amenity as a direct grid item, including the final row", () => {
    const { container } = render(<Amenities />);
    const list = container.querySelector(".amenities-list");
    const items = list?.querySelectorAll(":scope > li");

    expect(list).toHaveClass("amenities-list");
    expect(items).toHaveLength(amenities.length);
    expect(items && Array.from(items, (item) => item.textContent?.trim())).toEqual(
      amenities.map(({ label }) => label),
    );
    expect(screen.getByText("Lo esencial")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Para una estadía simple y cómoda", level: 2 }),
    ).toBeInTheDocument();
  });
});
