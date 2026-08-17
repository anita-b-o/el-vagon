import type { Metadata, Viewport } from "next";
import { bodyFont, displayFont } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";
import "react-day-picker/style.css";

const title = "El Vagón | Alojamiento en General Belgrano";
const description =
  "El Vagón es un alojamiento en General Belgrano, Buenos Aires, rodeado de naturaleza y pensado para una escapada de a dos. Consultá disponibilidad y reservá tu estadía.";
const socialImageUrl = `${SITE_URL}/opengraph-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  title,
  description,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "El Vagón",
    url: SITE_URL,
    title,
    description,
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: "El Vagón, alojamiento en General Belgrano",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImageUrl],
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
