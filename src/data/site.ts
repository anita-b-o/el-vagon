export const siteConfig = {
  name: "El Vagón",
  shortDescription:
    "Un alojamiento rodeado de naturaleza para descansar y disfrutar General Belgrano.",
  city: "General Belgrano",
  province: "Buenos Aires",
  country: "Argentina",
  address: "Dorrego 747",
  fullAddress: "Dorrego 747, General Belgrano, Buenos Aires, Argentina",
  contact: {
    email: "elvagongbelgrano.2024@gmail.com",
    telephone: "2241 572170",
    instagram: "https://www.instagram.com/elvagongeneralbelgrano/",
    whatsapp: {
      display: "2241 572170",
      number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "5492241572170",
    },
  },
  externalProfiles: {
    booking: "https://www.booking.com/hotel/ar/el-vagon-general-belgrano.html",
    airbnb: "https://www.airbnb.com.ar/rooms/1282026783450558700",
  },
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
  { label: "El Vagón", href: "/" },
  { label: "Experiencia", href: "/#experiencia" },
  { label: "Galería", href: "/#galeria" },
  { label: "Ubicación", href: "/#ubicacion" },
  { label: "Disponibilidad", href: "/#reservas" },
  { label: "General Belgrano", href: "/general-belgrano" },
  { label: "Agenda", href: "/agenda" },
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
  { label: "Parrilla", icon: "grill" },
  { label: "No se permiten mascotas", icon: "paw" },
] as const;

export type FrequentlyAskedQuestion = {
  question: string;
  answer: string;
};

export const frequentlyAskedQuestions = [
  {
    question: "¿Para cuántas personas es El Vagón?",
    answer: "El alojamiento está pensado para 2 personas y cuenta con una cama doble.",
  },
  {
    question: "¿El alojamiento es accesible para personas con movilidad reducida?",
    answer:
      "No. El Vagón no está adaptado para personas con movilidad reducida. Si tenés alguna necesidad particular de accesibilidad, recomendamos consultarnos antes de reservar.",
  },
  {
    question: "¿El baño está adaptado para personas con movilidad reducida?",
    answer:
      "No. El baño no está adaptado, aunque cuenta con una manija de apoyo para sujetarse.",
  },
  {
    question: "¿El alojamiento tiene baño privado?",
    answer: "Sí. El Vagón cuenta con baño privado dentro del alojamiento.",
  },
  {
    question: "¿Tiene cocina?",
    answer: "Sí. Cuenta con cocina propia para preparar comidas durante la estadía.",
  },
  {
    question: "¿Tiene Wi-Fi?",
    answer: "Sí. El alojamiento dispone de conexión Wi-Fi.",
  },
  {
    question: "¿Hay estacionamiento?",
    answer: "Sí. El Vagón cuenta con estacionamiento para los huéspedes.",
  },
  {
    question: "¿Tiene pileta?",
    answer: "Sí. Hay pileta disponible durante la temporada.",
  },
  {
    question: "¿Tiene espacio al aire libre?",
    answer:
      "Sí. El alojamiento cuenta con jardín y espacios exteriores para disfrutar durante la estadía.",
  },
  {
    question: "¿Hay bicicletas disponibles?",
    answer: "Sí. El Vagón cuenta con bicicletas para uso de los huéspedes.",
  },
  {
    question: "¿Cuáles son los horarios de ingreso y salida?",
    answer: "El check-in es a partir de las 15:00 y el check-out es hasta las 11:00.",
  },
  {
    question: "¿Cómo puedo consultar disponibilidad o reservar?",
    answer:
      "Podés seleccionar las fechas desde nuestro calendario de disponibilidad y enviarnos tu consulta por WhatsApp.",
  },
  {
    question: "¿Qué sucede si una fecha aparece ocupada en el calendario?",
    answer:
      "Las noches marcadas como ocupadas no se encuentran disponibles para nuevas reservas.",
  },
  {
    question: "¿Dónde está ubicado El Vagón?",
    answer:
      "El alojamiento se encuentra en General Belgrano, provincia de Buenos Aires.",
  },
] as const satisfies readonly FrequentlyAskedQuestion[];

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  layout: "portrait" | "landscape" | "square";
};

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/el-vagon/galeria-color.webp",
    alt: "Galería exterior con ventanas de colores y vegetación",
    caption: "Colores y detalles de la casa",
    layout: "portrait",
  },
  {
    src: "/images/el-vagon/deck-exterior.webp",
    alt: "Deck y fachada exterior de madera de El Vagón",
    caption: "El deck exterior",
    layout: "portrait",
  },
  {
    src: "/images/el-vagon/ventanas-jardin.webp",
    alt: "Ventanas de colores vistas desde el jardín",
    caption: "Detalles que aparecen entre el verde",
    layout: "portrait",
  },
  {
    src: "/images/el-vagon/detalle-exterior.webp",
    alt: "Detalle exterior de madera de El Vagón",
    caption: "Detalles de El Vagón",
    layout: "portrait",
  },
];
