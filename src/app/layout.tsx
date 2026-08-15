import type { Metadata, Viewport } from "next";
import { bodyFont, displayFont } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";
import "react-day-picker/style.css";

const siteUrl = getSiteUrl();
const socialImageUrl = siteUrl ? `${siteUrl}/opengraph-image.jpg` : "";

export const metadata: Metadata = {
  ...(siteUrl
    ? {
        metadataBase: new URL(siteUrl),
        alternates: { canonical: siteUrl },
      }
    : {}),
  title: "El Vagón | Alojamiento en General Belgrano",
  description:
    "El Vagón es un alojamiento rodeado de naturaleza en General Belgrano, Buenos Aires. Descubrí el espacio, sus atractivos y las propuestas culturales que acompañan al destino durante el año.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "El Vagón",
    title: "El Vagón | Alojamiento en General Belgrano",
    description:
      "Una escapada para bajar el ritmo, rodeada de naturaleza en General Belgrano.",
    ...(socialImageUrl
      ? {
          images: [
            {
              url: socialImageUrl,
              width: 1200,
              height: 630,
              alt: "El Vagón, alojamiento en General Belgrano",
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "El Vagón | Alojamiento en General Belgrano",
    description:
      "Una escapada para bajar el ritmo, rodeada de naturaleza en General Belgrano.",
    ...(socialImageUrl ? { images: [socialImageUrl] } : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#20382a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-AR"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
