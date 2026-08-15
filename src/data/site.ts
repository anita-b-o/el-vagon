export const siteConfig = {
  name: "El Vagón",
  shortDescription:
    "Un alojamiento rodeado de naturaleza para descansar y disfrutar General Belgrano.",
  city: "General Belgrano",
  province: "Buenos Aires",
  country: "Argentina",
  address: "Dorrego 747",
  fullAddress: "Dorrego 747, General Belgrano, Buenos Aires, Argentina",
  instagram: "https://www.instagram.com/elvagongeneralbelgrano/",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ?? "",
  bookingMessage:
    "Hola, estuve viendo la página de El Vagón y quisiera consultar disponibilidad.",
  logos: {
    light: "/images/brand/el-vagon-logo-light.png",
    dark: "/images/brand/el-vagon-logo-dark.png",
    markLight: "/images/brand/el-vagon-isotipo-light.png",
    markDark: "/images/brand/el-vagon-isotipo-dark.png",
  },
} as const;

export const navigation = [
  { label: "El Vagón", href: "#el-vagon" },
  { label: "El alojamiento", href: "#alojamiento" },
  { label: "Experiencia", href: "#experiencia" },
  { label: "General Belgrano", href: "#general-belgrano" },
  { label: "Galería", href: "#galeria" },
  { label: "Ubicación", href: "#ubicacion" },
  { label: "Contacto", href: "#contacto" },
] as const;

export const amenities = [
  { label: "Hasta 2 huéspedes", icon: "users" },
  { label: "1 dormitorio", icon: "bed" },
  { label: "Cama doble", icon: "moon" },
  { label: "Baño privado", icon: "bath" },
  { label: "Cocina", icon: "cooking" },
  { label: "Wi-Fi", icon: "wifi" },
  { label: "Pileta de temporada", icon: "waves" },
  { label: "Estacionamiento", icon: "car" },
  { label: "Bicicletas", icon: "bike" },
  { label: "Jardín", icon: "leaf" },
  { label: "No se permiten mascotas.", icon: "paw" },
] as const;

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  layout: "portrait" | "landscape" | "square";
};

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/el-vagon/fachada-galeria.webp",
    alt: "Galería de madera de El Vagón rodeada por plantas",
    caption: "La galería, entre madera y verde",
    layout: "portrait",
  },
  {
    src: "/images/el-vagon/estar-comedor.webp",
    alt: "Espacio de estar y comedor de El Vagón",
    caption: "Un interior simple y cálido",
    layout: "portrait",
  },
  {
    src: "/images/el-vagon/pileta-atardecer.webp",
    alt: "Pileta exterior de El Vagón al atardecer",
    caption: "La pileta entre árboles",
    layout: "landscape",
  },
  {
    src: "/images/el-vagon/dormitorio.webp",
    alt: "Dormitorio con cama doble de El Vagón",
    caption: "El dormitorio",
    layout: "portrait",
  },
  {
    src: "/images/el-vagon/galeria-color.webp",
    alt: "Galería exterior con ventanas de colores y vegetación",
    caption: "Colores y detalles de la casa",
    layout: "portrait",
  },
  {
    src: "/images/el-vagon/cocina.webp",
    alt: "Cocina equipada del alojamiento",
    caption: "La cocina",
    layout: "portrait",
  },
  {
    src: "/images/el-vagon/deck-exterior.webp",
    alt: "Deck y fachada exterior de madera de El Vagón",
    caption: "El deck exterior",
    layout: "portrait",
  },
  {
    src: "/images/el-vagon/bano.webp",
    alt: "Baño privado del alojamiento",
    caption: "El baño privado",
    layout: "portrait",
  },
  {
    src: "/images/el-vagon/ventanas-jardin.webp",
    alt: "Ventanas de colores vistas desde el jardín",
    caption: "Detalles que aparecen entre el verde",
    layout: "portrait",
  },
  {
    src: "/images/general-belgrano/rio-salado.webp",
    alt: "Vista del Río Salado en General Belgrano",
    caption: "Río Salado, General Belgrano",
    layout: "landscape",
  },
  {
    src: "/images/general-belgrano/costanera-atardecer.webp",
    alt: "Paseo costanero de General Belgrano al atardecer",
    caption: "La costanera al final del día",
    layout: "portrait",
  },
];
