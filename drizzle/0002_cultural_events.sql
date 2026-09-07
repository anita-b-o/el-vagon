CREATE TABLE cultural_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  fact text,
  month text NOT NULL,
  month_order smallint NOT NULL,
  timing text NOT NULL,
  start_date date,
  end_date date,
  date_confirmed boolean NOT NULL DEFAULT false,
  image_path text,
  image_alt text,
  external_url text,
  source_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cultural_events_month_order_check CHECK (month_order BETWEEN 1 AND 12),
  CONSTRAINT cultural_events_dates_check CHECK ((date_confirmed = false AND start_date IS NULL AND end_date IS NULL) OR (date_confirmed = true AND start_date IS NOT NULL AND end_date IS NOT NULL AND end_date >= start_date))
);
CREATE UNIQUE INDEX cultural_events_slug_idx ON cultural_events (slug);
CREATE INDEX cultural_events_public_order_idx ON cultural_events (is_active, month_order, sort_order, name);

INSERT INTO cultural_events (slug, name, category, description, fact, month, month_order, timing, image_path, image_alt, source_url, sort_order) VALUES
('festival-morfi', 'Festival Morfi', 'Gastronomía · Música · Encuentro', 'Un festival para probar sabores, conocer emprendedores y artesanos, recorrer sus patios gastronómico y cervecero y quedarse entre música, danza, peña, baile y propuestas para las infancias.', 'Más de 16.000 personas en su edición 2026', 'Enero', 1, 'Enero · fechas variables', '/images/events/festival-morfi.webp', 'Festival Morfi en General Belgrano', 'https://generalbelgrano.tur.ar/novedades', 0),
('festival-mayor-tango-folklore', 'Festival Mayor de Tango y Folklore', 'Tango · Folklore · Danza', 'Uno de los grandes encuentros culturales de General Belgrano, con artistas nacionales, regionales y locales reunidos alrededor del tango, el folklore y la danza.', 'Desde 1994 · 33.ª edición en 2026', 'Febrero', 2, 'Febrero', '/images/events/festival-mayor-tango-folklore.webp', 'Festival Mayor de Tango y Folklore de General Belgrano', 'https://generalbelgrano.tur.ar/novedades', 1),
('carnaval-general-belgrano', 'Carnaval de General Belgrano', 'Carnaval · Calle · Baile', 'Murgas, comparsas, espuma, carrozas y batucadas transforman las calles y plazas de la ciudad en una celebración popular para bailar y compartir.', NULL, 'Febrero', 2, 'Febrero · según calendario de Carnaval', '/images/events/carnaval-general-belgrano.webp', 'Carnaval de General Belgrano', 'https://generalbelgrano.tur.ar/novedades', 2),
('festival-megatropical', 'Festival Megatropical', 'Cumbia · Música tropical', 'Una noche dedicada a la cumbia y la música tropical, que combina artistas reconocidos con propuestas locales y el espíritu festivo de la ciudad.', NULL, 'Febrero', 2, 'Febrero', '/images/events/festival-megatropical.webp', 'Festival Megatropical de General Belgrano', 'https://generalbelgrano.tur.ar/novedades', 3),
('aniversario-general-belgrano', 'Aniversario de General Belgrano', 'Historia · Tradición · Comunidad', 'La ciudad celebra su fundación con desfile cívico y criollo, espectáculos y sabores que ya son parte del encuentro: locro, torta aniversario y chocolate caliente.', 'Alrededor del 1 de agosto', 'Agosto', 8, 'Alrededor del 1 de agosto', '/images/events/aniversario-general-belgrano.webp', 'Vecinos cortando la gran torta durante el aniversario de General Belgrano', 'https://generalbelgrano.tur.ar/novedades', 4),
('fiesta-bondiola-tradicion', 'Fiesta de la Bondiola y la Tradición', 'Gastronomía · Tradición', 'Una fiesta de sabores y cultura criolla con bondiola, desfile, juegos camperos, folklore, música y un paseo de artesanos y emprendedores.', 'Miles de visitantes en ediciones recientes', 'Noviembre', 11, 'Noviembre', '/images/events/fiesta-bondiola-tradicion.webp', 'Visitantes recorriendo los puestos de la Fiesta de la Bondiola y la Tradición', 'https://generalbelgrano.tur.ar/novedades', 5),
('encuentro-gaucho-costas-salado', 'Encuentro Gaucho a las Costas del Salado', 'Cultura criolla · Música · Danza', 'Un encuentro junto al Salado para acercarse a la cultura criolla entre folklore, tango, danza, músicos, cantinas, artesanos y actividades gauchas.', NULL, 'Diciembre', 12, 'Diciembre', '/images/events/encuentro-gaucho-salado.webp', 'Encuentro Gaucho a las Costas del Salado', 'https://generalbelgrano.tur.ar/novedades', 6),
('fiestas-patronales-inmaculada-concepcion', 'Fiestas Patronales de la Inmaculada Concepción', 'Fe · Tradición · Comunidad', 'La celebración patronal reúne a la comunidad de General Belgrano alrededor de sus actividades religiosas, la misa y la tradicional procesión.', NULL, 'Diciembre', 12, '8 de diciembre', '/images/events/fiestas-patronales-inmaculada.webp', 'Fiestas Patronales de la Inmaculada Concepción en General Belgrano', 'https://generalbelgrano.gob.ar/', 7)
ON CONFLICT (slug) DO NOTHING;
