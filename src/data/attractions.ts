export type Attraction = {
  name: string;
  description: string;
  href: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  image?: {
    src: string;
    alt: string;
    objectPosition?: string;
  };
};

export const attractions: readonly Attraction[] = [
  {
    name: "Termas del Salado",
    description:
      "Un espacio termal para relajarse y sumar una experiencia distinta durante la visita a General Belgrano.",
    href: "https://share.google/TbrwB7rDFMfTW1iP4",
    secondaryHref: "https://termasdelsalado.com.ar/",
    secondaryLabel: "Ver calendario de apertura",
    image: {
      src: "/images/general-belgrano/termas-del-salado.webp",
      alt: "Termas del Salado en General Belgrano",
      objectPosition: "center 58%",
    },
  },
  {
    name: "Bosque Encantado",
    description:
      "Un paseo entre naturaleza y senderos, ideal para disfrutar General Belgrano con más calma.",
    href: "https://share.google/KdC14zxLpOg0G6goV",
    image: {
      src: "/images/general-belgrano/bosque-encantado.webp",
      alt: "Bosque Encantado de General Belgrano",
      objectPosition: "center",
    },
  },
];
