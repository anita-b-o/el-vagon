// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { frequentlyAskedQuestions } from "@/data/site";
import { FrequentlyAskedQuestions } from "./FrequentlyAskedQuestions";

describe("FrequentlyAskedQuestions", () => {
  it("renders every required question and answer collapsed by default", () => {
    const { container } = render(<FrequentlyAskedQuestions />);
    const section = container.querySelector("#preguntas-frecuentes");

    expect(section).toHaveAttribute("aria-labelledby", "faq-title");
    expect(
      screen.getByRole("heading", { name: "Preguntas frecuentes", level: 2 }),
    ).toBeInTheDocument();

    const items = container.querySelectorAll("details");
    expect(items).toHaveLength(frequentlyAskedQuestions.length);

    frequentlyAskedQuestions.forEach(({ question, answer }, index) => {
      expect(within(items[index]).getByText(question)).toBeInTheDocument();
      expect(within(items[index]).getByText(answer)).toBeInTheDocument();
      expect(items[index]).not.toHaveAttribute("open");
    });
  });

  it("expands and collapses an answer through its native summary control", () => {
    const { container } = render(<FrequentlyAskedQuestions />);
    const item = container.querySelector("details");
    const summary = item?.querySelector("summary");

    expect(item).not.toBeNull();
    expect(summary).not.toBeNull();
    fireEvent.click(summary!);
    expect(item).toHaveAttribute("open");
    fireEvent.click(summary!);
    expect(item).not.toHaveAttribute("open");
  });

  it("states the accessibility limitations without ambiguity", () => {
    render(<FrequentlyAskedQuestions />);

    expect(
      screen.getByText(
        "No. El Vagón no está adaptado para personas con movilidad reducida. Si tenés alguna necesidad particular de accesibilidad, recomendamos consultarnos antes de reservar.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "No. El baño no está adaptado, aunque cuenta con una manija de apoyo para sujetarse.",
      ),
    ).toBeInTheDocument();
  });
});
