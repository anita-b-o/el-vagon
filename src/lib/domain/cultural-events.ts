import { z } from "zod";

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] as const;

export function slugifyCulturalEventName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

export function culturalEventImageAlt(name: string) {
  return `${name.trim()} en General Belgrano`;
}

export function monthOrderFor(month: string) {
  const order = months.indexOf(month as (typeof months)[number]);
  return order >= 0 ? order + 1 : 1;
}

export const culturalEventSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(160),
  category: z.string().trim().min(1, "La categoría es obligatoria.").max(120),
  description: z.string().trim().min(1, "La descripción es obligatoria.").max(1200),
  fact: z.string().trim().max(300).nullable(),
  month: z.enum(months),
  monthOrder: z.coerce.number().int().min(1).max(12),
  timing: z.string().trim().min(1, "El momento del año es obligatorio.").max(120),
  startDate: z.string().trim().nullable(),
  endDate: z.string().trim().nullable(),
  dateConfirmed: z.boolean(),
  imagePath: z.union([z.string().trim().regex(/^(\/|https:\/\/)/), z.literal("")]).nullable(),
  imageAlt: z.string().trim().max(300).nullable(),
  externalUrl: z.union([z.string().url(), z.literal("")]).transform((value) => value || null),
  sourceUrl: z.union([z.string().url(), z.literal("")]).transform((value) => value || null),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(10000),
}).superRefine((value, ctx) => {
  if (value.dateConfirmed && (!value.startDate || !value.endDate || value.endDate < value.startDate)) {
    ctx.addIssue({ code: "custom", path: ["startDate"], message: "Una fecha confirmada requiere un rango válido." });
  }
  if (!value.dateConfirmed && (value.startDate || value.endDate)) {
    ctx.addIssue({ code: "custom", path: ["dateConfirmed"], message: "No se pueden guardar fechas sin confirmarlas." });
  }
});

export type CulturalEventInput = z.infer<typeof culturalEventSchema>;
