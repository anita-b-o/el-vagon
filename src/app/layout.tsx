import type { Metadata, Viewport } from "next";
import { bodyFont, displayFont } from "@/lib/fonts";
import { siteConfig } from "@/data/site";
import "./globals.css";

const metadataBase = new URL(siteConfig.siteUrl || "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "El Vagón | Alojamiento en General Belgrano",
  description:
    "El Vagón es un alojamiento rodeado de naturaleza en General Belgrano, Buenos Aires. Descubrí el espacio y consultá disponibilidad para tu próxima escapada.",
  ...(siteConfig.siteUrl
    ? { alternates: { canonical: siteConfig.siteUrl } }
    : {}),
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "El Vagón",
    title: "El Vagón | Alojamiento en General Belgrano",
    description:
      "Una escapada para bajar el ritmo, rodeada de naturaleza en General Belgrano.",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "El Vagón, alojamiento en General Belgrano",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "El Vagón | Alojamiento en General Belgrano",
    description:
      "Una escapada para bajar el ritmo, rodeada de naturaleza en General Belgrano.",
    images: ["/opengraph-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#20382a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}

