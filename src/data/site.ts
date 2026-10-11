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
  { label: "Preguntas frecuentes", href: "/#preguntas-frecuentes" },
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
  id: string;
  question: string;
  answer: string;
};

export type FAQCategory = {
  id: string;
  title: string;
  questions: readonly FrequentlyAskedQuestion[];
};

export const frequentlyAskedQuestions = [
  {
    id: "reservas-y-horarios",
    title: "Reservas y horarios",
    questions: [
      {
        id: "confirmar-reserva",
        question: "¿Cómo confirmo mi reserva?",
        answer: "La reserva se confirma abonando el 50% del importe de la estadía.",
      },
      {
        id: "consultar-disponibilidad",
        question: "¿Cómo consulto disponibilidad?",
        answer:
          "Podés seleccionar las fechas en nuestro calendario y enviarnos tu consulta por WhatsApp.",
      },
      {
        id: "horarios-ingreso-salida",
        question: "¿Cuáles son los horarios de ingreso y salida?",
        answer: "El check-in es a partir de las 15:00 y el check-out es hasta las 11:00.",
      },
      {
        id: "fecha-ocupada",
        question: "¿Qué significa que una fecha aparezca ocupada?",
        answer: "Significa que esa noche no se encuentra disponible para nuevas reservas.",
      },
    ],
  },
  {
    id: "accesibilidad",
    title: "Accesibilidad",
    questions: [
      {
        id: "movilidad-reducida",
        question: "¿El alojamiento es accesible para personas con movilidad reducida?",
        answer:
          "No. El Vagón no está adaptado para personas con movilidad reducida. Si tenés alguna necesidad particular de accesibilidad, recomendamos consultarnos antes de reservar.",
      },
      {
        id: "bano-accesible",
        question: "¿El baño está adaptado para personas con movilidad reducida?",
        answer:
          "No. El baño no está adaptado, aunque cuenta con una manija de apoyo para sujetarse.",
      },
    ],
  },
  {
    id: "comodidades-y-servicios",
    title: "Comodidades y servicios",
    questions: [
      {
        id: "servicios",
        question: "¿Qué servicios ofrece El Vagón?",
        answer:
          "El alojamiento cuenta con Wi-Fi, Smart TV, ropa de cama y toallas, artículos de aseo básicos, calefactores, ventiladores de techo, cochera cubierta, quincho, parrilla y bicicletas. También dispone de pileta compartida durante la temporada.",
      },
      {
        id: "pileta-privada",
        question: "¿La pileta es privada?",
        answer: "No. La pileta es compartida y está disponible durante la temporada.",
      },
    ],
  },
  {
    id: "ubicacion-y-entorno",
    title: "Ubicación y entorno",
    questions: [
      {
        id: "ubicacion",
        question: "¿Dónde está ubicado El Vagón?",
        answer:
          "El alojamiento se encuentra en General Belgrano, provincia de Buenos Aires.",
      },
      {
        id: "privacidad",
        question: "¿Voy a tener privacidad durante mi estadía?",
        answer:
          "El Vagón se encuentra en un jardín arbolado de aproximadamente 2.000 m², que ofrece un entorno agradable para descansar. La pileta es compartida.",
      },
    ],
  },
] as const satisfies readonly FAQCategory[];

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
