export type RecurringMonthName =
  | "Enero"
  | "Febrero"
  | "Marzo"
  | "Abril"
  | "Mayo"
  | "Junio"
  | "Julio"
  | "Agosto"
  | "Septiembre"
  | "Octubre"
  | "Noviembre"
  | "Diciembre";

export type RecurringEventSource = {
  label: string;
  url: string;
};

export type RecurringEventImage = {
  src: string;
  alt: string;
  sourceLabel: string;
  sourceUrl?: string;
  objectPosition?: string;
};

export type RecurringEvent = {
  slug: string;
  month: RecurringMonthName;
  timing: string;
  name: string;
  category: string;
  description: string;
  fact?: string;
  image?: RecurringEventImage;
  link?: string;
  sources: RecurringEventSource[];
  nextEdition?: {
    date: string;
    confirmed: true;
  };
};

export const recurringMonths = [
  { id: "enero", name: "Enero", shortLabel: "ENE" },
  { id: "febrero", name: "Febrero", shortLabel: "FEB" },
  { id: "marzo", name: "Marzo", shortLabel: "MAR" },
  { id: "abril", name: "Abril", shortLabel: "ABR" },
  { id: "mayo", name: "Mayo", shortLabel: "MAY" },
  { id: "junio", name: "Junio", shortLabel: "JUN" },
  { id: "julio", name: "Julio", shortLabel: "JUL" },
  { id: "agosto", name: "Agosto", shortLabel: "AGO" },
  { id: "septiembre", name: "Septiembre", shortLabel: "SEP" },
  { id: "octubre", name: "Octubre", shortLabel: "OCT" },
  { id: "noviembre", name: "Noviembre", shortLabel: "NOV" },
  { id: "diciembre", name: "Diciembre", shortLabel: "DIC" },
] as const satisfies ReadonlyArray<{
  id: string;
  name: RecurringMonthName;
  shortLabel: string;
}>;

const tourismSource = {
  label: "Turismo General Belgrano",
  url: "https://generalbelgrano.tur.ar/novedades",
} as const;

const municipalitySource = {
  label: "Municipalidad de General Belgrano",
  url: "https://generalbelgrano.gob.ar/",
} as const;

const sibom2024Source = {
  label: "SIBOM Provincia de Buenos Aires · 2024",
  url: "https://sibom.slyt.gba.gov.ar/bulletins/11061.pdf",
} as const;

const sibom2023Source = {
  label: "SIBOM Provincia de Buenos Aires · 2023",
  url: "https://sibom.slyt.gba.gov.ar/bulletins/10831.pdf",
} as const;

export const recurringEvents: RecurringEvent[] = [
  {
    slug: "festival-morfi",
    month: "Enero",
    timing: "Enero · fechas variables",
    name: "Festival Morfi",
    category: "Gastronomía · Música · Encuentro",
    description:
      "Un festival para probar sabores, conocer emprendedores y artesanos, recorrer sus patios gastronómico y cervecero y quedarse entre música, danza, peña, baile y propuestas para las infancias.",
    fact: "Más de 16.000 personas en su edición 2026",
    image: {
      src: "/images/events/festival-morfi.webp",
      alt: "Festival Morfi en General Belgrano",
      sourceLabel: "Archivo provisto por El Vagón",
      objectPosition: "center 52%",
    },
    sources: [tourismSource, municipalitySource],
  },
  {
    slug: "festival-mayor-tango-folklore",
    month: "Febrero",
    timing: "Febrero",
    name: "Festival Mayor de Tango y Folklore",
    category: "Tango · Folklore · Danza",
    description:
      "Uno de los grandes encuentros culturales de General Belgrano, con artistas nacionales, regionales y locales reunidos alrededor del tango, el folklore y la danza.",
    fact: "Desde 1994 · 33.ª edición en 2026",
    image: {
      src: "/images/events/festival-mayor-tango-folklore.webp",
      alt: "Festival Mayor de Tango y Folklore de General Belgrano",
      sourceLabel: "Archivo provisto por El Vagón",
      objectPosition: "center 50%",
    },
    sources: [tourismSource, municipalitySource, sibom2024Source],
  },
  {
    slug: "carnaval-general-belgrano",
    month: "Febrero",
    timing: "Febrero · según calendario de Carnaval",
    name: "Carnaval de General Belgrano",
    category: "Carnaval · Calle · Baile",
    description:
      "Murgas, comparsas, espuma, carrozas y batucadas transforman las calles y plazas de la ciudad en una celebración popular para bailar y compartir.",
    image: {
      src: "/images/events/carnaval-general-belgrano.webp",
      alt: "Carnaval de General Belgrano",
      sourceLabel: "Archivo provisto por El Vagón",
      objectPosition: "center 58%",
    },
    sources: [tourismSource, municipalitySource],
  },
  {
    slug: "festival-megatropical",
    month: "Febrero",
    timing: "Febrero",
    name: "Festival Megatropical",
    category: "Cumbia · Música tropical",
    description:
      "Una noche dedicada a la cumbia y la música tropical, que combina artistas reconocidos con propuestas locales y el espíritu festivo de la ciudad.",
    image: {
      src: "/images/events/festival-megatropical.webp",
      alt: "Festival Megatropical de General Belgrano",
      sourceLabel: "Archivo provisto por El Vagón",
      objectPosition: "center 52%",
    },
    sources: [tourismSource, municipalitySource],
  },
  {
    slug: "aniversario-general-belgrano",
    month: "Agosto",
    timing: "Alrededor del 1 de agosto",
    name: "Aniversario de General Belgrano",
    category: "Historia · Tradición · Comunidad",
    description:
      "La ciudad celebra su fundación con desfile cívico y criollo, espectáculos y sabores que ya son parte del encuentro: locro, torta aniversario y chocolate caliente.",
    image: {
      src: "/images/events/aniversario-general-belgrano.webp",
      alt: "Vecinos cortando la gran torta durante el aniversario de General Belgrano",
      sourceLabel: "Archivo oficial municipal",
      sourceUrl:
        "https://assets.zyrosite.com/AwvGNWJ0W0HNQo17/1-AVLxKqr1nwHExevD.jpg",
    },
    sources: [tourismSource, municipalitySource, sibom2024Source],
  },
  {
    slug: "fiesta-bondiola-tradicion",
    month: "Noviembre",
    timing: "Noviembre",
    name: "Fiesta de la Bondiola y la Tradición",
    category: "Gastronomía · Tradición",
    description:
      "Una fiesta de sabores y cultura criolla con bondiola, desfile, juegos camperos, folklore, música y un paseo de artesanos y emprendedores.",
    fact: "Miles de visitantes en ediciones recientes",
    image: {
      src: "/images/events/fiesta-bondiola-tradicion.webp",
      alt: "Visitantes recorriendo los puestos de la Fiesta de la Bondiola y la Tradición",
      sourceLabel: "Archivo oficial municipal",
      sourceUrl:
        "https://assets.zyrosite.com/AwvGNWJ0W0HNQo17/14-kJZTKdz8Lb1zQnsN.jpg",
    },
    sources: [tourismSource, municipalitySource, sibom2023Source],
  },
  {
    slug: "encuentro-gaucho-costas-salado",
    month: "Diciembre",
    timing: "Diciembre",
    name: "Encuentro Gaucho a las Costas del Salado",
    category: "Cultura criolla · Música · Danza",
    description:
      "Un encuentro junto al Salado para acercarse a la cultura criolla entre folklore, tango, danza, músicos, cantinas, artesanos y actividades gauchas.",
    image: {
      src: "/images/events/encuentro-gaucho-salado.webp",
      alt: "Encuentro Gaucho a las Costas del Salado",
      sourceLabel: "Archivo provisto por El Vagón",
      objectPosition: "center 48%",
    },
    sources: [tourismSource, municipalitySource, sibom2023Source],
  },
  {
    slug: "fiestas-patronales-inmaculada-concepcion",
    month: "Diciembre",
    timing: "8 de diciembre",
    name: "Fiestas Patronales de la Inmaculada Concepción",
    category: "Fe · Tradición · Comunidad",
    description:
      "La celebración patronal reúne a la comunidad de General Belgrano alrededor de sus actividades religiosas, la misa y la tradicional procesión.",
    image: {
      src: "/images/events/fiestas-patronales-inmaculada.webp",
      alt: "Fiestas Patronales de la Inmaculada Concepción en General Belgrano",
      sourceLabel: "Archivo provisto por El Vagón",
      objectPosition: "center 45%",
    },
    sources: [municipalitySource, sibom2023Source],
  },
];
