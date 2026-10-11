// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { frequentlyAskedQuestions } from "@/data/site";
import { FrequentlyAskedQuestions } from "./FrequentlyAskedQuestions";

describe("FrequentlyAskedQuestions", () => {
  it("renders four collapsed categories and their collapsed questions", () => {
    const { container } = render(<FrequentlyAskedQuestions />);
    const section = container.querySelector("#preguntas-frecuentes");

    expect(section).toHaveAttribute("aria-labelledby", "faq-title");
    expect(
      screen.getByRole("heading", { name: "Preguntas frecuentes", level: 2 }),
    ).toBeInTheDocument();

    const categories = container.querySelectorAll<HTMLDetailsElement>(".faq-category");
    expect(categories).toHaveLength(4);
    expect(container.querySelectorAll("details[open]")).toHaveLength(0);
    expect(
      Array.from(categories, (category) => category.querySelectorAll(".faq-item").length),
    ).toEqual([4, 2, 2, 2]);

    frequentlyAskedQuestions.forEach(({ title, questions }, index) => {
      expect(within(categories[index]).getByText(title)).toBeInTheDocument();
      expect(categories[index]).not.toHaveAttribute("open");
      questions.forEach(({ question, answer }) => {
        expect(within(categories[index]).getByText(question)).toBeInTheDocument();
        expect(within(categories[index]).getByText(answer)).toBeInTheDocument();
      });
    });
  });

  it("expands categories and questions independently through native summary controls", () => {
    const { container } = render(<FrequentlyAskedQuestions />);
    const category = container.querySelector(".faq-category");
    const categorySummary = category?.querySelector(":scope > summary");
    const question = category?.querySelector(".faq-item");
    const questionSummary = question?.querySelector("summary");

    expect(categorySummary).not.toBeNull();
    expect(questionSummary).not.toBeNull();
    fireEvent.click(categorySummary!);
    expect(category).toHaveAttribute("open");
    fireEvent.click(questionSummary!);
    expect(question).toHaveAttribute("open");
    fireEvent.click(questionSummary!);
    expect(question).not.toHaveAttribute("open");
    fireEvent.click(categorySummary!);
    expect(category).not.toHaveAttribute("open");
  });

  it("allows more than one category to remain open", () => {
    const { container } = render(<FrequentlyAskedQuestions />);
    const summaries = container.querySelectorAll(".faq-category > summary");

    fireEvent.click(summaries[0]);
    fireEvent.click(summaries[1]);

    expect(container.querySelectorAll(".faq-category[open]")).toHaveLength(2);
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

  it("states reservation, services, pool, and setting details without redundant questions", () => {
    render(<FrequentlyAskedQuestions />);

    expect(
      screen.getByText("La reserva se confirma abonando el 50% del importe de la estadía."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "El alojamiento cuenta con Wi-Fi, Smart TV, ropa de cama y toallas, artículos de aseo básicos, calefactores, ventiladores de techo, cochera cubierta, quincho, parrilla y bicicletas. También dispone de pileta compartida durante la temporada.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No. La pileta es compartida y está disponible durante la temporada."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "El Vagón se encuentra en un jardín arbolado de aproximadamente 2.000 m², que ofrece un entorno agradable para descansar. La pileta es compartida.",
      ),
    ).toBeInTheDocument();

    [
      "¿Tiene cocina?",
      "¿Tiene Wi-Fi?",
      "¿El alojamiento tiene baño privado?",
      "¿Tiene espacio al aire libre?",
      "¿Qué incluye el alojamiento?",
      "¿Para cuántas personas es El Vagón?",
      "¿Hay bicicletas disponibles para los huéspedes?",
      "¿Hay estacionamiento disponible?",
      "¿La pileta está disponible durante todo el año?",
    ].forEach((question) => expect(screen.queryByText(question)).not.toBeInTheDocument());
  });

});
