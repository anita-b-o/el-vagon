import { siteConfig } from "@/data/site";

const NON_DIGITS = /\D/g;

export function getBookingContact() {
  const number = siteConfig.whatsapp.replace(NON_DIGITS, "");

  if (number) {
    return {
      href: `https://wa.me/${number}?text=${encodeURIComponent(siteConfig.bookingMessage)}`,
      channel: "WhatsApp" as const,
    };
  }

  return {
    href: siteConfig.instagram,
    channel: "Instagram" as const,
  };
}

export const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  siteConfig.fullAddress,
)}`;

export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  siteConfig.fullAddress,
)}&output=embed`;

