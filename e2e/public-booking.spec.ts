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
  await page.getByRole("button", { name: /15 de agosto de 2026/i }).click();
  await page.getByRole("button", { name: /17 de agosto de 2026/i }).click();
  await page.getByLabel("Nombre completo").fill("Ana Pérez");
  await page.getByLabel("Cantidad de personas").selectOption("2");
  await page.getByRole("textbox", { name: "Consulta Opcional" }).fill("Llegamos después de las 18 hs");
  await page.getByRole("button", { name: /Consultar disponibilidad por WhatsApp/i }).click();

  await expect.poll(() => submitted).not.toBeNull();
  expect(submitted).toMatchObject({
    fullName: "Ana Pérez",
    guestCount: "2",
    checkIn: "2026-08-15",
    checkOut: "2026-08-17",
    question: "Llegamos después de las 18 hs",
  });
});

test("keeps the admin panel private and the calendar export token-protected", async ({ page }) => {
  const response = await page.goto("/admin/reservas");
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Administración" })).toBeVisible();
  await expect(page.getByText(/Ingresá con la cuenta de Google autorizada/)).toHaveCount(0);

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

test("shows the featured General Belgrano attractions", async ({ page }) => {
  await page.goto("/#general-belgrano");

  const section = page.locator("#general-belgrano");
  const attractions = [
    {
      name: "Termas del Salado",
      href: "https://share.google/TbrwB7rDFMfTW1iP4",
      alt: "Termas del Salado en General Belgrano",
    },
    {
      name: "Bosque Encantado",
      href: "https://share.google/KdC14zxLpOg0G6goV",
      alt: "Bosque Encantado de General Belgrano",
    },
  ];

  for (const attraction of attractions) {
    const article = section
      .getByRole("article")
      .filter({ has: page.getByRole("heading", { name: attraction.name }) });
    const link = article.getByRole("link", { name: "Ver ubicación" });

    await expect(article).toBeVisible();
    await expect(link).toHaveAttribute("href", attraction.href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");

    const photo = article.getByRole("img", { name: attraction.alt });
    await photo.scrollIntoViewIfNeeded();
    await expect
      .poll(() => photo.evaluate((image) => (image as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
});

test("presents the recurring General Belgrano events as an editorial journey", async ({
  page,
}) => {
  await page.goto("/#eventos");

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

  await expect(
    section.getByRole("heading", { name: "General Belgrano, todo el año" }),
  ).toBeVisible();
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
});

test("keeps the event journey usable across target responsive widths", async ({ page }) => {
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await page.goto("/#eventos");

    const layout = await page.locator("#eventos").evaluate((section) => {
      const sectionBox = section.getBoundingClientRect();
      const monthNav = section.querySelector<HTMLElement>(".events-month-nav");

      return {
        sectionInsideViewport:
          sectionBox.left >= -0.5 && sectionBox.right <= window.innerWidth + 0.5,
        noGlobalHorizontalOverflow:
          document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        monthNavigationCanScroll:
          monthNav !== null && monthNav.scrollWidth >= monthNav.clientWidth,
      };
    });

    expect(layout, `events layout at ${width}px`).toEqual({
      sectionInsideViewport: true,
      noGlobalHorizontalOverflow: true,
      monthNavigationCanScroll: true,
    });
  }
});

test("supports month navigation, keyboard focus and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#eventos");

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
  await expect(footer.getByRole("link", { name: "Email", exact: true })).toHaveAttribute(
    "href",
    "mailto:elvagongbelgrano.2024@gmail.com",
  );
  await expect(footer.getByRole("link", { name: /WhatsApp/i })).toHaveAttribute(
    "href",
    "https://wa.me/5492241572170",
  );
  await expect(footer.getByRole("link", { name: /Instagram/i })).toBeVisible();
});
