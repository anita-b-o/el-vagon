import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  if (process.env.VERCEL_SHARE_URL) {
    await page.goto(process.env.VERCEL_SHARE_URL);
  }
  await page.route("**/api/availability?**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ unavailable: [] }),
  }));
});

test("shows the boutique availability experience", async ({ page }, testInfo) => {
  await page.goto("/#reservas");
  await expect(page.getByRole("heading", { name: "Elegí tus fechas" })).toBeVisible();
  await expect(page.getByText("Estadía mínima: 2 noches")).toBeVisible();
  await expect(page.getByText(/Esta consulta no constituye una reserva/)).toBeVisible();
  const visibleMonths = page.locator(".rdp-month:visible");
  await expect(visibleMonths).toHaveCount(testInfo.project.name === "mobile" ? 1 : 2);
});

test("creates a pending request before handing off to WhatsApp", async ({ page }) => {
  let submitted: Record<string, unknown> | null = null;
  await page.route("**/api/reservation-requests", async (route) => {
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        requestId: "0db4505f-e864-4bec-8183-b1372bf221d5",
        status: "PENDING",
        whatsappUrl: "https://wa.me/5492241572170?text=consulta-e2e",
      }),
    });
  });
  await page.route("https://wa.me/**", (route) => route.abort("blockedbyclient"));

  await page.goto("/#reservas");
  await page.getByRole("button", { name: /18 de septiembre de 2026/i }).click();
  await page.getByRole("button", { name: /20 de septiembre de 2026/i }).click();
  await page.getByLabel("Nombre completo").fill("Ana Pérez");
  await page.getByLabel("Cantidad de personas").selectOption("2");
  await page.getByRole("textbox", { name: "Consulta Opcional" }).fill("Llegamos después de las 18 hs");
  await page.getByRole("button", { name: /Consultar disponibilidad por WhatsApp/i }).click();

  await expect.poll(() => submitted).not.toBeNull();
  expect(submitted).toMatchObject({
    fullName: "Ana Pérez",
    guestCount: "2",
    checkIn: "2026-09-18",
    checkOut: "2026-09-20",
    question: "Llegamos después de las 18 hs",
  });
});

test("keeps the admin panel private and the calendar export token-protected", async ({ page }) => {
  const response = await page.goto("/admin/reservas");
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Administración" })).toBeVisible();
  await expect(page.getByText(/Ingresá con la cuenta de Google autorizada/)).toHaveCount(0);

  const eventsAdmin = await page.request.get("/admin/eventos");
  expect(eventsAdmin.status()).toBeLessThan(400);
  expect(eventsAdmin.url()).toMatch(/\/admin\/login/);

  const ics = await page.request.get("/api/calendar/el-vagon.ics?token=incorrecto");
  expect(ics.status()).toBe(404);
});

test("opens the private admin route from the footer", async ({ page }) => {
  await page.goto("/");

  const adminLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Administración", exact: true });

  await expect(adminLink).toBeVisible();
  await expect(adminLink).toHaveAttribute("href", "/admin/reservas");
  await adminLink.focus();
  await expect(adminLink).toBeFocused();
  await adminLink.click();

  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Administración" })).toBeVisible();
});

test("removes the standalone attractions block from the home only", async ({ page }) => {
  await page.goto("/#general-belgrano");

  const section = page.locator("#general-belgrano");
  await expect(section.locator(".destination-attractions")).toHaveCount(0);
  await expect(
    section.getByRole("heading", { name: "Dos propuestas para sumar al viaje" }),
  ).toHaveCount(0);
  await expect(page.getByText("Para conocer", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Termas del Salado" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Bosque Encantado" })).toHaveCount(0);
  await expect(section.locator(".destination-images + *")).toHaveCount(0);
  await expect(section.locator("xpath=following-sibling::*[1]")).toHaveId("ubicacion");
});

test("removes the home agenda banner and links to agenda from the destination", async ({ page }) => {
  await page.goto("/");

  const destination = page.locator("#general-belgrano");
  const expectedEvents = [
    "Festival Morfi",
    "Festival Mayor de Tango y Folklore",
    "Carnaval de General Belgrano",
    "Festival Megatropical",
    "Aniversario de General Belgrano",
    "Fiesta de la Bondiola y la Tradición",
    "Encuentro Gaucho a las Costas del Salado",
    "Fiestas Patronales de la Inmaculada Concepción",
  ];

  await expect(page.locator("#eventos")).toHaveCount(0);
  await expect(page.locator(".agenda-preview")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "General Belgrano, todo el año" }),
  ).toHaveCount(0);

  for (const eventName of expectedEvents) {
    await expect(page.getByRole("heading", { name: eventName })).toHaveCount(0);
  }

  const agendaLink = destination.getByRole("link", { name: "Agenda cultural" });
  await expect(agendaLink).toBeVisible();
  await expect(agendaLink).toHaveAttribute("href", "/agenda");
  await agendaLink.click();
  await expect(page).toHaveURL(/\/agenda$/);
  await expect(page.getByRole("heading", { name: "Agenda cultural", level: 1 })).toBeVisible();
});

test("reuses the editorial attractions block in the destination guide", async ({ page }) => {
  await page.goto("/general-belgrano");

  await expect(page.getByText("Dos clásicos", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Termas y naturaleza" })).toHaveCount(0);
  await expect(page.locator(".destination-cards")).toHaveCount(0);

  const attractions = page.locator(".destination-attractions");
  await expect(
    attractions.getByRole("heading", { name: "Dos propuestas para sumar al viaje" }),
  ).toBeVisible();
  await expect(attractions.getByRole("article")).toHaveCount(2);
  await expect(attractions.getByRole("heading", { name: "Termas del Salado" })).toBeVisible();
  await expect(attractions.getByRole("heading", { name: "Bosque Encantado" })).toBeVisible();
});

test("keeps the shortened home destination natural across target responsive widths", async ({ page }) => {
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await page.goto("/#general-belgrano");

    const section = page.locator("#general-belgrano");
    const lastPhoto = section.getByRole("img", {
      name: "Árboles y sendero de la costanera al atardecer",
    });
    await lastPhoto.scrollIntoViewIfNeeded();
    await expect
      .poll(() => lastPhoto.evaluate((image) => (image as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);

    const layout = await section.evaluate((element) => {
      const sectionBox = element.getBoundingClientRect();
      const links = Array.from(element.querySelectorAll<HTMLElement>(".text-link"));

      return {
        sectionInsideViewport:
          sectionBox.left >= -0.5 && sectionBox.right <= window.innerWidth + 0.5,
        linksInsideViewport: links.every((link) => {
          const box = link.getBoundingClientRect();
          return box.left >= -0.5 && box.right <= window.innerWidth + 0.5;
        }),
        noHorizontalOverflow:
          document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      };
    });

    expect(layout, `destination layout at ${width}px`).toEqual({
      sectionInsideViewport: true,
      linksInsideViewport: true,
      noHorizontalOverflow: true,
    });
    await expect(page.getByText("Para conocer", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Termas del Salado" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Bosque Encantado" })).toHaveCount(0);
    await expect(page.locator("#eventos")).toHaveCount(0);
  }
});

test("uses the same conceptual navigation order on desktop and mobile", async ({ page }) => {
  const expectedLabels = [
    "El Vagón",
    "Experiencia",
    "Galería",
    "Ubicación",
    "Disponibilidad",
    "General Belgrano",
    "Agenda",
  ];
  const expectedHrefs = [
    "/",
    "/#experiencia",
    "/#galeria",
    "/#ubicacion",
    "/#reservas",
    "/general-belgrano",
    "/agenda",
  ];

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const desktopLinks = page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link");
  await expect(desktopLinks).toContainText(expectedLabels);
  await expect(desktopLinks).toHaveCount(expectedHrefs.length);
  for (let index = 0; index < expectedHrefs.length; index += 1) {
    await expect(desktopLinks.nth(index)).toHaveAttribute("href", expectedHrefs[index]);
  }

  const desktopHeaderLayout = await page.locator(".header-inner").evaluate((header) => {
    const brand = header.querySelector<HTMLElement>(".brand-lockup");
    const nav = header.querySelector<HTMLElement>(".desktop-nav");
    const booking = header.querySelector<HTMLElement>(".header-booking");
    if (!brand || !nav || !booking) throw new Error("Desktop header controls are missing");
    const headerBox = header.getBoundingClientRect();
    const brandBox = brand.getBoundingClientRect();
    const navBox = nav.getBoundingClientRect();
    const bookingBox = booking.getBoundingClientRect();

    return {
      insideViewport: headerBox.left >= 0 && headerBox.right <= window.innerWidth,
      noOverlap: brandBox.right < navBox.left && navBox.right < bookingBox.left,
      noHorizontalOverflow:
        document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    };
  });
  expect(desktopHeaderLayout).toEqual({
    insideViewport: true,
    noOverlap: true,
    noHorizontalOverflow: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Abrir menú" }).click();
  const mobileLinks = page
    .getByRole("navigation", { name: "Navegación móvil" })
    .getByRole("link");
  await expect(mobileLinks).toContainText(expectedLabels);
  await expect(mobileLinks).toHaveCount(expectedHrefs.length);
  for (let index = 0; index < expectedHrefs.length; index += 1) {
    await expect(mobileLinks.nth(index)).toHaveAttribute("href", expectedHrefs[index]);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("opens the agenda from the primary navigation on desktop and mobile", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Abrir menú" }).click();
    const agendaLink = page
      .getByRole("navigation", { name: "Navegación móvil" })
      .getByRole("link", { name: /Agenda/ });
    await expect(agendaLink).toBeVisible();
    await expect(agendaLink).toHaveAttribute("href", "/agenda");
    await Promise.all([
      page.waitForURL(/\/agenda$/, { timeout: 15_000 }),
      agendaLink.click(),
    ]);
  } else {
    const agendaLink = page
      .getByRole("navigation", { name: "Navegación principal" })
      .getByRole("link", { name: "Agenda", exact: true });
    await expect(agendaLink).toBeVisible();
    await expect(agendaLink).toHaveAttribute("href", "/agenda");
    await Promise.all([
      page.waitForURL(/\/agenda$/, { timeout: 15_000 }),
      agendaLink.click(),
    ]);
  }

  await expect(page).toHaveURL(/\/agenda$/);
  await expect(page.getByRole("heading", { name: "Agenda cultural", level: 1 })).toBeVisible();
});

test("presents the recurring General Belgrano events on the agenda page", async ({ page }) => {
  test.skip(!process.env.DATABASE_URL, "requiere una base migrada");
  await page.goto("/agenda");

  await expect(page).toHaveTitle("Agenda cultural de General Belgrano | El Vagón");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Descubrí las fiestas, festivales y eventos recurrentes de General Belgrano y planificá tu próxima escapada a El Vagón.",
  );

  const section = page.locator("#eventos");
  const expectedEvents = [
    "Festival Morfi",
    "Festival Mayor de Tango y Folklore",
    "Carnaval de General Belgrano",
    "Festival Megatropical",
    "Aniversario de General Belgrano",
    "Fiesta de la Bondiola y la Tradición",
    "Encuentro Gaucho a las Costas del Salado",
    "Fiestas Patronales de la Inmaculada Concepción",
  ];

  await expect(section.getByRole("article")).toHaveCount(8);

  for (const eventName of expectedEvents) {
    await expect(section.getByRole("heading", { name: eventName })).toBeAttached();
  }

  const monthNav = section.getByRole("navigation", {
    name: "Recorrer eventos por mes",
  });
  const expectedMonths = [
    ["ENE", "#eventos-enero"],
    ["FEB", "#eventos-febrero"],
    ["AGO", "#eventos-agosto"],
    ["NOV", "#eventos-noviembre"],
    ["DIC", "#eventos-diciembre"],
  ] as const;

  for (const [label, href] of expectedMonths) {
    await expect(monthNav.getByRole("link", { name: label, exact: true })).toHaveAttribute(
      "href",
      href,
    );
  }

  const agendaLink = section.getByRole("link", { name: "Ver agenda oficial" });
  await expect(agendaLink).toHaveAttribute(
    "href",
    "https://generalbelgrano.tur.ar/novedades",
  );
  await expect(agendaLink).toHaveAttribute("target", "_blank");
  await expect(agendaLink).toHaveAttribute("rel", "noopener noreferrer");

  const photos = section.locator(".event-story-image img");
  await expect(photos).toHaveCount(8);
  for (let index = 0; index < 8; index += 1) {
    const photo = photos.nth(index);
    await photo.scrollIntoViewIfNeeded();
    await expect
      .poll(() => photo.evaluate((image) => (image as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }

  const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(structuredData.join(" ")).not.toContain('"@type":"Event"');

  const backLink = page.getByRole("link", { name: "Volver a El Vagón" });
  await expect(backLink).toHaveAttribute("href", "/");
  await Promise.all([page.waitForURL(/\/$/, { timeout: 15_000 }), backLink.click()]);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#el-vagon")).toBeVisible();
});

test("keeps the event journey usable across target responsive widths", async ({ page }) => {
  test.skip(!process.env.DATABASE_URL, "requiere una base migrada");
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await page.goto("/agenda");

    const layout = await page.locator("#eventos").evaluate((section) => {
      const sectionBox = section.getBoundingClientRect();
      const monthNav = section.querySelector<HTMLElement>(".events-month-nav");
      const header = document.querySelector<HTMLElement>(".header-inner");
      const desktopNav = document.querySelector<HTMLElement>(".desktop-nav");
      const desktopNavBox = desktopNav?.getBoundingClientRect();

      return {
        sectionInsideViewport:
          sectionBox.left >= -0.5 && sectionBox.right <= window.innerWidth + 0.5,
        noGlobalHorizontalOverflow:
          document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        monthNavigationCanScroll:
          monthNav !== null && monthNav.scrollWidth >= monthNav.clientWidth,
        headerInsideViewport:
          header !== null &&
          header.getBoundingClientRect().left >= -0.5 &&
          header.getBoundingClientRect().right <= window.innerWidth + 0.5,
        desktopNavigationFits:
          desktopNav === null ||
          getComputedStyle(desktopNav).display === "none" ||
          (desktopNavBox !== undefined &&
            desktopNavBox.left >= -0.5 &&
            desktopNavBox.right <= window.innerWidth + 0.5),
      };
    });

    expect(layout, `events layout at ${width}px`).toEqual({
      sectionInsideViewport: true,
      noGlobalHorizontalOverflow: true,
      monthNavigationCanScroll: true,
      headerInsideViewport: true,
      desktopNavigationFits: true,
    });
  }
});

test("supports month navigation, keyboard focus and reduced motion", async ({ page }) => {
  test.skip(!process.env.DATABASE_URL, "requiere una base migrada");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/agenda");

  const februaryLink = page
    .getByRole("navigation", { name: "Recorrer eventos por mes" })
    .getByRole("link", { name: "FEB", exact: true });
  await februaryLink.focus();
  await expect(februaryLink).toBeFocused();
  await februaryLink.press("Enter");
  await expect(page).toHaveURL(/#eventos-febrero$/);
  await expect(page.locator("#eventos-febrero")).toBeInViewport();

  const scrollBehavior = await page.locator("html").evaluate((element) =>
    getComputedStyle(element).scrollBehavior,
  );
  expect(scrollBehavior).toBe("auto");
});

test("keeps the location heading clear at compact mobile widths", async ({ page }) => {
  for (const width of [375, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/#ubicacion");

    const section = page.locator("#ubicacion");
    const heading = section.getByRole("heading", { name: "Dónde encontrarnos" });

    await expect(heading).toBeVisible();
    await expect(section).toContainText("Dorrego 747");
    await expect(section).toContainText("General Belgrano");
    await expect(section).toContainText("Buenos Aires, Argentina");
    await expect(page.getByText("Estamos en General Belgrano", { exact: true })).toHaveCount(0);

    const layout = await section.evaluate((element) => {
      const headingElement = element.querySelector<HTMLElement>("#location-title");
      if (!headingElement) throw new Error("Location heading is missing");

      const sectionBox = element.getBoundingClientRect();
      const headingBox = headingElement.getBoundingClientRect();

      return {
        headingInsideSection:
          headingBox.left >= sectionBox.left && headingBox.right <= sectionBox.right,
        noHorizontalOverflow:
          document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      };
    });

    expect(layout, `location layout at ${width}px`).toEqual({
      headingInsideSection: true,
      noHorizontalOverflow: true,
    });
  }
});

test("keeps the admin login balanced across responsive widths", async ({ page }) => {
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await page.goto("/admin/login");

    const layout = await page.locator(".admin-login-card").evaluate((card) => {
      const heading = card.querySelector("h1");
      const button = card.querySelector("button");
      if (!heading || !button) throw new Error("Admin login controls are missing");

      const cardBox = card.getBoundingClientRect();
      const headingBox = heading.getBoundingClientRect();
      const buttonBox = button.getBoundingClientRect();

      return {
        cardInsideViewport: cardBox.left >= 0 && cardBox.right <= window.innerWidth,
        headingInsideCard:
          headingBox.left >= cardBox.left && headingBox.right <= cardBox.right,
        buttonInsideCard:
          buttonBox.left >= cardBox.left && buttonBox.right <= cardBox.right,
        noHorizontalOverflow:
          document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      };
    });

    expect(layout, `admin login layout at ${width}px`).toEqual({
      cardInsideViewport: true,
      headingInsideCard: true,
      buttonInsideCard: true,
      noHorizontalOverflow: true,
    });
  }
});

test("shows the configured contact links", async ({ page }) => {
  await page.goto("/");

  const footer = page.getByRole("contentinfo");
  await expect(
    footer.getByRole("link", { name: "elvagongbelgrano.2024@gmail.com", exact: true }),
  ).toHaveAttribute(
    "href",
    "mailto:elvagongbelgrano.2024@gmail.com",
  );
  await expect(footer.getByRole("link", { name: "2241 572170", exact: true })).toHaveAttribute(
    "href",
    "tel:+5492241572170",
  );
  await expect(footer.getByRole("link", { name: /Instagram/i })).toBeVisible();
  await expect(footer).toContainText("Dorrego 747, General Belgrano, Buenos Aires, Argentina");
});

test("publishes canonical SEO metadata and valid lodging structured data", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("El Vagón | Alojamiento en General Belgrano");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.elvagon.com.ar",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://www.elvagon.com.ar",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Alojamiento para dos en General Belgrano",
    }),
  ).toBeVisible();

  const rawStructuredData = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  const structuredData = JSON.parse(rawStructuredData || "{}") as Record<string, unknown>;
  expect(structuredData).toMatchObject({
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": "https://www.elvagon.com.ar/#lodging",
    name: "El Vagón",
    url: "https://www.elvagon.com.ar",
    telephone: "2241 572170",
    email: "elvagongbelgrano.2024@gmail.com",
    checkinTime: "15:00",
    checkoutTime: "11:00",
  });
  expect(JSON.stringify(structuredData)).not.toContain("el-vagon.vercel.app");
  expect(structuredData).not.toHaveProperty("aggregateRating");
  expect(structuredData).not.toHaveProperty("review");
  expect(structuredData).not.toHaveProperty("priceRange");
});

test("exposes only public canonical URLs in robots and sitemap", async ({ page }) => {
  const robots = await page.request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsText = await robots.text();
  expect(robotsText).toContain("Disallow: /admin/");
  expect(robotsText).toContain("Disallow: /api/");
  expect(robotsText).toContain("Sitemap: https://www.elvagon.com.ar/sitemap.xml");

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapText = await sitemap.text();
  for (const url of [
    "https://www.elvagon.com.ar",
    "https://www.elvagon.com.ar/general-belgrano",
    "https://www.elvagon.com.ar/agenda",
  ]) {
    expect(sitemapText).toContain(`<loc>${url}</loc>`);
  }
  expect(sitemapText).not.toContain("/admin/");
  expect(sitemapText).not.toContain("/api/");
  expect(sitemapText).not.toContain("/para-conocer");
  expect(sitemapText).not.toContain("el-vagon.vercel.app");

  const retiredAttractionsPage = await page.request.get("/para-conocer");
  expect(retiredAttractionsPage.status()).toBe(404);
});

test("serves useful indexable public pages and retires accommodation", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });

  const pages = [{
      path: "/general-belgrano",
      title: "Qué hacer en General Belgrano | El Vagón",
      heading: "Qué hacer en General Belgrano",
    }];

  for (const item of pages) {
    const response = await page.goto(item.path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(item.title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: item.heading })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://www.elvagon.com.ar${item.path}`,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, follow",
    );
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  }

  const retired = await page.request.get("/alojamiento", { maxRedirects: 0 });
  expect(retired.status()).toBe(308);
  expect(retired.headers().location).toBe("/");

  expect(browserErrors).toEqual([]);
});

test("keeps private pages out of search results", async ({ page }) => {
  const response = await page.goto("/admin/login");
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex.*nofollow/,
  );
});
