import { formatLocalDate, nightsBetween, type DateRange } from "./dates";

type WhatsAppMessageInput = DateRange & {
  fullName: string;
  guestCount: number;
  question?: string | null;
};

export function buildWhatsAppMessage(input: WhatsAppMessageInput): string {
  const lines = [
    "Hola, quisiera consultar disponibilidad en El Vagón.",
    "",
    `📅 Ingreso: ${formatLocalDate(input.startDate)}`,
    `📅 Salida: ${formatLocalDate(input.endDate)}`,
    `🌙 Estadía: ${nightsBetween(input.startDate, input.endDate)} noches`,
    `👤 Nombre: ${input.fullName}`,
    `👥 Personas: ${input.guestCount}`,
  ];

  const question = input.question?.trim();
  if (question) lines.push("", "Consulta:", question);

  lines.push("", "Solicitud realizada desde el sitio web de El Vagón.");
  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492241572170").replace(
    /\D/g,
    "",
  );
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

